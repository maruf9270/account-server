import { Document, Types } from "mongoose";

export interface IJournalEntry extends Document {
  entryId: string; // Unique identifier for the group
  serialNo: number; // Auto-incrementing serial number
  account: Types.ObjectId;
  comment: string;
  debit: number;
  credit: number;
  memo: string;
  journalType: string;
  budgetType: string;
  createdAt: Date;
  journalNo: number;
}
