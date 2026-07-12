import { Request, Response, NextFunction } from "express";
import { ZodTypeAny } from "zod";
import { sendError } from "../utils/apiResponse";

type Target = "body" | "query" | "params";

export function validate(schema: ZodTypeAny, target: Target = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return sendError(
        res,
        400,
        "VALIDATION_ERROR",
        "Invalid request data",
        result.error.flatten().fieldErrors
      );
    }
    req[target] = result.data;
    next();
  };
}
