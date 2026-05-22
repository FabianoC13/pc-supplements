# P&C Supplements AWS + Payment Setup

## Frontend on S3

Upload these static files to the S3 website bucket:

- `index.html`
- `styles.css`
- `app.js`
- `config.js`
- `products.js`
- `logo.svg`

Before uploading, edit `config.js`:

```js
window.PC_CONFIG = {
  CULQI_PUBLIC_KEY: "pk_live_REPLACE_WITH_CULQI_PUBLIC_KEY",
  CULQI_RSA_ID: "",
  CULQI_RSA_PUBLIC_KEY: "",
  API_BASE_URL: "https://YOUR_EC2_API_DOMAIN",
  DEFAULT_PAYMENT_METHOD: "card",
};
```

The Culqi public key is safe in browser code. Culqi private keys and NOWPayments
API keys must stay on EC2.

## Backend on EC2

Run the Node server on EC2 and set these environment variables:

```sh
PORT=5173
HOST=0.0.0.0
CULQI_SECRET_KEY=sk_live_REPLACE_WITH_CULQI_SECRET_KEY
CULQI_API_BASE_URL=https://api.culqi.com
NOWPAYMENTS_API_KEY=np_live_REPLACE_WITH_NOWPAYMENTS_API_KEY
NOWPAYMENTS_IPN_SECRET=np_ipn_REPLACE_WITH_NOWPAYMENTS_IPN_SECRET
NOWPAYMENTS_API_BASE_URL=https://api.nowpayments.io
NOWPAYMENTS_PRICE_CURRENCY=pen
NOWPAYMENTS_FIXED_RATE=true
NOWPAYMENTS_FEE_PAID_BY_USER=false
PUBLIC_SITE_URL=https://YOUR_S3_OR_CLOUDFRONT_DOMAIN
PUBLIC_API_URL=https://YOUR_EC2_API_DOMAIN
CORS_ORIGINS=https://YOUR_S3_OR_CLOUDFRONT_DOMAIN
```

The API endpoints are:

- `GET /api/health`
- `POST /api/checkout/card`
- `POST /api/checkout/crypto`
- `POST /api/webhooks/nowpayments`

`POST /api/checkout/card` expects a Culqi token:

```json
{
  "token": "tkn_live_xxxxxxxxxxx",
  "email": "cliente@example.com",
  "items": [
    { "id": "retatrutide-20mg-vial", "quantity": 1 }
  ]
}
```

`POST /api/checkout/crypto` expects the same `email` and `items`, then creates a
NOWPayments hosted invoice and returns `invoiceUrl`.

The backend validates product IDs against `products.js`, charges `S/ 100.00` per
item, creates Culqi card charges with `capture: true`, and creates NOWPayments
crypto invoices with `price_currency=pen`.

The NOWPayments webhook validates `x-nowpayments-sig` with `NOWPAYMENTS_IPN_SECRET`.
The current implementation logs valid IPNs; production should persist order state
in a database before fulfillment.
