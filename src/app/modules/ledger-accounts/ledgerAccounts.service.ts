/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { PipelineStage, Types } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import { ENUMAccountType, TLedgerAccount } from "./ledgerAccounts.interface";
import { Ledger } from "./ledgerAccounts.model";
import { JournalEntry } from "../journal-entry/journalEntry.model";

const post = async (payload: TLedgerAccount) => {
  return await Ledger.create(payload);
};

const patch = async (payload: Partial<TLedgerAccount>, id: string) => {
  return await Ledger.findByIdAndUpdate(id, payload, { new: true });
};

const remove = async (id: string) => {
  return await Ledger.findByIdAndDelete(id);
};

const get = async (id: string) => {
  return await Ledger.findById(id);
};

const getAll = async (query: Record<string, any>) => {
  const queryObj = new QueryBuilder(Ledger.find(), query);
  const data = await queryObj
    .search(["name"])
    .filter()
    .sort()
    .paginate()
    .modelQuery.exec();

  const meta = await queryObj.countTotal();

  return {
    data,
    meta,
  };
};

interface ITrialBalanceItem {
  accountId: mongoose.Types.ObjectId;
  accountName: string;
  accountType: string;
  beginningBalance: number;
  debits: number;
  credits: number;
  endingBalance: number;
}

enum BalanceType {
  DEBIT = "DEBIT",
  CREDIT = "CREDIT",
}

const getTrialBalanceData = async (query: Record<string, string>) => {
  // Set default end date to current date if not provided

  const formatedStartDate = query?.from ? new Date(query?.from) : new Date();
  const formatedEndDate = query?.to ? new Date(query?.to) : new Date();

  formatedStartDate.setHours(0, 0, 0, 0);
  formatedEndDate.setHours(23, 59, 59, 999);
  const dateFilter: any = {
    createdAt: {
      $gte: formatedStartDate, // Start of the day
      $lte: formatedEndDate,
    },
  };

  // Get all ledger accounts
  const ledgerAccounts = await Ledger.find({}).lean();

  // Aggregate journal entries for each account
  const trialBalanceItems = await Promise.all(
    ledgerAccounts.map(async (account) => {
      // Query to get sum of debits and credits for this account within the date range
      const journalSummary = await JournalEntry.aggregate([
        {
          $match: {
            account: account._id,
            ...dateFilter,
          },
        },
        {
          $group: {
            _id: "$account",
            totalDebits: { $sum: "$debit" },
            totalCredits: { $sum: "$credit" },
          },
        },
      ]);

      const totalDebits = journalSummary[0]?.totalDebits || 0;
      const totalCredits = journalSummary[0]?.totalCredits || 0;

      // Determine account's normal balance type
      const isDebitNormalAccount =
        account.accountType === ENUMAccountType.ASSETS ||
        account.accountType === ENUMAccountType.EXPENSE;

      // Calculate net balance and determine if it's a debit or credit balance
      let netBalance = 0;
      let balanceType: BalanceType;

      // Start with beginning balance
      let workingBalance = account.balanceBD;

      // Apply debits and credits according to account type
      if (isDebitNormalAccount) {
        // For debit-normal accounts (Asset, Expense)
        // Debits increase, credits decrease
        workingBalance = workingBalance + totalDebits - totalCredits;

        // If final balance is positive or zero, it's a debit balance (normal)
        // If final balance is negative, it's a credit balance (abnormal)
        if (workingBalance >= 0) {
          netBalance = workingBalance;
          balanceType = BalanceType.DEBIT;
        } else {
          netBalance = Math.abs(workingBalance);
          balanceType = BalanceType.CREDIT;
        }
      } else {
        // For credit-normal accounts (Liability, Equity, Revenue)
        // Credits increase, debits decrease
        workingBalance = workingBalance - totalDebits + totalCredits;

        // If final balance is positive or zero, it's a credit balance (normal)
        // If final balance is negative, it's a debit balance (abnormal)
        if (workingBalance >= 0) {
          netBalance = workingBalance;
          balanceType = BalanceType.CREDIT;
        } else {
          netBalance = Math.abs(workingBalance);
          balanceType = BalanceType.DEBIT;
        }
      }

      return {
        accountId: account._id,
        accountName: account.name,
        accountType: account.accountType,
        beginningBalance: account.balanceBD,
        debits: totalDebits,
        credits: totalCredits,
        netBalance: netBalance,
        balanceType: balanceType,
      };
    })
  );

  return trialBalanceItems;
};

const getIncomeStatement = async (startDate: Date, endDate: Date) => {
  // Prepare date filter for journal entries
  // Default to current date if no startDate and endDate are provided
  const formatedStartDate = startDate ? new Date(startDate) : new Date();
  const formatedEndDate = endDate ? new Date(endDate) : new Date();

  formatedStartDate.setHours(0, 0, 0, 0);
  formatedEndDate.setHours(23, 59, 59, 999);
  const dateFilter: any = {
    createdAt: {
      $gte: formatedStartDate, // Start of the day
      $lte: formatedEndDate,
    },
  };

  // Get all revenue and expense accounts
  const accounts = await Ledger.find({
    accountType: {
      $in: [ENUMAccountType.INCOME, ENUMAccountType.EXPENSE],
    },
  })
    .lean()
    .populate("accountCategory");

  console.log(accounts);
  // Process each account
  const incomeStatementItems = await Promise.all(
    accounts.map(async (account) => {
      // Get sum of debits and credits for this account within the date range
      const journalSummary = await JournalEntry.aggregate([
        {
          $match: {
            account: account._id,
            ...dateFilter,
          },
        },
        {
          $group: {
            _id: "$account",
            totalDebits: { $sum: "$debit" },
            totalCredits: { $sum: "$credit" },
          },
        },
      ]);

      const totalDebits = journalSummary[0]?.totalDebits || 0;
      const totalCredits = journalSummary[0]?.totalCredits || 0;

      let amount = 0;

      // Calculate net amount according to account type
      if (account.accountType === ENUMAccountType.INCOME) {
        // For revenue accounts: Credits increase (positive), Debits decrease (negative)
        amount = totalCredits - totalDebits;
      } else {
        // For expense accounts: Debits increase (positive), Credits decrease (negative)
        // We'll represent expenses as negative values for the income statement
        amount = -(totalDebits - totalCredits);
      }

      return {
        accountId: account._id,
        accountName: account.name,
        accountType: account.accountType,
        amount: amount,
      };
    })
  );

  // Separate revenue and expense accounts
  const revenueAccounts = incomeStatementItems.filter(
    (item) => item.accountType === ENUMAccountType.INCOME
  );

  const expenseAccounts = incomeStatementItems.filter(
    (item) => item.accountType === ENUMAccountType.EXPENSE
  );

  // Calculate totals
  const totalRevenue = revenueAccounts.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalExpenses = expenseAccounts.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const netIncome = totalRevenue + totalExpenses; // Expenses are already negative

  return {
    totalRevenue,
    totalExpenses,
    netIncome,
    revenueAccounts,
    expenseAccounts,
  };
};

const getLedgerBalances = async (id: string, query: Record<string, string>) => {
  // Default to current date if no startDate and endDate are provided
  const formatedStartDate = query?.from ? new Date(query?.from) : new Date();
  const formatedEndDate = query?.to ? new Date(query?.to) : new Date();

  formatedStartDate.setUTCHours(0, 0, 0, 0);
  formatedEndDate.setUTCHours(23, 59, 59, 999);
  console.log(formatedStartDate);
  const dateFilter: any = {
    createdAt: {
      $gte: formatedStartDate, // Start of the day
      $lte: formatedEndDate,
    },
  };

  const account = await Ledger.findById(id);
  if (!account) {
    throw new Error("Account not found");
  }

  const { accountType } = account;

  // Step 1: Get carried forward balance (balanceBD)
  const balanceBDResult = await JournalEntry.aggregate([
    {
      $match: {
        account: new Types.ObjectId(id),
        createdAt: { $lt: formatedStartDate },
      },
    },
    {
      $group: {
        _id: null,
        debitTotal: { $sum: "$debit" },
        creditTotal: { $sum: "$credit" },
      },
    },
  ]);

  let balanceBD = 0;
  if (balanceBDResult.length > 0) {
    const { debitTotal, creditTotal } = balanceBDResult[0];

    // Apply accounting principles for opening balance
    if (["asset", "expense"].includes(accountType)) {
      balanceBD = debitTotal - creditTotal;
    } else {
      balanceBD = creditTotal - debitTotal;
    }
  }

  // Step 2: Fetch journal entries within the date range
  const journalEntries = await JournalEntry.aggregate([
    {
      $match: {
        account: new Types.ObjectId(id),
        createdAt: {
          $gte: new Date(formatedStartDate),
          $lte: new Date(formatedEndDate),
        },
      },
    },
    {
      $group: {
        _id: null,
        entryIds: { $push: "$entryId" },
      },
    },
    {
      $lookup: {
        from: "journalentries",
        localField: "entryIds",
        foreignField: "entryId",
        as: "relatedEntries",
      },
    },
    {
      $unwind: "$relatedEntries",
    },
    {
      $match: {
        "relatedEntries.account": {
          $ne: new Types.ObjectId(id),
        },
      },
    },
    {
      $addFields: {
        "relatedEntries.debit": "$relatedEntries.credit",
        "relatedEntries.credit": "$relatedEntries.debit",
      },
    },
    {
      $replaceRoot: { newRoot: "$relatedEntries" },
    },
    {
      $lookup: {
        from: "ledgers",
        localField: "account",
        foreignField: "_id",
        as: "account",
      },
    },
    {
      $unwind: "$account",
    },
  ]);

  // Step 3: Calculate running balance
  let runningBalance = balanceBD;
  const entries = journalEntries.map((entry, index) => {
    const { _id, createdAt, debit, credit } = entry;

    if (["asset", "expense"].includes(accountType)) {
      runningBalance += debit - credit;
    } else {
      runningBalance += credit - debit;
    }

    return {
      entryId: _id.toString(),
      serialNo: index + 1,
      date: createdAt.toISOString().split("T")[0], // Format date as YYYY-MM-DD
      debit,
      credit,
      balance: runningBalance,
      account: entry?.account?.name,
    };
  });

  // Step 4: Construct the response
  return {
    account: account.name,
    accountType,
    startingBalance: balanceBD,
    entries,
  };
};
export const ledgerAccountService = {
  post,
  patch,
  remove,
  get,
  getAll,
  getTrialBalanceData,
  getIncomeStatement,
  getLedgerBalances,
};
