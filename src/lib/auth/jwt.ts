import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined in environment variables.");

const secret = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  userId: string;
  username: string;
  role: "employer" | "candidate";
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      role: payload.role as "employer" | "candidate",
    };
  } catch {
    return null;
  }
}
