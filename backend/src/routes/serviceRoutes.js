import express from "express";
import {
  getAllServices,
  getServicesByCategory,
  createService,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Dental services catalogue
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all active services
 *     tags: [Services]
 *     security: []
 *     responses:
 *       200:
 *         description: List of all active dental services
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:           { type: string }
 *               description:    { type: string }
 *               category:       { type: string }
 *               duration:       { type: integer }
 *     responses:
 *       201:
 *         description: Service created
 */
router.get("/", getAllServices);
router.post("/", createService);

/**
 * @swagger
 * /api/services/categories:
 *   get:
 *     summary: Get services grouped by category
 *     tags: [Services]
 *     security: []
 *     responses:
 *       200:
 *         description: Services grouped by category
 */
router.get("/categories", getServicesByCategory);

/**
 * @swagger
 * /api/services/{id}:
 *   put:
 *     summary: Update a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Service updated
 *   delete:
 *     summary: Soft-delete a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Service deactivated
 */
router.put("/:id", updateService);
router.delete("/:id", deleteService);

export default router;
