import { Types } from "mongoose";
import { IAccountCategory } from "../account-category/accountCategour.interface";

export enum ENUM_BALANCE_TYPE {
  BANK = "bank",
  CASH = "cash",
}

export interface TLedgerAccount {
  _id?: string;
  name: string;
  address: string;
  comment?: string;
  district: string;
  department: string;
  balanceBD: number;
  BDDate: Date | null;
  accountType: ENUMAccountType;
  createdAt: string;
  updatedAt: string;
  accountCategory: Types.ObjectId | IAccountCategory;
  useAsBalance: boolean;
  balanceType?: ENUM_BALANCE_TYPE;
}

export type TLedgerAccountWithPopulatedCategory = Omit<
  TLedgerAccount,
  "accountCategory"
> & {
  accountCategory: IAccountCategory;
};

export enum ENUMAccountType {
  ASSETS = "asset",
  EXPENSE = "expense",
  INCOME = "income",
  CAPITAL = "capital",
  LIABILITY = "liability",
  DRAWING = "drawing",
  EQUITY = "EQUITY",
}
