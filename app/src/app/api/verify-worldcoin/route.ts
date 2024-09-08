import { env } from "@/env.mjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { proof } = await req.json();
  const app_id = env.NEXT_PUBLIC_WORLDCOIN_APP_ID;
  const action = env.NEXT_PUBLIC_WORLDCOIN_ACTION;

  const verifyRes = await fetch(
    `https://developer.worldcoin.org/api/v1/verify/${app_id}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...proof, action }),
    }
  ).then((res) => res.json());

  if (verifyRes.success) {
    // I perform the verification storage when i return the success
    return NextResponse.json({ success: true, verifyRes }, { status: 200 });
  } else {
    return NextResponse.json(verifyRes, { status: 400 });
  }
}
