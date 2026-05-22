import { createServer } from "node:http";
import crypto from "node:crypto";
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
const NOWPAYMENTS_API_KEY_PLACEHOLDER = "np_test_REPLACE_WITH_NOWPAYMENTS_API_KEY";
const NOWPAYMENTS_IPN_SECRET_PLACEHOLDER = "np_ipn_REPLACE_WITH_NOWPAYMENTS_IPN_SECRET";
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
const NOWPAYMENTS_API_BASE_URL = process.env.NOWPAYMENTS_API_BASE_URL || "https://api.nowpayments.io";
const NOWPAYMENTS_PRICE_CURRENCY = (process.env.NOWPAYMENTS_PRICE_CURRENCY || PRODUCT_CURRENCY).toLowerCase();
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

function getNowPaymentsApiKey() {
  return process.env.NOWPAYMENTS_API_KEY || "";
}

function isNowPaymentsConfigured() {
  const key = getNowPaymentsApiKey();
  return Boolean(key && key !== NOWPAYMENTS_API_KEY_PLACEHOLDER);
}

function getNowPaymentsIpnSecret() {
  return process.env.NOWPAYMENTS_IPN_SECRET || "";
}

function isNowPaymentsIpnConfigured() {
  const secret = getNowPaymentsIpnSecret();
  return Boolean(secret && secret !== NOWPAYMENTS_IPN_SECRET_PLACEHOLDER);
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/$/, "");
}

function getPublicSiteUrl(req) {
  return trimTrailingSlash(process.env.PUBLIC_SITE_URL || req.headers.origin || `http://${req.headers.host}`);
}

function getPublicApiUrl(req) {
  return trimTrailingSlash(process.env.PUBLIC_API_URL || `http://${req.headers.host}`);
}

function parseBoolean(value, fallback) {
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
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

function createOrderId() {
  return `pc-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

function buildNowPaymentsInvoicePayload({ req, items, email }) {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const productSummary = items.map((item) => `${item.quantity}x ${item.title}`).join(", ");
  const orderId = createOrderId();
  const siteUrl = getPublicSiteUrl(req);
  const apiUrl = getPublicApiUrl(req);
  const payload = {
    price_amount: totalQuantity * (PRODUCT_PRICE_AMOUNT / 100),
    price_currency: NOWPAYMENTS_PRICE_CURRENCY,
    order_id: orderId,
    order_description: `P&C Supplements - ${totalQuantity} producto(s): ${productSummary}`.slice(0, 500),
    ipn_callback_url: `${apiUrl}/api/webhooks/nowpayments`,
    success_url: `${siteUrl}/?payment=crypto-success&order_id=${encodeURIComponent(orderId)}`,
    cancel_url: `${siteUrl}/?payment=crypto-cancel&order_id=${encodeURIComponent(orderId)}`,
    is_fixed_rate: parseBoolean(process.env.NOWPAYMENTS_FIXED_RATE, true),
    is_fee_paid_by_user: parseBoolean(process.env.NOWPAYMENTS_FEE_PAID_BY_USER, false),
  };

  if (process.env.NOWPAYMENTS_PAY_CURRENCY) {
    payload.pay_currency = process.env.NOWPAYMENTS_PAY_CURRENCY.toLowerCase();
  }

  return {
    orderId,
    payload,
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

async function createNowPaymentsInvoice(req, res) {
  if (!isNowPaymentsConfigured()) {
    json(req, res, 503, {
      error: "NOWPayments API key missing. Set NOWPAYMENTS_API_KEY on the EC2 server.",
      code: "NOWPAYMENTS_API_KEY_MISSING",
    });
    return;
  }

  let body;
  try {
    body = await readRequestJson(req);
  } catch {
    json(req, res, 400, { error: "Invalid crypto checkout request." });
    return;
  }

  const email = String(body.email || "").trim();
  const items = normalizeCartItems(body.items);

  if (!isValidEmail(email)) {
    json(req, res, 400, { error: "A valid email is required." });
    return;
  }

  if (!items.length) {
    json(req, res, 400, { error: "Cart is empty." });
    return;
  }

  const { orderId, payload } = buildNowPaymentsInvoicePayload({ req, items, email });
  const nowPaymentsResponse = await fetch(`${NOWPAYMENTS_API_BASE_URL}/v1/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": getNowPaymentsApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const nowPaymentsBody = await nowPaymentsResponse.json().catch(() => ({}));
  if (!nowPaymentsResponse.ok) {
    json(req, res, nowPaymentsResponse.status, {
      error: nowPaymentsBody?.message || nowPaymentsBody?.error || "NOWPayments rejected the invoice.",
      code: nowPaymentsBody?.code,
    });
    return;
  }

  json(req, res, 201, {
    orderId,
    invoiceId: nowPaymentsBody.id,
    invoiceUrl: nowPaymentsBody.invoice_url,
  });
}

function sortForNowPayments(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return Object.keys(value)
    .sort()
    .reduce((sorted, key) => {
      sorted[key] = sortForNowPayments(value[key]);
      return sorted;
    }, {});
}

function isValidNowPaymentsSignature(req, body) {
  if (!isNowPaymentsIpnConfigured()) return false;
  const signature = req.headers["x-nowpayments-sig"];
  if (!signature || typeof signature !== "string") return false;

  const expected = crypto
    .createHmac("sha512", getNowPaymentsIpnSecret())
    .update(JSON.stringify(sortForNowPayments(body)))
    .digest("hex");

  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature.toLowerCase());
  return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

async function handleNowPaymentsWebhook(req, res) {
  let body;
  try {
    body = await readRequestJson(req);
  } catch {
    json(req, res, 400, { error: "Invalid NOWPayments webhook payload." });
    return;
  }

  if (!isValidNowPaymentsSignature(req, body)) {
    json(req, res, 401, { error: "Invalid NOWPayments signature." });
    return;
  }

  console.log("NOWPayments IPN", {
    paymentId: body.payment_id,
    invoiceId: body.invoice_id,
    orderId: body.order_id,
    status: body.payment_status,
  });

  json(req, res, 200, { received: true });
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
        providers: ["culqi", "nowpayments"],
        culqiConfigured: isCulqiSecretConfigured(),
        nowpaymentsConfigured: isNowPaymentsConfigured(),
        nowpaymentsIpnConfigured: isNowPaymentsIpnConfigured(),
      });
      return;
    }

    if (req.method === "POST" && ["/api/checkout", "/api/checkout/card"].includes(requestUrl.pathname)) {
      await createCulqiCharge(req, res);
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/checkout/crypto") {
      await createNowPaymentsInvoice(req, res);
      return;
    }

    if (req.method === "POST" && requestUrl.pathname === "/api/webhooks/nowpayments") {
      await handleNowPaymentsWebhook(req, res);
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
