import { model, Schema } from "mongoose";
import { IAccountCategory } from "./accountCategour.interface";
import { ENUMAccountType } from "../ledger-accounts/ledgerAccounts.interface";

const accountCategorySchema = new Schema<IAccountCategory>(
  {
    accountType: {
      type: String,
      required: true,
      enum: ENUMAccountType,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    autoIndex: true,
  }
);

export const AccountCategory = model("AccountCategory", accountCategorySchema);
