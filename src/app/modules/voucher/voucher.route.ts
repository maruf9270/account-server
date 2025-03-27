import express from "express";
import { VoucherController } from "./voucher.controller";

const router = express.Router();

router.post("/", VoucherController.create);
router.patch("/:id", VoucherController.update);
router.delete("/:id", VoucherController.remove);
router.get("/:id", VoucherController.getSingle);
router.get("/", VoucherController.getAll);
router.get("/print/:id", VoucherController.getSingleForPrint);

export const VOucherRoutes = router;
