import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import User from "@/lib/db/models/User";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { COOKIE_NAME } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, role: rawRole } = body as {
      username: string;
      email: string;
      password: string;
      role: string;
    };

    // Validate fields
    if (!username || !email || !password || !rawRole) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }
    if (!["employer", "candidate"].includes(rawRole)) {
      return NextResponse.json({ error: "Role must be employer or candidate." }, { status: 400 });
    }
    const role = rawRole as "employer" | "candidate";
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        { error: "Username must be between 3 and 30 characters." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    await connectDB();

    // Check for duplicate username
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username is already taken. Please choose another." },
        { status: 409 }
      );
    }

    // Check for duplicate email
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
    });

    const token = await signToken({
      userId: String(user._id),
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        user: {
          id: String(user._id),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
