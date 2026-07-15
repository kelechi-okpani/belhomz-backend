import { UserRole } from "../../modules/users/interfaces/user.interface";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        role: UserRole;
        email: string;
      };
    }
  }
}

export {};


