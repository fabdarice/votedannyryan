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

    const totalVoters = await prisma.vote.count({
      where: {
        proposal_id: proposalId,
      },
    });
    // Count the number of unique voters who voted "YES"
    const yesVoters = await prisma.vote.count({
      where: {
        proposal_id: proposalId,
        vote_option: "YES",
      },
    });

    // Count the number of unique voters who voted "NO"
    const noVoters = await prisma.vote.count({
      where: {
        proposal_id: proposalId,
        vote_option: "NO",
      },
    });

    return NextResponse.json({ votes, totalVoters, yesVoters, noVoters });
  } catch (error) {
    console.error('Could not fetch recent votes: ', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
