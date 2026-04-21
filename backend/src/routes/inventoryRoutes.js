import express from "express";
import {
  addItem,
  updateStock,
  getInventory,
  deleteItem
} from "../controllers/inventoryController.js";

const router = express.Router();

router.post("/add", addItem);
router.put("/update/:id", updateStock);
router.get("/all", getInventory);
router.delete("/:id", deleteItem);

export default router;
