/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { PipelineStage, Types } from "mongoose";
import QueryBuilder from "../../builder/QueryBuilder";
import { IJournalEntry } from "./journalEntry.interface";
import { JournalEntry } from "./journalEntry.model";
import { v4 as uuidv4 } from "uuid";
import { paginationHelpers } from "../../helpers/paginationHelper";
import { generateJournalEntries } from "./journalEntry.helper";

const post = async (payload: IJournalEntry[]) => {
  // Generate a unique entryId for the journal group
  const entryId = uuidv4();

  // Auto-increment serial number
  const lastEntry = await JournalEntry.findOne().sort({ serialNo: -1 });
  const lastSerial = lastEntry ? lastEntry.serialNo : 0;

  // auto increment journal no
  const lastJournal = await JournalEntry.aggregate([
    {
      $group: {
        _id: "$entryId",
        createdAt: { $first: "$createdAt" },
        journalNo: { $first: "$journalNo" },
      },
    },
    {
      $sort: {
        journalNo: -1,
      },
    },
    {
      $limit: 1,
    },
  ]);
  const lastJournalNo = lastJournal?.length ? lastJournal[0]?.journalNo : 0;
  const newJournalNo = lastJournalNo + 1;

  // Assign the entryId and serial number to each entry
  const entriesWithId = payload.map((entry, index) => ({
    ...entry,
    entryId,
    serialNo: lastSerial + index + 1,
    journalNo: newJournalNo,
  }));

  return await JournalEntry.insertMany(entriesWithId);
};

const patch = async (payload: Partial<IJournalEntry>[], id: string) => {
  const bulkOps = payload.map((entry) => ({
    updateOne: {
      filter: { entryId: id, serialNo: entry.serialNo }, // Match each entry
      update: { $set: entry }, // Update fields
    },
  }));

  return await JournalEntry.bulkWrite(bulkOps);
};

const remove = async (id: string) => {
  return await JournalEntry.deleteMany({ entryId: id });
};

const get = async (id: string) => {
  return await JournalEntry.find({ entryId: id });
};

const getForPrint = async (id: string) => {
  return await JournalEntry.find({ entryId: id }).populate("account");
};

const getAll = async (query: Record<string, any>) => {
  // to generate dummy data for testing
  // await generateJournalEntries();
  const formatedStartDate = query?.from ? new Date(query?.from) : new Date();
  const formatedEndDate = query?.to ? new Date(query?.to) : new Date();

  formatedStartDate.setUTCHours(0, 0, 0, 0);
  formatedEndDate.setUTCHours(23, 59, 59, 999);
  const dateFilter: any = {
    createdAt: {
      $gte: new Date(formatedStartDate), // Start of the day
      $lte: new Date(formatedEndDate),
    },
  };

  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination({
      limit: query?.limit,
      page: query?.page,
    });
  const pipeline = [
    // Stage 1: Filter by Date Range (from - to) ensuring full-day coverage
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $match:
        query?.from && query?.to
          ? {
              ...dateFilter,
            }
          : {},
    },

    // Stage 4: Sort by date (newest first)

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
    // Stage 2: Group by entryId
    {
      $group: {
        _id: "$entryId",
        entries: { $push: "$$ROOT" }, // Collect all entries under 'entries'
        date: { $first: "$createdAt" }, // Take the first date for sorting
      },
    },

    // Stage 3: Filter by accountId (if provided)
    ...(query?.account
      ? [
          {
            $match: {
              "entries.account._id": new Types.ObjectId(query?.account), // Keep groups where any entry has the accountId
            },
          },
        ]
      : []), // If no filter, do nothing

    // Stage 6: Reshape the output
    {
      $project: {
        _id: 0, // Remove MongoDB's default _id
        entryId: "$_id", // Rename _id to entryId
        entries: 1, // Keep entries array
        date: 1, // Keep date field
      },
    }, // Stage 5: Pagination (skip & limit)
    { $skip: skip },
    { $limit: limit },
    { $sort: { date: -1 } },
  ];

  const totalDocument = await JournalEntry.aggregate([
    {
      $group: {
        _id: "$entryId",
      },
    },
    {
      $count: "uniqueCount",
    },
  ]);

  const result = await JournalEntry.aggregate(pipeline as PipelineStage[]);

  return {
    data: result,
    meta: {
      page: page,
      limit: limit,
      total: totalDocument[0]?.uniqueCount, // Total count of documents
    },
  };
};

export const journalEntryService = {
  post,
  patch,
  remove,
  get,
  getAll,
  getForPrint,
};
