const express = require("express");
const orderController = require("../controllers/orderController");
const adminController = require("../controllers/adminController");
const catalogController = require("../controllers/catalogController");
const requireAdminAuth = require("../middleware/requireAdminAuth");

// Router dedicated to order-management endpoints.
const router = express.Router();

// Admin login endpoint returning JWT.
router.post("/admin/login", adminController.login);

// Create a new customer order.
router.post("/orders", orderController.createOrder);
// List all orders for the admin dashboard.
router.get("/orders", requireAdminAuth, orderController.listOrders);
// Fetch status only for selected order IDs.
router.get("/orders/statuses", orderController.getOrderStatuses);

// Catalog routes used by the storefront and admin item manager.
router.get("/catalog", catalogController.listCatalogItems);
router.post("/catalog", requireAdminAuth, catalogController.createCatalogItem);
router.delete("/catalog/:id", requireAdminAuth, catalogController.deleteCatalogItem);

// Mark a single order as completed.
router.patch(
	"/orders/:id/complete",
	requireAdminAuth,
	orderController.markCompleted,
);
// Delete one order.
router.delete("/orders/:id", requireAdminAuth, orderController.deleteOrder);
// Delete all orders.
router.delete("/orders", requireAdminAuth, orderController.deleteAllOrders);

module.exports = router;
