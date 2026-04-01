const mongoose = require("mongoose");
const CatalogItem = require("../models/CatalogItem");

const DEFAULT_CLOTHING = [
  { name: "Tuxedo", image: "/assets/tuxedo2.jpg" },
  { name: "Trousers", image: "/assets/trousers.jpg" },
  { name: "Suit", image: "/assets/suit.jpg" },
  { name: "Shirt", image: "/assets/shirt.jpg" },
  { name: "Sherwani", image: "/assets/sherwani.jpg" },
  { name: "Thobe", image: "/assets/thobe.jpg" },
];

const DEFAULT_FABRICS = [
  { name: "Fabric", image: "/assets/fabric.jpg" },
  { name: "Fabric", image: "/assets/fabric.jpg" },
  { name: "Fabric", image: "/assets/fabric.jpg" },
  { name: "Fabric", image: "/assets/fabric.jpg" },
  { name: "Fabric", image: "/assets/fabric.jpg" },
];

function normalizeType(type) {
  const normalized = String(type || "").trim().toLowerCase();
  if (normalized === "cloth") {
    return "clothing";
  }
  if (normalized === "fabric" || normalized === "clothing") {
    return normalized;
  }
  return "";
}

async function seedCatalogIfNeeded(type = "") {
  const normalizedType = normalizeType(type);

  if (normalizedType === "clothing") {
    const count = await CatalogItem.countDocuments({ type: "clothing" });
    if (count === 0) {
      await CatalogItem.insertMany(
        DEFAULT_CLOTHING.map((item) => ({ type: "clothing", ...item })),
      );
    }
    return;
  }

  if (normalizedType === "fabric") {
    const count = await CatalogItem.countDocuments({ type: "fabric" });
    if (count === 0) {
      await CatalogItem.insertMany(
        DEFAULT_FABRICS.map((item) => ({ type: "fabric", ...item })),
      );
    }
    return;
  }

  const existingCount = await CatalogItem.countDocuments({});
  if (existingCount === 0) {
    const seedItems = [
      ...DEFAULT_CLOTHING.map((item) => ({ type: "clothing", ...item })),
      ...DEFAULT_FABRICS.map((item) => ({ type: "fabric", ...item })),
    ];

    await CatalogItem.insertMany(seedItems);
  }
}

exports.listCatalogItems = async (req, res) => {
  try {
    await seedCatalogIfNeeded(req.query.type);

    const type = normalizeType(req.query.type);
    const filter = type ? { type } : {};
    const items = await CatalogItem.find(filter).sort({ createdAt: 1 });

    return res.json(
      items.map((item) => ({
        id: String(item._id),
        type: item.type,
        name: item.name || "",
        image: item.image,
        createdAt: item.createdAt,
      })),
    );
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to load catalog items" });
  }
};

exports.createCatalogItem = async (req, res) => {
  try {
    const type = normalizeType(req.body.type);
    const name = String(req.body.name || "").trim();
    const image = String(req.body.image || "").trim();

    if (!type) {
      return res.status(400).json({ message: "Valid catalog type is required" });
    }

    if (!image) {
      return res.status(400).json({ message: "Image data is required" });
    }

    const createdItem = await CatalogItem.create({
      type,
      name: type === "fabric" && !name ? "Fabric" : name,
      image,
    });

    return res.status(201).json({
      id: String(createdItem._id),
      type: createdItem.type,
      name: createdItem.name || "",
      image: createdItem.image,
      createdAt: createdItem.createdAt,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to create catalog item" });
  }
};

exports.deleteCatalogItem = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid catalog item id" });
    }

    const deleted = await CatalogItem.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Catalog item not found" });
    }

    return res.json({ message: "Catalog item deleted" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Failed to delete catalog item" });
  }
};
