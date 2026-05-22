# P&C Supplements AWS + Culqi Setup

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
};
```

The Culqi public key is safe in browser code. Do not put the private key in S3.

## Backend on EC2

Run the Node server on EC2 and set these environment variables:

```sh
PORT=5173
HOST=0.0.0.0
CULQI_SECRET_KEY=sk_live_REPLACE_WITH_CULQI_SECRET_KEY
CULQI_API_BASE_URL=https://api.culqi.com
CORS_ORIGINS=https://YOUR_S3_OR_CLOUDFRONT_DOMAIN
```

The API endpoints are:

- `GET /api/health`
- `POST /api/checkout`

`POST /api/checkout` expects:

```json
{
  "token": "tkn_live_xxxxxxxxxxx",
  "email": "cliente@example.com",
  "items": [
    { "id": "retatrutide-20mg-vial", "quantity": 1 }
  ]
}
```

The backend validates product IDs against `products.js`, charges `S/ 100.00` per item, and creates a Culqi charge with `capture: true`.
