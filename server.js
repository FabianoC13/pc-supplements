import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRODUCT_PRICE_AMOUNT = 10000;
const PRODUCT_PRICE_LABEL = "S/ 100.00";
const PRODUCT_CURRENCY = "PEN";
const CULQI_SECRET_PLACEHOLDER = "sk_test_REPLACE_WITH_CULQI_SECRET_KEY";
const DEFAULT_CORS_ORIGINS = [
  "http://127.0.0.1:5173",
  "http://localhost:5173",
  "https://fabianoc13.github.io",
];
const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

loadEnvFile(".env.local");
loadEnvFile(".env");

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";
const CULQI_API_BASE_URL = process.env.CULQI_API_BASE_URL || "https://api.culqi.com";
const PRODUCTS = loadProducts();
const PRODUCT_IDS = new Set(PRODUCTS.map((product) => product.id));
const CORS_ORIGINS = new Set(
  (process.env.CORS_ORIGINS || DEFAULT_CORS_ORIGINS.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
);

function loadEnvFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function loadProducts() {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(path.join(__dirname, "products.js"), "utf8"), context, {
    timeout: 1000,
  });
  return Array.isArray(context.window.PC_PRODUCTS) ? context.window.PC_PRODUCTS : [];
}

function applyCors(req, res) {
  const origin = req.headers.origin;
  if (!origin) return;
  if (!CORS_ORIGINS.has("*") && !CORS_ORIGINS.has(origin)) return;

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Max-Age", "86400");
}

function json(req, res, statusCode, payload) {
  applyCors(req, res);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

async function readRequestJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeCartItems(rawItems) {
  const quantities = new Map();

  for (const item of Array.isArray(rawItems) ? rawItems : []) {
    const id = String(item?.id || "");
    if (!PRODUCT_IDS.has(id)) continue;
    const quantity = Math.max(1, Math.min(Number(item?.quantity) || 1, 50));
    quantities.set(id, (quantities.get(id) || 0) + quantity);
  }

  return Array.from(quantities, ([id, quantity]) => {
    const product = PRODUCTS.find((entry) => entry.id === id);
    return {
      id,
      quantity,
      title: product?.name || id,
    };
  });
}

function getCulqiSecretKey() {
  return process.env.CULQI_SECRET_KEY || "";
}

function isCulqiSecretConfigured() {
  const key = getCulqiSecretKey();
  return Boolean(key && key !== CULQI_SECRET_PLACEHOLDER);
}

function buildChargePayload({ items, token, email }) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const productSummary = items.map((item) => `${item.quantity}x ${item.title}`).join(", ");

  return {
    amount: totalQuantity * PRODUCT_PRICE_AMOUNT,
    currency_code: PRODUCT_CURRENCY,
    email,
    source_id: token,
    capture: true,
    description: `P&C Supplements - ${totalQuantity} producto(s) a ${PRODUCT_PRICE_LABEL}`,
    metadata: {
      product_count: String(totalQuantity),
      products: productSummary.slice(0, 500),
      channel: "web",
      location: "Peru",
    },
  };
}

async function createCulqiCharge(req, res) {
  if (!isCulqiSecretConfigured()) {
    json(req, res, 503, {
      error: "Culqi private key missing. Set CULQI_SECRET_KEY on the EC2 server.",
      code: "CULQI_SECRET_MISSING",
    });
    return;
  }

  let body;
  try {
    body = await readRequestJson(req);
  } catch {
    json(req, res, 400, { error: "Invalid checkout request." });
    return;
  }

  const token = String(body.token || body.source_id || "").trim();
  const email = String(body.email || "").trim();
  const items = normalizeCartItems(body.items);

  if (!token) {
    json(req, res, 400, { error: "Payment token is required." });
    return;
  }

  if (!isValidEmail(email)) {
    json(req, res, 400, { error: "A valid email is required." });
    return;
  }

  if (!items.length) {
    json(req, res, 400, { error: "Cart is empty." });
    return;
  }

  const culqiResponse = await fetch(`${CULQI_API_BASE_URL}/v2/charges`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getCulqiSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildChargePayload({ items, token, email })),
  });

  const culqiBody = await culqiResponse.json().catch(() => ({}));
  if (!culqiResponse.ok) {
    json(req, res, culqiResponse.status, {
      error: culqiBody?.merchant_message || culqiBody?.user_message || culqiBody?.message || "Culqi rejected the charge.",
      code: culqiBody?.code,
      declineCode: culqiBody?.decline_code,
    });
    return;
  }

  json(req, res, 201, {
    chargeId: culqiBody.id,
    amount: culqiBody.amount,
    currency: culqiBody.currency_code,
    status: culqiBody.outcome?.type || "created",
  });
}

async function serveStatic(req, res) {
  const requestUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const requestedPath = path.normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(__dirname, requestedPath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": MIME_TYPES[path.extname(filePath)] || "application/octet-stream",
    });
    if (req.method !== "HEAD") res.end(file);
    else res.end();
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  try {
    const requestUrl = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "OPTIONS" && requestUrl.pathname.startsWith("/api/")) {
      applyCors(req, res);
      res.writeHead(204);
      res.end();
      return;
    }

    if (req.method === "GET" && requestUrl.pathname === "/api/health") {
      json(req, res, 200, {
        ok: true,
        provider: "culqi",
        culqiConfigured: isCulqiSecretConfigured(),
      });
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/checkout") {
      await createCulqiCharge(req, res);
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      await serveStatic(req, res);
      return;
    }

    res.writeHead(405, { Allow: "GET, HEAD, POST, OPTIONS" });
    res.end("Method not allowed");
  } catch {
    json(req, res, 500, { error: "Unexpected server error." });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`P&C Supplements running at http://${HOST}:${PORT}/`);
});
