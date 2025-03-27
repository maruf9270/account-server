import { Server } from "http";
import mongoose from "mongoose";
import app from "./app";
import config from "./app/config";
import { insertSuperAdmin } from "./utils/superAdminInserter";
import { postDefaultAccountType } from "./app/modules/account-category/accountCategory.helper";

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log("database connect");

    server = app.listen(config.port, () => {
      console.log(`app is listening on port ${config.port}`);
    });

    // Super Admin insert
    await insertSuperAdmin();

    // inserting default account type
    await postDefaultAccountType();
  } catch (err) {
    console.log(err);
  }
}

main();

process.on("unhandledRejection", (err) => {
  console.log(`😈 unahandledRejection is detected , shutting down ...`, err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`😈  uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
