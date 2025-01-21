import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifySignature } from '@/lib/ethereum';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { proposalId, signature, wallet, voteOption } = await request.json();

    // TODO: Get Number of votes across blockchains
    const num_votes = 1;

    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });
    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        proposal_id: proposalId,
        wallet,
      },
    });
    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    // 2) Verify signature
    const message = `I vote ${voteOption} for "${proposal.description}"\n\nSigning this transaction is free and will not cost you any gas.`;
    const isValidSignature = await verifySignature(message, signature, wallet);

    if (!isValidSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // 3) Use transaction WITH row-level locking
    const result = await prisma.$transaction(async (tx) => {
      // a) Create the vote record
      const vote = await tx.vote.create({
        data: {
          proposal_id: proposalId,
          wallet,
          signature,
          vote_option: voteOption,
          chainId: 1,
          num_votes: num_votes,
        },
      });

      // b) Make sure there's an aggregateVote row to lock
      let currentAggregate = await tx.aggregateVote.findUnique({
        where: { proposal_id: proposalId },
      });
      if (!currentAggregate) {
        // Create one if it doesn't exist (so we have a row to lock)
        currentAggregate = await tx.aggregateVote.create({
          data: {
            proposal_id: proposalId,
            total_votes: {}, // start empty or some default
          },
        });
      }

      // c) Lock that row in Postgres: SELECT ... FOR UPDATE
      //    This ensures only ONE transaction can modify it at a time.
      await tx.$queryRaw`
        SELECT id FROM "aggregate_votes" 
        WHERE "id" = ${currentAggregate.id} 
        FOR UPDATE
      `;

      // d) Calculate the new totals
      const newTotalVotes = {
        ...currentAggregate.total_votes,
        [voteOption]:
          (currentAggregate.total_votes[voteOption] || 0) + num_votes,
      };

      // e) Update the row now that it's locked
      await tx.aggregateVote.update({
        where: { id: currentAggregate.id },
        data: {
          total_votes: newTotalVotes,
        },
      });

      return vote;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
