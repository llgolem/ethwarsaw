import { env } from "@/env.mjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const proof = await req.json();
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
    // TODO: Implement backend actions if the verification succeeds
    // verify on all 4 chains
    // Such as, setting a user as "verified" in a database
    return NextResponse.json(verifyRes, { status: 200 });
  } else {
    // This is where you should handle errors from the World ID /verify endpoint.
    // Usually these errors are due to a user having already verified.
    return NextResponse.json(verifyRes, { status: 400 });
  }
}
