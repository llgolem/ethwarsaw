import { env } from "@/env.mjs";
import { NextRequest, NextResponse } from "next/server";
import { CONTRACTS } from "@/lib/contracts";
import { privateKeyToAccount } from "viem/accounts";
import { celoAlfajores, mantleSepoliaTestnet, optimismSepolia, zircuitTestnet } from "wagmi/chains";
import { writeContract } from '@wagmi/core';
import { config } from "@/lib/wagmi";

export async function POST(req: NextRequest) {
  const { proof, userAddress } = await req.json();
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
    // const nullifierHash = verifyRes.nullifier_hash;
    // const privateKey = env.NEXT_PUBLIC_REQUEST_NETWORK_SIGNER as `0x${string}`;
    // const account = privateKeyToAccount(privateKey);

    // const results = await Promise.all(
    //   Object.entries(CONTRACTS).map(async ([chainId, contract]) => {
    //     const chain = [celoAlfajores, mantleSepoliaTestnet, optimismSepolia, zircuitTestnet].find(
    //       (c) => c.id === Number(chainId)
    //     );
    //     try {
    //       const hash = await writeContract(config,{
    //         address: contract.address,
    //         abi: contract.abi,
    //         functionName: 'addBonusCredit',
    //         args: [userAddress, nullifierHash],
    //         account,
    //         chain,
    //       });
    //       return { chainId, success: true, hash };
    //     } catch (error) {
    //       console.error(`Error calling addBonusCredit on chain ${chainId}:`, error);
    //       return { chainId, success: false, error: (error as Error).message };
    //     }
    //   })
    // );

    return NextResponse.json({ success: true, verifyRes }, { status: 200 });
  } else {
    return NextResponse.json(verifyRes, { status: 400 });
  }
}
