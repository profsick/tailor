# Tailor API (Node.js + Express + MongoDB)

This backend replaces Supabase for your tailor project.

## What it does

- Save a new order
- List all orders for admin dashboard
- Mark an order as completed
- Delete one order
- Delete all orders
- Return status for specific order IDs (used by customer "Your Orders" page)

## Setup

1. Open terminal in this folder:
   - `cd my-node-express-mongodb-app`
2. Install dependencies:
   - `npm install`
3. Create `.env` from `.env.example`
4. Start server:
   - `npm run dev`

Server default URL: `http://localhost:3000`

## API Endpoints

- `GET /api/health`
- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/statuses?ids=<id1,id2,...>`
- `PATCH /api/orders/:id/complete`
- `DELETE /api/orders/:id`
- `DELETE /api/orders`
