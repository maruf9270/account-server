import express from "express";

import { LedgerController } from "./ledgerAccount.controller";
const router = express.Router();

router.post("/", LedgerController.create);
router.patch("/:id", LedgerController.update);
router.delete("/:id", LedgerController.remove);
router.get("/:id", LedgerController.getSingle);
router.get("/", LedgerController.getAll);
router.get("/statements/trial-balance", LedgerController.getTrialBalanceData);
router.get("/statements/income-statement", LedgerController.getIncomeStatement);
router.get(
  "/statements/ledger-balance/:id",
  LedgerController.getAllLedgerBalances
);
export const LedgerRoutes = router;
