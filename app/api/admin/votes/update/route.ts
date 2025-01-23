import { getETHBalanceAllNetworks } from "@/lib/alchemy";
import { sleep } from "@/lib/utils";
import { prisma } from "@/prisma/prisma";
import { AggregateVote, Prisma, Vote } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { formatEther, parseEther } from "viem";

export async function POST(request: NextRequest) {
  const adminKey = request.headers.get('x-admin-key')

  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const votes: Vote[] = await prisma.vote.findMany({
      orderBy: {
        updated_at: 'asc',
      },
      take: 10,
    });

    if (votes.length === 0) {
      return NextResponse.json({ message: 'No votes to update.' }, { status: 200 });
    }

    for (const vote of votes) {
      const { id, wallet, num_votes, proposal_id, vote_option } = vote;

      const newNumVotes: bigint = await getETHBalanceAllNetworks(wallet);
      const previousNumVotes = parseEther(num_votes); // Convert string to bigint
      const diff = newNumVotes - previousNumVotes;

      if ((diff >= parseEther('0') && diff < parseEther("0.001")) || (diff < parseEther('0') && diff > parseEther("-0.001"))) {
        continue;
      }

      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        await tx.vote.update({
          where: { id },
          data: {
            num_votes: formatEther(newNumVotes), // Store as string
            updated_at: new Date(), // Update the timestamp
          },
        });

        let aggregateVote: AggregateVote | null = await tx.aggregateVote.findUnique({
          where: { proposal_id },
        });

        if (!aggregateVote) {
          console.error('[Update] Aggregate vote not found for proposal:', proposal_id);
          return;
        }

        // Lock the row to prevent race conditions
        await tx.$queryRaw`
          SELECT id FROM "aggregate_votes"
          WHERE "id" = ${aggregateVote.id}
          FOR UPDATE
        `;

        const currentTotalVotes = aggregateVote.total_votes as Record<string, string>;
        const voteOption = vote_option.toUpperCase();

        const existingVotes = currentTotalVotes[voteOption]
          ? parseEther(currentTotalVotes[voteOption])
          : BigInt(0);

        // Calculate the new total
        const updatedVotes = existingVotes + diff;

        // Update the total_votes object
        const newTotalVotes = {
          ...currentTotalVotes,
          [voteOption]: formatEther(updatedVotes),
        };

        // **iv. Update the `aggregate_votes` Row**
        await tx.aggregateVote.update({
          where: { id: aggregateVote.id },
          data: {
            total_votes: newTotalVotes,
            last_updated_at: new Date(),
          },
        });
        await sleep(200);
      });

    }

    return NextResponse.json({ message: 'Votes updated successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error updating votes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
