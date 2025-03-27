import mongoose, { Schema } from "mongoose";
import { IJournalEntry } from "./journalEntry.interface";

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    entryId: { type: String, required: true }, // Same for all entries in one group
    serialNo: { type: Number, required: true }, // Incrementing
    account: { type: Schema.Types.ObjectId, required: true, ref: "Ledger" },
    comment: { type: String },
    debit: { type: Number, required: true, min: 0 },
    credit: { type: Number, required: true, min: 0 },
    memo: { type: String },
    journalType: { type: String, required: true },
    budgetType: { type: String, required: true },
    journalNo: { type: Number, required: true },
  },
  { timestamps: true }
);

export const JournalEntry = mongoose.model<IJournalEntry>(
  "JournalEntry",
  JournalEntrySchema
);
