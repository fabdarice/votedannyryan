import { prisma } from "@/prisma/prisma";
import { NextResponse } from "next/server";

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
      return NextResponse.json({ error: 'No votes found' }, { status: 404 });
    }

    return NextResponse.json(aggregate);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
