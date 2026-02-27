# Backend Guide (Plain English)

This version is written to be easy to read first, and useful when you come back later to study backend.

No confusing labels. Just:

- what each backend part does,
- what happens when an API request comes in,

## Full function-by-function reference

A separate detailed file now covers every backend/DB function and every page JS function in depth:

- [FUNCTION_REFERENCE_GUIDE.md](FUNCTION_REFERENCE_GUIDE.md)

---

Code: [my-node-express-mongodb-app/src/app.js#L27](my-node-express-mongodb-app/src/app.js#L27)

Mounts all endpoints under `/api`.

---

## All API routes and what they do

### Create order

- Route code: [my-node-express-mongodb-app/src/routes/index.js#L6](my-node-express-mongodb-app/src/routes/index.js#L6)
- URL: `POST /api/orders`
- Uses controller: `createOrder`

### List all orders

- Route code: [my-node-express-mongodb-app/src/routes/index.js#L7](my-node-express-mongodb-app/src/routes/index.js#L7)
- URL: `GET /api/orders`
- Uses controller: `listOrders`

### Get statuses for selected orders

- Route code: [my-node-express-mongodb-app/src/routes/index.js#L8](my-node-express-mongodb-app/src/routes/index.js#L8)
- URL: `GET /api/orders/statuses?ids=id1,id2`
- Uses controller: `getOrderStatuses`

### Mark order completed

- Route code: [my-node-express-mongodb-app/src/routes/index.js#L9](my-node-express-mongodb-app/src/routes/index.js#L9)
- URL: `PATCH /api/orders/:id/complete`
- Uses controller: `markCompleted`

### Delete one order

- Route code: [my-node-express-mongodb-app/src/routes/index.js#L10](my-node-express-mongodb-app/src/routes/index.js#L10)
- URL: `DELETE /api/orders/:id`
- Uses controller: `deleteOrder`

### Delete all orders

- Route code: [my-node-express-mongodb-app/src/routes/index.js#L11](my-node-express-mongodb-app/src/routes/index.js#L11)
- URL: `DELETE /api/orders`
- Uses controller: `deleteAllOrders`

---

## Controller functions explained

### `normalizeItems(items)`

Code: [my-node-express-mongodb-app/src/controllers/orderController.js#L4-L13](my-node-express-mongodb-app/src/controllers/orderController.js#L4-L13)

Purpose:

- Makes incoming item data consistent.
- Handles slightly different shapes from frontend.
- Ensures each item has clothing/fabric/quantity/price.

### `createOrder(req, res)`

Code: [my-node-express-mongodb-app/src/controllers/orderController.js#L15-L54](my-node-express-mongodb-app/src/controllers/orderController.js#L15-L54)

Purpose:

- Validates required fields (`name`, `phone`).
- Normalizes items.
- Calculates fallback total if needed.
- Saves new order in DB.
- Returns `id`, `status`, `createdAt`.

### `listOrders(_req, res)`

Code: [my-node-express-mongodb-app/src/controllers/orderController.js#L56-L80](my-node-express-mongodb-app/src/controllers/orderController.js#L56-L80)

Purpose:

- Fetches all orders (latest first).
- Maps DB output to frontend-friendly response shape.

### `getOrderStatuses(req, res)`

Code: [my-node-express-mongodb-app/src/controllers/orderController.js#L82-L107](my-node-express-mongodb-app/src/controllers/orderController.js#L82-L107)

Purpose:

- Reads `ids` from query string.
- Keeps only valid ObjectIds.
- Returns only `{ id, status }` for those orders.

### `markCompleted(req, res)`

Code: [my-node-express-mongodb-app/src/controllers/orderController.js#L109-L133](my-node-express-mongodb-app/src/controllers/orderController.js#L109-L133)

Purpose:

- Validates order id.
- Updates status to `Completed`.
- Returns updated status.

### `deleteOrder(req, res)`

Code: [my-node-express-mongodb-app/src/controllers/orderController.js#L135-L155](my-node-express-mongodb-app/src/controllers/orderController.js#L135-L155)

Purpose:

- Validates order id.
- Deletes one order.
- Returns success/failure message.

### `deleteAllOrders(_req, res)`

Code: [my-node-express-mongodb-app/src/controllers/orderController.js#L157-L165](my-node-express-mongodb-app/src/controllers/orderController.js#L157-L165)

Purpose:

- Deletes all order documents.
- Used by admin “Delete All”.

---

## Database model explained

### Item schema

Code: [my-node-express-mongodb-app/src/models/Order.js#L3-L27](my-node-express-mongodb-app/src/models/Order.js#L3-L27)

Each cart item in an order has:

- `clothing`
- `fabric`
- `quantity`
- `price`

### Order schema

Code: [my-node-express-mongodb-app/src/models/Order.js#L29-L84](my-node-express-mongodb-app/src/models/Order.js#L29-L84)

Each order has:

- customer info (`name`, `email`, `phone`)
- instructions
- item array
- measurements
- summary fields (`clothing`, `fabric`, `total`)
- status (`Pending` or `Completed`)
- auto timestamps (`createdAt`, `updatedAt`)

### Model export

Code: [my-node-express-mongodb-app/src/models/Order.js#L86](my-node-express-mongodb-app/src/models/Order.js#L86)

Creates the `Order` model used in controller CRUD operations.

---

## JavaScript concepts used in this backend

### Async/await and try/catch

Used in startup and all controllers to handle DB operations safely.

### Destructuring

Used to cleanly read values from `req.body` and `req.params`.

### Array tools (`map`, `reduce`, `filter`)

Used for normalization, totals, and validating IDs.

### Optional chaining (`?.`)

Used to safely read nested item fields.

### Early returns

Used for clean validation flow (400/404 fast exits).

---

## Where to edit when you want changes

- Change startup/port behavior → [my-node-express-mongodb-app/src/server.js](my-node-express-mongodb-app/src/server.js)
- Change middleware/static/root behavior → [my-node-express-mongodb-app/src/app.js](my-node-express-mongodb-app/src/app.js)
- Change DB connection logic → [my-node-express-mongodb-app/src/config/db.js](my-node-express-mongodb-app/src/config/db.js)
- Add/change API route path → [my-node-express-mongodb-app/src/routes/index.js](my-node-express-mongodb-app/src/routes/index.js)
- Change business logic/validation → [my-node-express-mongodb-app/src/controllers/orderController.js](my-node-express-mongodb-app/src/controllers/orderController.js)
- Change order data fields/rules → [my-node-express-mongodb-app/src/models/Order.js](my-node-express-mongodb-app/src/models/Order.js)

---

## Common errors in simple words

### `Could not read package.json`

You ran `npm start` in wrong folder.

### `EADDRINUSE`

Port already occupied by another process.

### `querySrv ECONNREFUSED`

DNS/network issue resolving Atlas SRV URI.

### `Cannot GET /`

Root route/static serving missing or old server version was running.

---

## One-screen revision summary

If you forget everything, remember this:

- `server.js` starts things.
- `app.js` wires middleware and routes.
- `routes/index.js` points URLs to controller functions.
- `orderController.js` contains all backend behavior.
- `models/Order.js` defines what data looks like in MongoDB.
- `db.js` connects to Atlas.

That’s the whole backend in one mental model.
