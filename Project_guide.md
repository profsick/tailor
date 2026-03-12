# Urban Atelier Project Guide

This is the up-to-date plain-English guide for how the whole project works today.

It covers:

- the customer-facing website,
- the admin dashboard,
- the add-items workflow,
- browser storage,
- the backend API and MongoDB flow.

## Project structure

### Customer-facing pages

- `index.html` -> main landing page and product selection flow
- `cart.html` -> cart review and measurement editing
- `order.html` -> final checkout form and order submission
- `yorders.html` -> customer order history and status tracking
- `styles.css` -> shared styling for the site
- `script.js` -> main frontend logic

### Admin pages

- `admin.html` -> admin login and order dashboard
- `admin.js` -> admin order-management logic
- `add-items.html` -> admin page for adding/removing clothing and fabrics
- `add-items.js` -> admin catalog-management logic
- `admin.css` -> admin styling

### Backend

- `my-node-express-mongodb-app/src/server.js` -> starts the server and tries to connect to MongoDB
- `my-node-express-mongodb-app/src/app.js` -> Express app setup, middleware, routes, static serving
- `my-node-express-mongodb-app/src/config/db.js` -> database connection logic
- `my-node-express-mongodb-app/src/routes/index.js` -> API routes
- `my-node-express-mongodb-app/src/controllers/orderController.js` -> order business logic
- `my-node-express-mongodb-app/src/models/Order.js` -> MongoDB schema for orders

## Big-picture flow

### Customer side

1. Customer opens `index.html`
2. Clothing and fabric choices are rendered from browser storage
3. Customer picks clothing, then fabric
4. Item is added to cart in `localStorage`
5. Customer saves measurements
6. Customer goes to `order.html` and places order
7. Backend stores the order in MongoDB
8. Customer can later view status in `yorders.html`

### Admin side

1. Admin logs in on `admin.html`
2. Dashboard loads all orders from the backend
3. Admin can refresh, mark complete, delete one order, or delete all orders
4. Admin can click `Add Items`
5. `add-items.html` shows all current clothing and fabric entries
6. Admin can upload a new image and name for a new clothing or fabric item
7. Admin can also delete existing catalog items
8. The customer catalog is updated from browser storage

## Where product items come from now

The catalog is no longer treated as fixed HTML only.

### Clothing items

- Stored in browser `localStorage` under `tailorClothing`
- Each item is stored as an object like:

```javascript
{
  name: "Tuxedo",
  image: "assets/tuxedo2.jpg"
}
```

### Fabric items

- Stored in browser `localStorage` under `tailorFabrics`
- Each item is stored as an object like:

```javascript
{
  name: "Cotton",
  image: "data:image/png;base64,..."
}
```

### Important note

- Default clothing/fabric items are created automatically if storage is empty
- New admin uploads are saved as base64 images in browser storage
- This means item changes are browser-local, not stored in MongoDB
- If you open the project in a different browser or clear storage, the custom catalog items will not be there unless added again

## Storage used in this project

### In localStorage

- `tailorCart` -> customer cart items
- `tailorMeasurements` -> saved body measurements
- `customerDetails` -> saved customer form details
- `orders` -> local order history used by the customer orders page
- `tailorClothing` -> clothing catalog entries
- `tailorFabrics` -> fabric catalog entries
- `tailorItemsVersion` -> a timestamp key used to signal catalog updates across tabs

### In sessionStorage

- `adminLoggedIn` -> admin login state for current tab/session
- `selectedClothing` -> temporary clothing selection before fabric is chosen

### In MongoDB

- Final submitted customer orders
- Order status (`Pending` or `Completed`)
- Customer details, measurements, instructions, totals, item list

## Customer flow in plain English

### Main shopping page

`index.html` does several things:

- loads the cart state,
- loads the saved catalog items,
- renders clothing and fabric options,
- shows hover labels over clothing and fabric images,
- lets the customer select clothing first, then fabric,
- adds the combination to cart,
- updates the floating cart icon,
- allows measurements to be saved directly from the site.

### Cart page

`cart.html` shows:

- all selected items,
- quantity controls,
- remove buttons,
- total calculation,
- saved measurement summary,
- editing flow for measurements.

### Order page

`order.html` shows:

- order summary,
- customer contact form,
- measurement review,
- instructions field,
- submit flow that posts to `/api/orders`.

### Orders page

`yorders.html` shows:

- the customer’s local order history,
- synced status from backend for orders that have remote IDs,
- pending/completed labels,
- a clear-history action for local order history.

## Admin flow in plain English

### Order dashboard

`admin.html` + `admin.js` handle:

- simple admin login,
- loading all backend orders,
- marking an order as completed,
- deleting one order,
- deleting all orders,
- testing API connection,
- navigating to the add-items page.

### Add-items page

`add-items.html` + `add-items.js` handle:

- showing current clothing items with image and name,
- showing current fabric items with image and name,
- uploading a new clothing image with a required name,
- uploading a new fabric image with an optional name,
- previewing selected images before upload,
- deleting existing clothing/fabric entries,
- notifying other tabs that catalog items changed.

## Backend API routes

All backend routes are mounted under `/api`.

### Order routes

- `POST /api/orders` -> create a new order
- `GET /api/orders` -> list all orders
- `GET /api/orders/statuses?ids=id1,id2` -> fetch status only for selected orders
- `PATCH /api/orders/:id/complete` -> mark an order as completed
- `DELETE /api/orders/:id` -> delete one order
- `DELETE /api/orders` -> delete all orders

## Backend behavior notes

### Startup behavior

`server.js` loads `.env`, reads `PORT`, and tries to connect to MongoDB.

If MongoDB connection fails, the server can still start in degraded mode.
That means:

- the app can still serve pages,
- but database-backed order actions will not work properly until DB connection succeeds.

### Order controller behavior

The backend controller:

- validates required fields,
- normalizes incoming item data,
- computes fallback totals if needed,
- stores orders in MongoDB,
- returns status information used by frontend/admin.

## Common editing points

- Change catalog rendering or cart behavior -> `script.js`
- Change customer layout or page structure -> `index.html`, `cart.html`, `order.html`, `yorders.html`
- Change styling -> `styles.css`
- Change admin dashboard behavior -> `admin.js`, `admin.html`
- Change add-items workflow -> `add-items.js`, `add-items.html`
- Change backend order logic -> `my-node-express-mongodb-app/src/controllers/orderController.js`
- Change schema/data fields -> `my-node-express-mongodb-app/src/models/Order.js`
- Change route paths -> `my-node-express-mongodb-app/src/routes/index.js`
- Change DB connection/startup -> `my-node-express-mongodb-app/src/config/db.js`, `my-node-express-mongodb-app/src/server.js`

## Known limitations

- Admin-added catalog items are stored in browser storage, not in MongoDB
- Because of that, catalog changes are not shared automatically across different browsers or devices
- Base64 images in localStorage are convenient but not ideal for large-scale production use
- A future production-ready version should move catalog items and images to the backend/database or object storage

## One-screen mental model

If you forget the details, remember this:

- `script.js` runs almost all customer-side behavior
- `admin.js` runs order-management behavior for admin
- `add-items.js` runs catalog-management behavior for admin
- `localStorage` handles cart, measurements, order history, and current catalog entries
- Express + MongoDB handle real order persistence and status updates

That is the current full project model.
