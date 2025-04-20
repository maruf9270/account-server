import { Types } from "mongoose";

export type ILedgerBalance = {
  _id?: Types.ObjectId;
  account: Types.ObjectId;
  balance: number;
};
