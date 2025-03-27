import { Request, Response } from "express";

import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { ILoginUserResponse, IRefreshTokenResponse } from "./auth.interface";
import { AuthService } from "./auth.service";
import config from "../../config";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;

  const result = await AuthService.loginUser(loginData);
  const { refreshToken } = result;
  // set refresh token into cookie
  const cookieOptions = {
    secure: config?.env === "production",
    httpOnly: true,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  sendResponse<ILoginUserResponse>(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully !",
    data: result,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  console.log(req.headers.authorization);
  const refreshToken = req.headers.authorization;

  const result = await AuthService.refreshToken(refreshToken as string);

  // set refresh token into cookie
  const cookieOptions = {
    secure: config.env === "production",
    httpOnly: true,
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: 200,
    success: true,
    message: "User logged in successfully !",
    data: result,
  });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const { ...passwordData } = req.body;

  await AuthService.changePassword(user, passwordData);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Password changed successfully !",
  });
});

const forgotPass = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPass(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Check your email!",
    data: result,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Account recovered!",
  });
});

// const changePaswordByAdmin = catchAsync(async (req: Request, res: Response) => {
//   await AuthService.changePasswordBySuperAdmin(req?.user, req.body);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'Password has been changed',
//   });
// });

// const rusticateUser = catchAsync(async (req: Request, res: Response) => {
//   await AuthService.rusticateUser(req.body.id);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User has been rusticated',
//   });
// });

// const makeUserActive = catchAsync(async (req: Request, res: Response) => {
//   await AuthService.makeUserActive(req.body.id);

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: 'User has been Activated',
//   });
// });
export const AuthController = {
  loginUser,
  refreshToken,
  changePassword,
  forgotPass,
  resetPassword,
  // changePaswordByAdmin,
  // rusticateUser,
  // makeUserActive,
};
