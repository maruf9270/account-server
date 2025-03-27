import express from "express";
import { JournalEntryController } from "./journalEntry.controller";

const router = express.Router();

router.post("/", JournalEntryController.create);
router.patch("/:id", JournalEntryController.update);
router.delete("/:id", JournalEntryController.remove);
router.get("/:id", JournalEntryController.getSingle);
router.get("/", JournalEntryController.getAll);
router.get("/print/:id", JournalEntryController.getSingleForPrint);

export const JournalEntryRoutes = router;
