import { NextResponse } from "next/server";
import { supabaseAdmin } from "./supabase-admin";
import { supabase } from "./supabase";

type Handler = (req: Request, context?: any) => Promise<NextResponse>;

export function apiWrapper(handler: Handler) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (err: any) {
      console.error("SEMS Captured Error:", err);

      // Attempt to get user ID for context
      let userId: string | null = null;
      try {
        const authHeader = req.headers.get("Authorization");
        const token = authHeader?.split(" ")[1];
        if (token) {
          const { data: { user } } = await supabase.auth.getUser(token);
          userId = user?.id || null;
        }
      } catch (authErr) {
        // Ignore auth fetch errors
      }

      // Log to Supabase error_logs table
      try {
        await supabaseAdmin.from("error_logs").insert({
          user_id: userId,
          message: err.message || "Unknown error",
          stack: err.stack,
          url: req.url,
          method: req.method,
          context: {
            name: err.name,
            cause: err.cause,
            headers: Object.fromEntries(req.headers.entries())
          }
        });
      } catch (logErr) {
        console.error("SEMS Failed to log to DB:", logErr);
      }

      return NextResponse.json(
        { 
          error: "A system error occurred. Our engineers have been notified.",
          message: err.message
        }, 
        { status: err.status || 500 }
      );
    }
  };
}
