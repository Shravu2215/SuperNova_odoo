import { UserRole } from "@prisma/client";

export interface SafeEmployee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  deptId: string;
  createdAt: Date;
}
