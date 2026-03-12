const mongoose = require("mongoose");
const Order = require("../models/Order");

// Converts incoming cart item payloads into one consistent backend-friendly shape.
function normalizeItems(items = []) {
  if (!Array.isArray(items)) return [];

  return items.map((item) => ({
    clothing: item?.clothing?.name || item?.clothing || "Item",
    fabric: item?.fabric?.name || item?.fabric || "Fabric",
    quantity: Number(item?.quantity || 1),
    price: Number(item?.price || 0),
  }));
}

// Creates a new order document after validating the required customer fields.
exports.createOrder = async (req, res) => {
  try {
    const { name, email, phone, instructions, measurements, items, total } =
      req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "name and phone are required" });
    }

    // Normalize the incoming items so the API accepts both old and new frontend shapes.
    const normalizedItems = normalizeItems(items);
    // Fall back to a computed total if the frontend did not send a valid one.
    const fallbackTotal = normalizedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Order.create({
      name: String(name).trim(),
      email: email ? String(email).trim() : "",
      phone: String(phone).trim(),
      instructions: instructions ? String(instructions).trim() : "",
      measurements:
        measurements && typeof measurements === "object" ? measurements : {},
      items: normalizedItems,
      clothing: normalizedItems.map((item) => item.clothing).join(", "),
      fabric: normalizedItems.map((item) => item.fabric).join(", "),
      total: Number(total || 0) || fallbackTotal,
      status: "Pending",
    });

    return res.status(201).json({
      id: order._id,
      status: order.status,
      createdAt: order.createdAt,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to create order" });
  }
};

// Returns all orders in reverse-chronological order for the admin dashboard.
exports.listOrders = async (_req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    return res.json(
      orders.map((order) => ({
        id: String(order._id),
        created_at: order.createdAt,
        name: order.name,
        phone: order.phone,
        email: order.email,
        clothing: order.clothing,
        fabric: order.fabric,
        measurements: order.measurements || {},
        instructions: order.instructions || "",
        total: order.total || 0,
        status: order.status || "Pending",
      })),
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to load orders" });
  }
};

// Returns only id/status pairs for selected orders used by the customer orders page.
exports.getOrderStatuses = async (req, res) => {
  try {
    const rawIds = String(req.query.ids || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    // Ignore invalid IDs instead of letting them break the whole request.
    const ids = rawIds.filter((id) => mongoose.Types.ObjectId.isValid(id));

    if (ids.length === 0) {
      return res.json([]);
    }

    const orders = await Order.find({ _id: { $in: ids } }).select("_id status");

    return res.json(
      orders.map((order) => ({
        id: String(order._id),
        status: order.status || "Pending",
      })),
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to load statuses" });
  }
};

// Marks one order as completed after validating the MongoDB ObjectId.
exports.markCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: "Completed" },
      { new: true },
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ id: String(order._id), status: order.status });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to update order" });
  }
};

// Deletes a single order by id.
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order id" });
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to delete order" });
  }
};

// Deletes every order document; used by the admin bulk-delete action.
exports.deleteAllOrders = async (_req, res) => {
  try {
    await Order.deleteMany({});
    return res.json({ message: "All orders deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to delete all orders" });
  }
};
