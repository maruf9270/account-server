import mongoose, { Schema } from "mongoose";
import {
  ENUM_BALANCE_TYPE,
  ENUMAccountType,
  TLedgerAccount,
} from "./ledgerAccounts.interface";

const LedgerSchema: Schema = new Schema<TLedgerAccount>(
  {
    name: { type: String, required: true, ind: true },
    address: { type: String },
    comment: { type: String },
    district: { type: String },
    department: { type: String },
    balanceBD: { type: Number, required: true, default: 0 },
    BDDate: { type: Date, default: new Date() },
    accountCategory: {
      type: Schema.Types.ObjectId,
      ref: "AccountCategory",
    },
    accountType: {
      type: String,
      enum: Object.values(ENUMAccountType),
      required: true,
      index: true,
    },
    useAsBalance: {
      type: Boolean,
      default: false,
    },
    balanceType: {
      type: String,
      enum: ["bank", "cash"],
    },
  },
  {
    timestamps: true,
  }
);

export const Ledger = mongoose.model<TLedgerAccount>("Ledger", LedgerSchema);
