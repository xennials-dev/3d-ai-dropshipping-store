# Vendora — Production Deployment & Environment Guide

This guide covers deploying the **Vendora AI 3D Dropshipping Platform** to production on **Vercel** or a **Linux VPS (Hostinger, DigitalOcean, Hetzner, AWS)** with real payment gateways (**Stripe** & **Lemon Squeezy**), managed PostgreSQL (**Supabase** or **Neon**), and the **AI Concierge**.

---

## 1. Environment Variables Overview

Copy [`.env.example`](file:///c:/Users/tee/OneDrive/Desktop/3d-ai-dropshipping-store/.env.example) to `.env.local` for local development, or add these variables to your cloud host dashboard:

| Variable | Required in Prod? | Description & Example |
| :--- | :---: | :--- |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string with SSL enabled (e.g. Supabase, Neon, or self-hosted). |
| `STRIPE_SECRET_KEY` | **Yes** (for Stripe) | Stripe secret key (`sk_live_...` or `sk_test_...`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | Stripe publishable key (`pk_live_...` or `pk_test_...`). |
| `STRIPE_WEBHOOK_SECRET` | **Yes** (for Stripe) | Webhook signing secret (`whsec_...`) from Stripe Dashboard. |
| `LEMONSQUEEZY_API_KEY` | Optional | Lemon Squeezy API token (if using Lemon Squeezy). |
| `LEMONSQUEEZY_STORE_ID` | Optional | Lemon Squeezy Store ID. |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | Optional | Lemon Squeezy Webhook signing secret. |
| `OPENAI_API_KEY` | Optional | OpenAI API key for open-ended AI assistant replies (`sk-...`). |
| `OPENAI_MODEL` | Optional | Model identifier (defaults to `gpt-4o-mini`). |
| `NEXT_PUBLIC_APP_URL` | **Yes** | Public domain of the application (e.g. `https://vendora.store`). |

---

## 2. Database Setup (Supabase or Neon)

### Option A: Supabase (Recommended)
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings** → **Database**.
3. Under **Connection string**, select **URI** and copy the Transaction Pooler or Direct string:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require"
   ```
4. Vendora includes auto-seeding: the first time the application runs against an empty database, it creates the tables (`products`, `orders`, `order_items`, `subscribers`) and populates the starter dropshipping inventory.

### Option B: Neon Serverless PostgreSQL
1. Create a project at [neon.tech](https://neon.tech).
2. Copy the connection string from the dashboard:
   ```env
   DATABASE_URL="postgresql://[USER]:[PASSWORD]@[ENDPOINT].neon.tech/neondb?sslmode=require"
   ```

---

## 3. Stripe Payment Gateway Setup

### A. API Keys
1. In the [Stripe Dashboard](https://dashboard.stripe.com/apikeys), toggle between **Test mode** and **Live mode**.
2. Copy the **Secret key** into `STRIPE_SECRET_KEY`.
3. Copy the **Publishable key** into `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.

### B. Configuring the Webhook
1. Go to **Developers** → **Webhooks** → **Add an endpoint**.
2. Set the **Endpoint URL**:
   ```
   https://yourdomain.com/api/webhooks/stripe
   ```
3. Under **Events to send**, select:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
4. Click **Add endpoint**, then click **Reveal signing secret** (`whsec_...`).
5. Copy this value into `STRIPE_WEBHOOK_SECRET`.

### C. Testing Webhooks Locally with Stripe CLI
```bash
# Login to Stripe CLI
stripe login

# Forward webhook events to localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
Copy the webhook signing secret printed in your terminal into `.env.local`:
```env
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 4. Lemon Squeezy Setup (Alternative Gateway)

1. Create a store at [lemonsqueezy.com](https://lemonsqueezy.com).
2. Go to **Settings** → **API** to generate an API key (`LEMONSQUEEZY_API_KEY`).
3. Go to **Settings** → **Webhooks** → **Create webhook**.
4. Set the **URL**:
   ```
   https://yourdomain.com/api/webhooks/lemonsqueezy
   ```
5. Enter a secret passphrase and save it in `LEMONSQUEEZY_WEBHOOK_SECRET`.
6. Select events: `order_created`, `order_refunded`, `subscription_created`.

---

## 5. Deploying to Vercel

1. Push your repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "feat: complete dropshipping store with stripe and pglite"
   git remote add origin https://github.com/your-username/3d-ai-dropshipping-store.git
   git push -u origin main
   ```
2. Import the project into [vercel.com](https://vercel.com).
3. Under **Environment Variables**, add:
   - `DATABASE_URL` (Supabase or Neon)
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `NEXT_PUBLIC_APP_URL` (`https://your-vercel-domain.vercel.app`)
   - `OPENAI_API_KEY` (optional)
4. Click **Deploy**. Vercel will automatically build with Turbopack and deploy to their global edge network.

---

## 6. Deploying to a Linux VPS (Hostinger / Ubuntu)

### Step 1: Install Node.js 20+ and PM2
```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

### Step 2: Clone & Build
```bash
cd /var/www
git clone https://github.com/your-username/3d-ai-dropshipping-store.git
cd 3d-ai-dropshipping-store
npm install
cp .env.example .env.production
nano .env.production # Fill in your production keys and DATABASE_URL
npm run build
```

### Step 3: Run with PM2
```bash
pm2 start "npm start" --name "vendora-store"
pm2 save
pm2 startup
```

### Step 4: Configure Nginx & SSL
Create `/etc/nginx/sites-available/vendora`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Enable and provision Let's Encrypt certificate:
```bash
sudo ln -s /etc/nginx/sites-available/vendora /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
