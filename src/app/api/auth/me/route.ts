import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import { getSessionFromRequest } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  await connectDB();

  const user = await User.findById(session.userId).select("-password");
  if (!user) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: String(user._id),
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
}
