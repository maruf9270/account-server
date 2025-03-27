import { Router } from "express";

import { AuthRoutes } from "../modules/auth/auth.route";
import { ProfileRoutes } from "../modules/profile/profile.route";
import { UserRoutes } from "../modules/user/user.route";
import { LedgerRoutes } from "../modules/ledger-accounts/ledgerAccount.route";
import { JournalEntryRoutes } from "../modules/journal-entry/journalEntry.route";
import { VOucherRoutes } from "../modules/voucher/voucher.route";
import { AccountCategoryRoutes } from "../modules/account-category/accountCategoryRoutes";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/profile", route: ProfileRoutes },
  { path: "/user", route: UserRoutes },
  { path: "/ledger-account", route: LedgerRoutes },
  { path: "/journal-entry", route: JournalEntryRoutes },
  { path: "/voucher", route: VOucherRoutes },
  { path: "/account-category", route: AccountCategoryRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
