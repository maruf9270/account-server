import { ENUMAccountType } from "../ledger-accounts/ledgerAccounts.interface";

export type IAccountCategory = {
  accountType: ENUMAccountType;
  name: string;
};

export const defaultAccountType: IAccountCategory[] = [
  { accountType: ENUMAccountType.ASSETS, name: "Fixed Assets" },
  { accountType: ENUMAccountType.ASSETS, name: "Current Assets" },
  { accountType: ENUMAccountType.ASSETS, name: "Non-Current Assets" },
  { accountType: ENUMAccountType.LIABILITY, name: "Current Liabilities" },
  { accountType: ENUMAccountType.LIABILITY, name: "Non-Current Liabilities" },
  { accountType: ENUMAccountType.CAPITAL, name: "Equity / Capital" },
  { accountType: ENUMAccountType.INCOME, name: "Income / Revenue" },
  { accountType: ENUMAccountType.EXPENSE, name: "Operating Expenses" },
  { accountType: ENUMAccountType.EXPENSE, name: "Cost of Goods Sold (COGS)" },
  { accountType: ENUMAccountType.EXPENSE, name: "Financial Expenses" },
  { accountType: ENUMAccountType.EXPENSE, name: "Depreciation & Amortization" },
  { accountType: ENUMAccountType.EXPENSE, name: "Taxes & Duties" },
];
