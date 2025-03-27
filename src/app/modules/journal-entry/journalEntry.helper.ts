import mongoose, { Types } from "mongoose";
import { faker } from "@faker-js/faker";
import { Ledger } from "../ledger-accounts/ledgerAccounts.model";
import { JournalEntry } from "./journalEntry.model";

export const generateJournalEntries = async () => {
  console.log("Fetching ledgers...");
  const ledgers = await Ledger.find().limit(5000); // More variety in accounts

  if (ledgers.length < 2) {
    console.error("At least 2 ledger accounts are required.");
    process.exit(1);
  }

  console.log("Generating 1 million balanced journal entries...");
  const bulkOps = [];

  for (let i = 0; i < 100_000; i++) {
    const entryId = faker.string.uuid(); // Common ID for double-entry pair
    const debitAccount = ledgers[Math.floor(Math.random() * ledgers.length)];
    let creditAccount;

    // Ensure debit and credit accounts are different
    do {
      creditAccount = ledgers[Math.floor(Math.random() * ledgers.length)] as {
        _id: Types.ObjectId;
      };
    } while (creditAccount._id.equals(debitAccount._id));

    const amount = faker.number.float({ min: 10, max: 5000 });
    const createdAt = faker.date.past();
    bulkOps.push(
      {
        insertOne: {
          document: {
            entryId,
            serialNo: i * 2 + 1, // Serial for debit
            account: debitAccount._id,
            debit: amount,
            credit: 0,
            comment: `Debit entry for ${entryId}`,
            memo: faker.lorem.sentence(),
            journalType: faker.helpers.arrayElement(["general"]),
            budgetType: faker.helpers.arrayElement([
              "regularBudget",
              "irregularBudget",
            ]),
            journalNo: faker.number.int({ min: 1, max: 100000 }),

            createdAt,
            updatedAt: faker.date.recent(),
          },
        },
      },
      {
        insertOne: {
          document: {
            entryId,
            serialNo: i * 2 + 2, // Serial for credit
            account: creditAccount._id,
            debit: 0,
            credit: amount,
            comment: `Credit entry for ${entryId}`,
            memo: faker.lorem.sentence(),
            journalType: faker.helpers.arrayElement(["general"]),
            budgetType: faker.helpers.arrayElement([
              "regularBudget",
              "irregularBudget",
            ]),
            journalNo: faker.number.int({ min: 1, max: 100000 }),
            createdAt,
            updatedAt: faker.date.recent(),
          },
        },
      }
    );

    if (bulkOps.length >= 10000) {
      await JournalEntry.bulkWrite(bulkOps);
      console.log(`${(i + 1) * 2} entries inserted...`);
      bulkOps.length = 0; // Reset batch
    }
  }

  if (bulkOps.length > 0) {
    await JournalEntry.bulkWrite(bulkOps);
  }

  console.log("1 million balanced journal entries inserted successfully!");
  mongoose.disconnect();
};
