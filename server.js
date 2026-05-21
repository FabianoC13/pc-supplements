import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PADDLE_VERSION = "1";
const PRODUCT_PRICE_AMOUNT = "10000";
const PRODUCT_PRICE_LABEL = "S/ 100.00";
const PRODUCT_CURRENCY = "PEN";

const PRODUCT_IDS = new Set(["1", "2", "3", "4"]);
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

function loadEnvFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (!existsSync(filePath)) return;

  for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function json(res, statusCode, payload) {
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

function normalizeCartItems(rawItems) {
  const quantities = new Map();

  for (const item of Array.isArray(rawItems) ? rawItems : []) {
    const id = String(item?.id || "");
    if (!PRODUCT_IDS.has(id)) continue;
    quantities.set(id, (quantities.get(id) || 0) + 1);
  }

  return Array.from(quantities, ([id, quantity]) => ({ id, quantity }));
}

function paddleApiBaseUrl() {
  if (process.env.PADDLE_API_BASE_URL) return process.env.PADDLE_API_BASE_URL;
  return process.env.PADDLE_API_KEY?.includes("_sdbx_")
    ? "https://sandbox-api.paddle.com"
    : "https://api.paddle.com";
}

function buildPaddleTransaction(items) {
  return {
    collection_mode: "automatic",
    currency_code: PRODUCT_CURRENCY,
    items: items.map((item) => ({
      quantity: item.quantity,
      price: {
        description: `P&C Supplements placeholder item ${item.id}`,
        name: PRODUCT_PRICE_LABEL,
        billing_cycle: null,
        trial_period: null,
        tax_mode: "account_setting",
        unit_price: {
          amount: PRODUCT_PRICE_AMOUNT,
          currency_code: PRODUCT_CURRENCY,
        },
        product: {
          name: `P&C Supplements item ${item.id}`,
          description: "Supplement placeholder product for the Peru storefront.",
          tax_category: "standard",
        },
      },
    })),
    checkout: {
      url: process.env.PADDLE_CHECKOUT_URL || null,
    },
    custom_data: {
      brand: "P&C Supplements",
      location: "Peru",
      currency: PRODUCT_CURRENCY,
    },
  };
}

async function createPaddleCheckout(req, res) {
  const apiKey = process.env.PADDLE_API_KEY;
  if (!apiKey) {
    json(res, 503, {
      error: "Paddle API key missing. Set PADDLE_API_KEY on the server.",
    });
    return;
  }

  let body;
  try {
    body = await readRequestJson(req);
  } catch {
    json(res, 400, { error: "Invalid checkout request." });
    return;
  }

  const items = normalizeCartItems(body.items);
  if (!items.length) {
    json(res, 400, { error: "Cart is empty." });
    return;
  }

  const paddleResponse = await fetch(`${paddleApiBaseUrl()}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Paddle-Version": PADDLE_VERSION,
    },
    body: JSON.stringify(buildPaddleTransaction(items)),
  });

  const paddleBody = await paddleResponse.json().catch(() => ({}));
  if (!paddleResponse.ok) {
    json(res, paddleResponse.status, {
      error: paddleBody?.error?.detail || "Paddle rejected the checkout request.",
      requestId: paddleBody?.meta?.request_id,
    });
    return;
  }

  json(res, 201, {
    transactionId: paddleBody.data?.id,
    checkoutUrl: paddleBody.data?.checkout?.url,
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
    res.end(file);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "POST" && req.url === "/api/checkout") {
      await createPaddleCheckout(req, res);
      return;
    }

    if (req.method === "GET" || req.method === "HEAD") {
      await serveStatic(req, res);
      return;
    }

    res.writeHead(405, { Allow: "GET, HEAD, POST" });
    res.end("Method not allowed");
  } catch {
    json(res, 500, { error: "Unexpected server error." });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`P&C Supplements running at http://127.0.0.1:${PORT}/`);
});
