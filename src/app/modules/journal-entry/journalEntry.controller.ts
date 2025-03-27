import { Request, RequestHandler, Response } from "express";
import { StatusCodes as httpStatus } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { journalEntryService } from "./journalEntry.service";

const create: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    console.log(req.body);
    const result = await journalEntryService.post(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Journal entry created successfully!",
      data: result,
    });
  }
);

const update: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await journalEntryService.patch(req.body, req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Journal entry updated successfully!",
      data: result,
    });
  }
);

const remove: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await journalEntryService.remove(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Journal entry removed successfully!",
      data: result,
    });
  }
);

const getSingle: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await journalEntryService.get(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Journal entry retrieved successfully!",
      data: result,
    });
  }
);

const getSingleForPrint: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await journalEntryService.getForPrint(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Journal entry retrieved successfully!",
      data: result,
    });
  }
);

const getAll: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await journalEntryService.getAll(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Journal entries retrieved successfully!",
      data: result,
    });
  }
);

export const JournalEntryController = {
  create,
  update,
  remove,
  getAll,
  getSingle,
  getSingleForPrint,
};
