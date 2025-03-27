import express from "express";
import { AccountCategoryController } from "./accountCategory.controller";

const router = express.Router();

router.post("/", AccountCategoryController.create);
// router.patch("/:id", JournalEntryController.update);
// router.delete("/:id", JournalEntryController.remove);
router.get("/:id", AccountCategoryController.getSingle);
router.get("/", AccountCategoryController.getAll);

export const AccountCategoryRoutes = router;
