import { Types } from "mongoose";

export interface IVoucher extends Document {
  account: Types.ObjectId;
  cashOrBankAc: Types.ObjectId;
  voucherType: string;
  date: Date;
  voucherNo: number;
  amount: number;
  paymentMode: string;
  bankOrCashAccount: string;
  budgetType: string;
  description?: string;
  serialNo: string;
  journalRef: string;
}
