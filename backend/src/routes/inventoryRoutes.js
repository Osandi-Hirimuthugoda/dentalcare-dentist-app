import express from "express";
import {
  addItem,
  updateStock,
  getInventory,
  deleteItem
} from "../controllers/inventoryController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Clinic inventory management
 */

/**
 * @swagger
 * /api/inventory/all:
 *   get:
 *     summary: Get all inventory items
 *     tags: [Inventory]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all inventory items
 */
router.get("/all", getInventory);

/**
 * @swagger
 * /api/inventory/add:
 *   post:
 *     summary: Add a new inventory item (Admin only)
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemName, category, quantity, unit]
 *             properties:
 *               itemName:     { type: string }
 *               category:     { type: string, enum: [Equipment, Supplies, Medicine, Other] }
 *               quantity:     { type: integer }
 *               unit:         { type: string }
 *               minThreshold: { type: integer }
 *               supplier:     { type: string }
 *               location:     { type: string }
 *     responses:
 *       201:
 *         description: Item added successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/add", addItem);

/**
 * @swagger
 * /api/inventory/update/{id}:
 *   put:
 *     summary: Update stock quantity
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity: { type: integer }
 *               type:     { type: string, enum: [add, subtract] }
 *     responses:
 *       200:
 *         description: Stock updated
 */
router.put("/update/:id", updateStock);

/**
 * @swagger
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete an inventory item (Admin only)
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Item deleted
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id", deleteItem);

export default router;
