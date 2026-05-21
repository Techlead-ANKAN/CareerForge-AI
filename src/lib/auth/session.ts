import { type NextRequest } from "next/server";
import { verifyToken, type JWTPayload } from "./jwt";

export const COOKIE_NAME = "cf_token";

export async function getSessionFromRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}
