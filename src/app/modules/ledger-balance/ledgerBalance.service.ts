/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from "http-status-codes";
import AppError from "../../errors/AppError";
import { IJournalEntry } from "../journal-entry/journalEntry.interface";
import { Ledger } from "../ledger-accounts/ledgerAccounts.model";
import { ENUMAccountType } from "../ledger-accounts/ledgerAccounts.interface";
import { LedgerBalance } from "./ledgerBalance.model";
import mongoose from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";

const updateBalance = async (payload: IJournalEntry) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction(); // Start transaction

    //   Checking for ledger balance and if not exists inserting it
    // let accountBalance;
    // const doesAccountExists = await LedgerBalance.find({
    //   account: account?._id,
    // });

    // if (!doesAccountExists.length) {
    //   accountBalance = await LedgerBalance.create(
    //     {
    //       account: account._id,
    //       balance: 0,
    //     },
    //     { session }
    //   );
    // } else {
    //   accountBalance = doesAccountExists;
    // }
    // Checking for ledger
    const account = await Ledger.findById(payload.account);
    if (!account) {
      throw new AppError(StatusCodes.BAD_REQUEST, "No account Found");
    }

    // Handling account balance initialization
    const doesAccountExist = await LedgerBalance.findOne({
      account: account._id,
    }).session(session);
    if (!doesAccountExist) {
      await LedgerBalance.create([{ account: account._id, balance: 0 }], {
        session,
      });
    }

    const updateAmount = payload.debit > 0 ? payload.debit : -payload.credit;

    await LedgerBalance.findOneAndUpdate(
      { account: account._id },
      {
        $inc: {
          balance:
            account.accountType === ENUMAccountType.ASSETS ||
            account.accountType === ENUMAccountType.EXPENSE
              ? updateAmount
              : -updateAmount,
        },
      },
      { session, upsert: true }
    );

    await session.commitTransaction(); // Only commit if no error occurs
  } catch (error) {
    await session.abortTransaction(); // Only abort if an error happens
    throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, error as string);
  } finally {
    session.endSession(); // Always end session
  }
};

const getAll = async (query: Record<string, any>) => {
  const queryObj = new QueryBuilder(LedgerBalance.find(), query);
  const data = await queryObj.filter().sort().paginate().modelQuery.exec();

  const meta = await queryObj.countTotal();

  return {
    data,
    meta,
  };
};

const get = async (params: string) => {
  return await LedgerBalance.findById(params);
};
const remove = async (params: string) => {
  return await LedgerBalance.findByIdAndDelete(params);
};
export const LedgerBalanceService = { updateBalance, getAll, get, remove };
