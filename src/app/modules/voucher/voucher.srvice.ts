/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { PipelineStage, Types } from "mongoose";

import { v4 as uuidv4 } from "uuid";
import { paginationHelpers } from "../../helpers/paginationHelper";
import { IVoucher } from "./voucher.interface";
import VoucherModel from "./voucher.model";
import { ENUM_VOUCHER_TYPE } from "../../enums/EnumVoucherType";
import { IJournalEntry } from "../journal-entry/journalEntry.interface";
import { JournalEntry } from "../journal-entry/journalEntry.model";
import { journalEntryService } from "../journal-entry/journalEntry.service";
import QueryBuilder from "../../builder/QueryBuilder";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";

const post = async (payload: IVoucher) => {
  // Auto-increment serial number
  const lastEntry = await VoucherModel.find().sort({ voucherNo: -1 }).limit(1);
  const lastSerial = lastEntry?.length ? lastEntry[0].voucherNo : 0;
  console.log(lastEntry);

  // Assign the entryId and serial number to each entry
  payload.voucherNo = Number(lastSerial) + 1;
  let journalEntry: any;
  switch (payload.voucherType) {
    case ENUM_VOUCHER_TYPE.Debit:
      journalEntry = await journalEntryService.post([
        {
          account: payload.cashOrBankAc,
          comment: payload?.description,
          debit: payload.amount,
          credit: 0,
          journalType: "general",
          budgetType: payload.budgetType,
        },
        {
          account: payload.account,
          comment: payload?.description,
          debit: 0,
          credit: payload.amount,
          journalType: "general",
          budgetType: payload.budgetType,
        },
      ] as IJournalEntry[]);

      break;

    case ENUM_VOUCHER_TYPE.Credit:
      journalEntry = await journalEntryService.post([
        {
          account: payload.account,
          comment: payload?.description,
          debit: 0,
          credit: payload.amount,
          journalType: "general",
          budgetType: payload.budgetType,
        },
        {
          account: payload.cashOrBankAc,
          comment: payload?.description,
          debit: payload.amount,
          credit: 0,
          journalType: "general",
          budgetType: payload.budgetType,
        },
      ] as IJournalEntry[]);

      break;

    default:
      break;
  }

  payload.journalRef = journalEntry[0]?.entryId;
  return await VoucherModel.create(payload);
};

const patch = async (payload: Partial<IVoucher>, id: string) => {};

const remove = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const doesExists = await VoucherModel.findById(id);
    if (!doesExists) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Voucher not found");
    }
    await VoucherModel.findByIdAndDelete(id, { session });
    await JournalEntry.deleteMany(
      { entryId: doesExists.journalRef },
      { session }
    );
    await session.commitTransaction();
    return;
  } catch (error) {
    console.error(error);
    await session.abortTransaction();
    throw new AppError(StatusCodes.BAD_REQUEST, error as string);
  }
};

const get = async (id: string) => {
  return await VoucherModel.find({ _id: new Types.ObjectId(id) }).lean();
};

const getForPrint = async (id: string) => {
  return await JournalEntry.find({ entryId: id }).populate("account");
};

const getAll = async (query: Record<string, any>) => {
  console.log(query);
  const to = query?.to ?? Date.now();
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination({
      limit: query?.limit,
      page: query?.page,
    });
  const pipeline = [
    // Stage 1: Filter by Date Range (from - to) ensuring full-day coverage
    {
      $match: {
        ...(query?.from && to
          ? {
              createdAt: {
                $gte: new Date(`${query?.from}T00:00:00.000Z`), // Start of the day
                $lte: new Date(`${to}T23:59:59.999Z`), // End of the day
              },
            }
          : {}),
      },
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
    {
      $lookup: {
        from: "ledgers",
        localField: "cashOrBankAc",
        foreignField: "_id",
        as: "cashOrBankAc",
      },
    },
    {
      $unwind: "$cashOrBankAc",
    },

    // Stage 3: Filter by accountId (if provided)
    ...(query?.account
      ? [
          {
            $match: {
              "account._id": new Types.ObjectId(query?.account), // Keep groups where any entry has the accountId
            },
          },
        ]
      : []), // If no filter, do nothing

    // Stage 4: Sort by date (newest first)
    { $sort: { date: -1 } },

    // Stage 5: Pagination (skip & limit)
    { $skip: skip },
    { $limit: limit },

    // Stage 6: Reshape the output
  ];

  const result = await VoucherModel.aggregate(pipeline as PipelineStage[]);
  return {
    data: result,
    meta: {
      page: page,
      limit: limit,
      total: await VoucherModel.countDocuments(), // Total count of documents
    },
  };
};

export const VoucherService = {
  post,
  patch,
  remove,
  get,
  getAll,
  getForPrint,
};
