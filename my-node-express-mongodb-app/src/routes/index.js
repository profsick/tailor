const express = require("express");
const orderController = require("../controllers/orderController");

// Router dedicated to order-management endpoints.
const router = express.Router();

// Create a new customer order.
router.post("/orders", orderController.createOrder);
// List all orders for the admin dashboard.
router.get("/orders", orderController.listOrders);
// Fetch status only for selected order IDs.
router.get("/orders/statuses", orderController.getOrderStatuses);
// Mark a single order as completed.
router.patch("/orders/:id/complete", orderController.markCompleted);
// Delete one order.
router.delete("/orders/:id", orderController.deleteOrder);
// Delete all orders.
router.delete("/orders", orderController.deleteAllOrders);

module.exports = router;
