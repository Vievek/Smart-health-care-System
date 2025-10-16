import { IUser } from "@shared/healthcare-types";

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id?: string };
    }
  }
}

export {};
