const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();

router.post("/orders", orderController.createOrder);
router.get("/orders", orderController.listOrders);
router.get("/orders/statuses", orderController.getOrderStatuses);
router.patch("/orders/:id/complete", orderController.markCompleted);
router.delete("/orders/:id", orderController.deleteOrder);
router.delete("/orders", orderController.deleteAllOrders);

module.exports = router;
