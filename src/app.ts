import express, { Application, Request, Response } from "express";
import cors from "cors";
import globalErrorHandler from "./app/middleware/GlobalErrorHandler";
import notFound from "./app/middleware/notFound";
import router from "./app/routes";
import cookieParser from "cookie-parser";
import NodeCache from "node-cache";
import config from "./app/config";
const app: Application = express();

app.use(express.json());
app.use(cors({ origin: config.front_end_url, credentials: true }));
app.use(cookieParser());

// Cache server
export const cacheServer = new NodeCache({ stdTTL: 3600, checkperiod: 3600 });

//? module routes

app.use("/api/v1", router);
app.use(cors({ origin: config.front_end_url, credentials: true }));
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Account");
});

// ! Global Error handler
app.use(globalErrorHandler);
//Not Found
app.use(notFound);

export default app;
