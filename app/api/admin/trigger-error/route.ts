import { NextResponse } from "next/server";
import { apiWrapper } from "@/lib/api-wrapper";

export const GET = apiWrapper(async (req: Request) => {
  // Deliberately trigger an error to test SEMS
  throw new Error("SEMS TEST ERROR: This is a deliberate failure for verification purposes.");
  
  return NextResponse.json({ message: "This should not be reachable" });
});
