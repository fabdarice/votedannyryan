import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

// app/api/votes/[proposalId]/route.ts
export async function GET(
  request: Request,
  { params: { proposalId } }: { params: { proposalId: string } }
) {
  try {
    const votes = await prisma.vote.findMany({
      where: {
        proposal_id: proposalId,
      },
      select: {
        wallet: true,
        vote_option: true,
        num_votes: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 5,
    });

    const totalVotes = await prisma.vote.count({
      where: {
        proposal_id: proposalId,
      },
    });

    return NextResponse.json({ votes, totalVotes });
  } catch (error) {
    console.error('Recent votes retrieval error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
