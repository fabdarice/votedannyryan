export const dynamic = 'force-dynamic';
import { prisma } from '@/prisma/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const adminKey = request.headers.get('x-admin-key')

    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { description, options } = await request.json();

    const proposal = await prisma.proposal.create({
      data: {
        description,
        options,
      },
    });
    return NextResponse.json(proposal);
  } catch (error) {


    console.error('Error seeeding proposal: ', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
