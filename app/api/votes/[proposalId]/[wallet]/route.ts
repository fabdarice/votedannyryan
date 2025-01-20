import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params: { proposalId, wallet } }: { params: { proposalId: string; wallet: string } }
) {
  try {
    const vote = await prisma.vote.findFirst({
      where: {
        proposal_id: proposalId,
        wallet,
      },
      select: {
        vote_option: true,
      },
    });

    return NextResponse.json({ hasVoted: !!vote, vote_option: vote?.vote_option });
  } catch (error) {
    console.error('Vote check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
