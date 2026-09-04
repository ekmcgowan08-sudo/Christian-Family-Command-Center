import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      familyId: string;
      familyName: string;
      role: "OWNER" | "MEMBER";
    } & DefaultSession["user"];
  }

  interface User {
    familyId: string;
    familyName: string;
    role: "OWNER" | "MEMBER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    familyId: string;
    familyName: string;
    role: "OWNER" | "MEMBER";
  }
}
