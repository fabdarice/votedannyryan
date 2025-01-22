import { getEthPrice } from "@/lib/ethereum";
import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";
import { formatEther } from "viem";

// app/api/aggregate/[proposalId]/route.ts
export async function GET(
  request: Request,
  { params: { proposalId } }: { params: { proposalId: string } }
) {
  try {
    const aggregate = await prisma.aggregateVote.findUnique({
      where: { proposal_id: proposalId },
    });

    if (!aggregate) {
      console.warn('No aggregated votes found');
      return NextResponse.json({ error: 'No votes found' }, { status: 404 });
    }

    let ethPrice: number = await getEthPrice();
    const totalVoteUSD = aggregate.total_votes
      // @ts-ignore
      ? (Number(aggregate.total_votes["YES"] || "0") + Number(aggregate.total_votes["NO"] || "0")) * ethPrice
      : 0;

    return NextResponse.json({ aggregate, totalVoteUSD });
  } catch (error) {
    console.error('Could not fetch aggregated votes: ', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
