import { Request, RequestHandler, Response } from "express";
import { StatusCodes as httpStatus } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ledgerAccountService } from "./ledgerAccounts.service";

const create: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ledgerAccountService.post(req.body);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Ledger account created successfully!",
      data: result,
    });
  }
);
const update: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ledgerAccountService.patch(req.body, req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Ledger updated successfully!",
      data: result,
    });
  }
);
const remove: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ledgerAccountService.remove(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Ledger Removed successfully!",
      data: result,
    });
  }
);
const getSingle: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ledgerAccountService.get(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Ledger Retrieved successfully!",
      data: result,
    });
  }
);
const getAll: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ledgerAccountService.getAll(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Ledger Retrieved successfully!",
      data: result,
    });
  }
);

const getTrialBalanceData: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ledgerAccountService.getTrialBalanceData(
      req.query as Record<string, string>
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Trial Balance data retrieved successfully!",
      data: result,
    });
  }
);

const getIncomeStatement: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const currentDate = new Date(); // Get the current date
    currentDate.setFullYear(currentDate.getFullYear() - 1);
    const startDate = req?.query?.from ?? currentDate;
    const endDate = req?.query?.to ?? new Date();

    const result = await ledgerAccountService.getIncomeStatement(
      startDate as Date,
      endDate as unknown as Date
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Income Statement data retrieved successfully!",
      data: result,
    });
  }
);

const getAllLedgerBalances: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const currentDate = new Date(); // Get the current date
    currentDate.setFullYear(currentDate.getFullYear() - 1);
    const startDate = req?.query?.from ?? currentDate;
    const endDate = req?.query?.to ?? new Date();

    const result = await ledgerAccountService.getLedgerBalances(
      req?.params?.id,
      { from: startDate as string, to: endDate as string }
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: " successfully!",
      data: result,
    });
  }
);
// const create: RequestHandler = catchAsync(
//   async (req: Request, res: Response) => {
//     const result = await ledgerAccountService.post(req.body);

//     sendResponse(res, {
//       statusCode: httpStatus.OK,
//       success: true,
//       message: " successfully!",
//       data: result,
//     });
//   }
// );

export const LedgerController = {
  create,
  update,
  remove,
  getAll,
  getSingle,
  getTrialBalanceData,
  getIncomeStatement,
  getAllLedgerBalances,
};
