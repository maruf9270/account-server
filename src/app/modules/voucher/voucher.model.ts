import mongoose, { Model, Schema } from "mongoose";
import { IVoucher } from "./voucher.interface";

const VoucherSchema = new Schema<IVoucher>(
  {
    account: { type: Schema.Types.ObjectId, required: true, ref: "Ledger" },
    cashOrBankAc: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Ledger",
    },

    voucherType: { type: String, enum: ["debit", "credit"], required: true },
    voucherNo: { type: Number, required: true, unique: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, required: true },
    budgetType: { type: String, required: true },
    description: { type: String },
    journalRef: {
      type: String,
      required: true,
      ref: "JournalEntry",
    },
  },
  { timestamps: true }
);

// Define and Export Mongoose Model
const VoucherModel = mongoose.model<IVoucher>("Voucher", VoucherSchema);
export default VoucherModel;
