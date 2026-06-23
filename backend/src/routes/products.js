import express from "express";
import prisma from "../prisma.js";

const router = express.Router();

// 1. GET /api/products - Paginates products sorted newest first
router.get("/", async (req, res) => {
  try {
    const { category, cursor, limit = 20 } = req.query;
    const pageSize = parseInt(limit) || 20;

    const where = {};
    if (category) {
      where.category = category;
    }

    if (cursor) {
      // Decode the cursor token (Base64 -> JSON String -> Object)
      const decoded = Buffer.from(cursor, "base64").toString("utf8");
      const { createdAt, id } = JSON.parse(decoded);

      // Filter products older than our cursor position
      where.OR = [
        { createdAt: { lt: new Date(createdAt) } },
        { createdAt: new Date(createdAt), id: { lt: parseInt(id) } },
      ];
    }

    //Sort by newest createdAt first
    //If two products have the same createdAt, sort by highest ID first
    const products = await prisma.product.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: pageSize,
    });

    
    let nextCursor = null;
    if (products.length === pageSize) {
      const lastProduct = products[products.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          createdAt: lastProduct.createdAt,
          id: lastProduct.id,
        }),
      ).toString("base64");
    }

    res.json({
      products,
      nextCursor,
      hasMore: nextCursor !== null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 2. GET /api/products/categories - Retrieves all unique category names
router.get("/categories", async (req, res) => {
  try {
    const result = await prisma.product.groupBy({
      by: ["category"],
      orderBy: { category: "asc" },
    });
    res.json(result.map((r) => r.category));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 3. POST /api/products/simulate - Seeds 50 products to test dynamic changes
router.post("/simulate", async (req, res) => {
  try {
    const { category } = req.body;
    const count = 50;
    const categories = [
      "Electronics",
      "Clothing",
      "Books",
      "Home",
      "Sports",
      "Toys",
      "Food",
      "Beauty",
    ];

    const mockData = Array.from({ length: count }, () => {
      const now = new Date();
      return {
        name: `Simulated Product ${Math.floor(Math.random() * 900000) + 100000}`,
        category:
          category || categories[Math.floor(Math.random() * categories.length)],
        price: parseFloat((Math.random() * 999 + 1).toFixed(2)),
        createdAt: now,
        updatedAt: now,
      };
    });

    await prisma.product.createMany({ data: mockData });
    res.json({ message: `Successfully inserted ${count} new products!` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
