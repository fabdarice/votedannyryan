-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "options" TEXT[],
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "vote_option" TEXT NOT NULL,
    "num_votes" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aggregate_votes" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "total_votes" JSONB NOT NULL,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aggregate_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "votes_proposal_id_wallet_key" ON "votes"("proposal_id", "wallet");

-- CreateIndex
CREATE UNIQUE INDEX "aggregate_votes_proposal_id_key" ON "aggregate_votes"("proposal_id");

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "aggregate_votes" ADD CONSTRAINT "aggregate_votes_proposal_id_fkey" FOREIGN KEY ("proposal_id") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
