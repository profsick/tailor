# Function Reference Guide (Backend + DB + Page JavaScript)

This is your full function-by-function manual.

- Every important backend/database function is explained.
- Every real page JavaScript function is explained.
- Each item has a clickable code reference.

Read this when studying. Keep `PROJECT_WORKFLOW_GUIDE.md` for big-picture overview.

---

## Quick Jump

- [Backend startup functions](#backend-startup-functions)
- [Backend app setup functions](#backend-app-setup-functions)
- [Backend route mappings](#backend-route-mappings)
- [Backend controller functions](#backend-controller-functions)
- [Database model functions/definitions](#database-model-functionsdefinitions)
- [Page JS functions in script.js](#page-js-functions-in-scriptjs)
- [Page JS functions in admin.js](#page-js-functions-in-adminjs)

---

## Backend startup functions

### `startServer()`

- Code: [my-node-express-mongodb-app/src/server.js](my-node-express-mongodb-app/src/server.js#L7-L19)
- What it does:
  - Starts your backend in the correct order.
  - First waits for DB connection (`connectDB`).
  - Then starts HTTP server (`app.listen`).
  - If anything fails, logs clear error and exits process.
- Why it matters:
  - Prevents a half-working server (running API with broken DB).

### `connectDB()`

- Code: [my-node-express-mongodb-app/src/config/db.js](my-node-express-mongodb-app/src/config/db.js#L3-L14)
- What it does:
  - Reads `MONGODB_URI` from env.
  - Validates it exists.
  - Connects Mongoose to MongoDB Atlas.
- Why it matters:
  - Every order API depends on this connection being alive.

---

## Backend app setup functions

### `app.use(cors(...))`

- Code: [my-node-express-mongodb-app/src/app.js](my-node-express-mongodb-app/src/app.js#L8-L12)
- What it does:
  - Allows browser pages to call your backend without CORS blocking.

### `app.use(express.json(...))`

- Code: [my-node-express-mongodb-app/src/app.js](my-node-express-mongodb-app/src/app.js#L13)
- What it does:
  - Converts JSON request body into `req.body` object.
  - Used heavily in order creation/update APIs.

### `app.use(express.urlencoded(...))`

- Code: [my-node-express-mongodb-app/src/app.js](my-node-express-mongodb-app/src/app.js#L14)
- What it does:
  - Supports form-like payloads (`application/x-www-form-urlencoded`).

### `app.use(express.static(...))`

- Code: [my-node-express-mongodb-app/src/app.js](my-node-express-mongodb-app/src/app.js#L16-L17)
- What it does:
  - Serves your frontend files directly from the project root.
  - Lets backend URL also show your page assets.

### `app.get("/", ...)`

- Code: [my-node-express-mongodb-app/src/app.js](my-node-express-mongodb-app/src/app.js#L19-L21)
- What it does:
  - Sends `index.html` on base URL.
  - Fixes `Cannot GET /`.

### `app.get("/api/health", ...)`

- Code: [my-node-express-mongodb-app/src/app.js](my-node-express-mongodb-app/src/app.js#L23-L25)
- What it does:
  - Lightweight “server alive” endpoint.

### `app.use("/api", routes)`

- Code: [my-node-express-mongodb-app/src/app.js](my-node-express-mongodb-app/src/app.js#L27)
- What it does:
  - Mounts all route definitions under `/api` prefix.

---

## Backend route mappings

These lines connect URL → controller function.

- `POST /api/orders` → `createOrder`
  - Code: [my-node-express-mongodb-app/src/routes/index.js](my-node-express-mongodb-app/src/routes/index.js#L6)
- `GET /api/orders` → `listOrders`
  - Code: [my-node-express-mongodb-app/src/routes/index.js](my-node-express-mongodb-app/src/routes/index.js#L7)
- `GET /api/orders/statuses` → `getOrderStatuses`
  - Code: [my-node-express-mongodb-app/src/routes/index.js](my-node-express-mongodb-app/src/routes/index.js#L8)
- `PATCH /api/orders/:id/complete` → `markCompleted`
  - Code: [my-node-express-mongodb-app/src/routes/index.js](my-node-express-mongodb-app/src/routes/index.js#L9)
- `DELETE /api/orders/:id` → `deleteOrder`
  - Code: [my-node-express-mongodb-app/src/routes/index.js](my-node-express-mongodb-app/src/routes/index.js#L10)
- `DELETE /api/orders` → `deleteAllOrders`
  - Code: [my-node-express-mongodb-app/src/routes/index.js](my-node-express-mongodb-app/src/routes/index.js#L11)

---

## Backend controller functions

### `normalizeItems(items)`

- Code: [my-node-express-mongodb-app/src/controllers/orderController.js](my-node-express-mongodb-app/src/controllers/orderController.js#L4-L13)
- What it does:
  - Converts incoming cart item data into a stable shape.
  - Handles optional/nested values safely.
  - Ensures each item has: `clothing`, `fabric`, `quantity`, `price`.
- Why it matters:
  - Frontend payload can vary; backend saves clean and consistent data.

### `createOrder(req, res)`

- Code: [my-node-express-mongodb-app/src/controllers/orderController.js](my-node-express-mongodb-app/src/controllers/orderController.js#L15-L54)
- What it does step-by-step:
  1. Reads user data from `req.body`.
  2. Validates required fields (`name`, `phone`).
  3. Normalizes items with `normalizeItems`.
  4. Calculates fallback total if frontend total is missing.
  5. Builds DB payload with clean types/trimmed strings.
  6. Saves order using `Order.create`.
  7. Returns minimal success response (`id`, `status`, `createdAt`).
- Error handling:
  - `400` for missing required fields.
  - `500` for unexpected/server/DB errors.

### `listOrders(_req, res)`

- Code: [my-node-express-mongodb-app/src/controllers/orderController.js](my-node-express-mongodb-app/src/controllers/orderController.js#L56-L80)
- What it does:
  - Fetches all orders sorted by latest first.
  - Maps DB documents to frontend-ready response format.
- Why mapping is useful:
  - Keeps frontend response stable even if DB internals evolve.

### `getOrderStatuses(req, res)`

- Code: [my-node-express-mongodb-app/src/controllers/orderController.js](my-node-express-mongodb-app/src/controllers/orderController.js#L82-L107)
- What it does:
  - Reads query `ids=id1,id2,...`.
  - Splits + trims IDs.
  - Keeps only valid Mongo ObjectIds.
  - Queries only `_id` and `status`.
  - Returns status list for customer tracking page.
- Why it matters:
  - Efficient status-only sync (doesn’t fetch full orders).

### `markCompleted(req, res)`

- Code: [my-node-express-mongodb-app/src/controllers/orderController.js](my-node-express-mongodb-app/src/controllers/orderController.js#L109-L133)
- What it does:
  - Validates order ID format.
  - Updates status to `Completed`.
  - Returns updated order status.
- Errors:
  - `400` invalid ID format.
  - `404` order not found.
  - `500` DB/server error.

### `deleteOrder(req, res)`

- Code: [my-node-express-mongodb-app/src/controllers/orderController.js](my-node-express-mongodb-app/src/controllers/orderController.js#L135-L155)
- What it does:
  - Validates ID.
  - Deletes one order by ID.
  - Returns delete confirmation.

### `deleteAllOrders(_req, res)`

- Code: [my-node-express-mongodb-app/src/controllers/orderController.js](my-node-express-mongodb-app/src/controllers/orderController.js#L157-L165)
- What it does:
  - Deletes all orders in the collection.
- Caution:
  - Destructive operation. No undo.

---

## Database model functions/definitions

### `itemSchema`

- Code: [my-node-express-mongodb-app/src/models/Order.js](my-node-express-mongodb-app/src/models/Order.js#L3-L27)
- What it defines:
  - One line-item structure inside an order.
  - Fields: `clothing`, `fabric`, `quantity`, `price`.
  - Validation/defaults prevent invalid values.

### `orderSchema`

- Code: [my-node-express-mongodb-app/src/models/Order.js](my-node-express-mongodb-app/src/models/Order.js#L29-L84)
- What it defines:
  - Complete order shape in MongoDB.
  - Customer info + item list + measurements + total + status.
  - Status enum limited to `Pending`/`Completed`.
  - Timestamps enabled for created/updated tracking.

### `mongoose.model("Order", orderSchema)`

- Code: [my-node-express-mongodb-app/src/models/Order.js](my-node-express-mongodb-app/src/models/Order.js#L86)
- What it does:
  - Creates model object (`Order`) used by all controller CRUD operations.

---

## Page JS functions in `script.js`

File: [script.js](script.js)

### API helper

- `apiRequest(path, options)`
  - Code: [script.js](script.js#L7)
  - Sends API requests, parses JSON, throws readable error when response is not OK.

### Cart class methods

- `constructor()` — initialize cart + measurements from localStorage.
  - [script.js](script.js#L49)
- `loadFromLocalStorage()` — load `tailorCart`.
  - [script.js](script.js#L54)
- `loadMeasurementsFromLocalStorage()` — load `tailorMeasurements`.
  - [script.js](script.js#L59)
- `saveMeasurements(measurementData)` — save measurement object.
  - [script.js](script.js#L64)
- `saveToLocalStorage()` — persist current cart array.
  - [script.js](script.js#L70)
- `addItem(clothing, fabric)` — create and append item with computed price.
  - [script.js](script.js#L74)
- `removeItem(itemId)` — delete item by id.
  - [script.js](script.js#L91)
- `updateQuantity(itemId, quantity)` — update item quantity with min 1.
  - [script.js](script.js#L97)
- `getItemCount()` — total all quantities.
  - [script.js](script.js#L106)
- `updateCartUI()` — updates cart badge + floating/docked icon state.
  - [script.js](script.js#L110)
- `getItems()` — returns in-memory cart array.
  - [script.js](script.js#L141)
- `clearCart()` — clears cart and updates UI.
  - [script.js](script.js#L145)

### Order flow functions

- `getCartItems()` — safely reads cart data with fallback.
  - [script.js](script.js#L159)
- `gatherOrderData(formValues)` — builds normalized order payload from form/cart.
  - [script.js](script.js#L176)
- `submitOrderToSheet(orderData)` — submits to backend, handles UI states and local history updates.
  - [script.js](script.js#L194)
- `setHidden(element, hidden)` — generic hide/show class helper.
  - [script.js](script.js#L278)

### Order history and status functions

- `loadOrderHistory()` — reads `orders` from localStorage.
  - [script.js](script.js#L283)
- `getValidOrderHistory()` — normalizes + filters invalid order records.
  - [script.js](script.js#L293)
- `saveOrderToHistory(orderData)` — pushes a newly created order into local history.
  - [script.js](script.js#L334)
- `updateOrdersNavLinks()` — toggles nav links based on whether history exists.
  - [script.js](script.js#L365)
- `clearOrderHistory()` — confirms and clears local order history.
  - [script.js](script.js#L374)
- `syncOrderStatusesFromApi(orders)` — refreshes status values from backend by remote IDs.
  - [script.js](script.js#L389)

### Page init functions

- `initOrdersPage()` — renders orders screen cards and empty state.
  - [script.js](script.js#L422)
- `initOrderPage()` — renders summary + handles checkout form submit flow.
  - [script.js](script.js#L499)
- `loadCustomerDetails()` — reads saved customer details.
  - [script.js](script.js#L651)
- `saveCustomerDetails(details)` — stores name/email/phone for convenience.
  - [script.js](script.js#L660)
- `initCartPage()` — sets up cart page rendering and event logic.
  - [script.js](script.js#L670)

### Helper functions nested in `initCartPage()`

- `displayCart()` — builds cart HTML, totals, and quantity controls.
  - [script.js](script.js#L682)
- `attachEventListeners()` — binds click handlers for cart interactions.
  - [script.js](script.js#L742)
- `handleCartClick(e)` — event delegation for plus/minus/remove.
  - [script.js](script.js#L754)
- `handleClearCart(e)` — confirms and clears cart.
  - [script.js](script.js#L784)
- `displayMeasurements()` — displays measurement summary in cart page.
  - [script.js](script.js#L792)
- `showMeasurementEditForm(measurements)` — opens inline measurement edit form and saves changes.
  - [script.js](script.js#L840)
- `setupCheckoutHandler()` — wires proceed button to checkout validator.
  - [script.js](script.js#L926)

### Checkout/navigation utility functions

- `handleCheckoutIntent(options)` — route guard before checkout (cart + measurement checks).
  - [script.js](script.js#L941)
- `findField(form, names)` — helper for finding form fields by alternate names.
  - [script.js](script.js#L975)
- `submitOrderToFirebase(orderData)` — legacy local-storage fallback function (kept but not primary path).
  - [script.js](script.js#L983)

### Runtime helper functions (inside `DOMContentLoaded`)

- `handleCartPosition()` — keeps cart icon docked/floating depending on scroll.
  - [script.js](script.js#L1047)
- `populateHomeMeasurementInputs(measurements)` — fills measurement fields from saved values.
  - [script.js](script.js#L1115)
- `setHomeMeasurementView(view)` — toggles measurement form vs summary mode.
  - [script.js](script.js#L1126)
- `setSaveButtonLabel(hasSavedMeasurements)` — changes save button label text.
  - [script.js](script.js#L1140)
- `renderHomeMeasurementSummary()` — renders compact measurement summary block.
  - [script.js](script.js#L1147)
- `buildCartPanel()` — creates slide-over cart panel DOM.
  - [script.js](script.js#L1290)
- `refreshCartPanel()` — re-renders panel list and totals.
  - [script.js](script.js#L1333)
- `openCartPanel()` — opens panel and refreshes content.
  - [script.js](script.js#L1369)
- `closeCartPanel()` — closes panel.
  - [script.js](script.js#L1380)

### Global utility

- `showNotification(message)` — shows temporary toast-like message.
  - [script.js](script.js#L1460)

---

## Page JS functions in `admin.js`

File: [admin.js](admin.js)

- `apiRequest(path, options)`
  - [admin.js](admin.js#L15)
  - Admin API wrapper; centralizes fetch+error handling.

- `handleLogin(event)`
  - [admin.js](admin.js#L39)
  - Handles admin login form validation and dashboard transition.

- `showDashboard()`
  - [admin.js](admin.js#L57)
  - Switches from login view to dashboard and triggers order load.

- `loadOrders()`
  - [admin.js](admin.js#L63)
  - Fetches all orders and builds admin table HTML.

- `deleteAllOrders()`
  - [admin.js](admin.js#L201)
  - Confirms then deletes every order via backend endpoint.

- `deleteOrder(orderId)`
  - [admin.js](admin.js#L225)
  - Deletes a selected order by id.

- `markOrderCompleted(orderId)`
  - [admin.js](admin.js#L242)
  - Marks selected order completed.

- `showAdminMessage(message, type)`
  - [admin.js](admin.js#L258)
  - Displays temporary success/error messages in dashboard.

- `testConnection()`
  - [admin.js](admin.js#L275)
  - Calls health endpoint and shows connectivity status.

- `toggleInstructions(id)`
  - [admin.js](admin.js#L293)
  - Expands/collapses long instruction text blocks in order rows.

---

## Study path suggestion (for your future self)

When you come back to study, follow this order:

1. Read startup: `server.js`, `db.js`, `app.js`.
2. Read route map: `routes/index.js`.
3. Read controller functions one by one.
4. Read `Order.js` schema.
5. Read `script.js` order flow (`getCartItems` → `submitOrderToSheet` → `syncOrderStatusesFromApi`).
6. Read `admin.js` flow (`loadOrders` → `markOrderCompleted` / `deleteOrder`).

This sequence makes the whole project much easier to understand.
