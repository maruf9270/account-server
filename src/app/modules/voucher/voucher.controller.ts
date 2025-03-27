import { Request, RequestHandler, Response } from "express";
import { StatusCodes as httpStatus } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { VoucherService } from "./voucher.srvice";

const create: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    console.log(req.body);
    const result = await VoucherService.post(req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "Voucher created successfully!",
      data: result,
    });
  }
);

const update: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await VoucherService.patch(req.body, req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Voucher updated successfully!",
      data: result,
    });
  }
);

const remove: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await VoucherService.remove(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Voucher removed successfully!",
      data: result,
    });
  }
);

const getSingle: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await VoucherService.get(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Voucher retrieved successfully!",
      data: result,
    });
  }
);

const getSingleForPrint: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await VoucherService.getForPrint(req.params.id);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Voucher retrieved successfully!",
      data: result,
    });
  }
);

const getAll: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await VoucherService.getAll(req.query);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Voucher retrieved successfully!",
      data: result,
    });
  }
);

export const VoucherController = {
  create,
  update,
  remove,
  getAll,
  getSingle,
  getSingleForPrint,
};
