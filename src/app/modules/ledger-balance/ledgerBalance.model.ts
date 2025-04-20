import { model, Schema } from "mongoose";
import { ILedgerBalance } from "./ledgerBalance.interface";

const ldegerBalanceSchema = new Schema<ILedgerBalance>(
  {
    account: {
      type: Schema.Types.ObjectId,
      ref: "Ledger",
      required: true,
    },
    balance: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const LedgerBalance = model("LedgerBalance", ldegerBalanceSchema);
