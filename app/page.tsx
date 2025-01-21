"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Github, Twitter, ThumbsUp, ThumbsDown, Share2, Feather as Ethereum, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { injected } from "wagmi/connectors";

require('dotenv').config();

export default function Home() {
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [voteType, setVoteType] = useState<"YES" | "NO" | null>(null);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [voteData, setVoteData] = useState({
    yesVotes: 0,
    noVotes: 0,
    totalVotes: 0,
    yesPercentage: 0,
    noPercentage: 0,
  });

  const recentVotes = [
    { address: "0x1234...5678", vote: "YES", amount: "5.5 ETH", timestamp: "2 mins ago" },
    { address: "0x8765...4321", vote: "NO", amount: "2.1 ETH", timestamp: "5 mins ago" },
    // Add more mock votes...
  ];

  useEffect(() => {
    const fetchVoteData = async () => {
      try {
        const proposalId = "your_proposal_id"; // Replace with actual proposal ID
        const response = await fetch(`/api/aggregate/${proposalId}`);

        if (!response.ok) {
          console.error("Failed to fetch vote data:", response.statusText);
          return;
        }

        const aggregate = await response.json();

        // Process vote distribution
        const yesVotes = aggregate.total_votes.YES || 0;
        const noVotes = aggregate.total_votes.NO || 0;
        const totalVotes = yesVotes + noVotes;
        const yesPercentage = (yesVotes / totalVotes) * 100 || 0;
        const noPercentage = 100 - yesPercentage;

        setVoteData({
          yesVotes,
          noVotes,
          totalVotes,
          yesPercentage,
          noPercentage,
        });

      } catch (error) {
        console.error("Error fetching vote data:", error);
      }
    };

    fetchVoteData();
  }, []);

  const handleVote = async (vote: "YES" | "NO") => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    try {
      const proposalId = process.env.PROPOSAL_ID;
      const voteMessage = `I vote ${vote} for "Danny Ryan as the sole Executive Director of the Ethereum Foundation".\n\nSigning this transaction is free and will not cost you any gas.`;

      // Sign the message using the wallet
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [voteMessage, address],
      });

      // Prepare the vote payload
      const votePayload = {
        proposalId,
        signature,
        wallet: address,
        voteOption: vote,
      };

      console.log({ votePayload });

      // Call the API to submit the vote
      const response = await fetch(`/api/votes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(votePayload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Vote failed:", result.error);
        alert(`Vote failed: ${result.error}`);
        return;
      }

      console.log("Vote successful:", result);
      setVoteType(vote);
      setShowVoteDialog(true);
    } catch (error) {
      console.error("Error handling vote:", error);
      alert("An error occurred while voting. Please try again.");
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto p-6">
        {isConnected ? (
          <Button
            onClick={() => disconnect()}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-6 py-2 shadow-lg transition-all duration-300 border border-blue-300/20 backdrop-blur-sm"
          >
            <Wallet className="mr-2 h-4 w-4" />
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </Button>
        ) : (
          <Button
            onClick={() => connect({ connector: injected() })}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-6 py-2 shadow-lg transition-all duration-300 border border-blue-300/20 backdrop-blur-sm"
          >
            <Wallet className="mr-2 h-4 w-4" />
            Connect Wallet
          </Button>
        )}
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-blue-100">
        <h1 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Danny Ryan as the sole Executive Director of the Ethereum Foundation
        </h1>

        <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100">
          <blockquote className="text-md text-center italic text-gray-700">
            "Ethereum's infancy is long past, and its adolescence, too, is now in the rear-view mirror. As a young adult, the world is riddled with complexity, false prophets, complex incentives, dead-ends, and other dangers. Everyone's true-north of what Ethereum should be and where it all should go is a bit different, but in aggregate, each decision that you make sums with all others to direct Ethereum through this critical time. Stay true to the good. Do your part in keeping Ethereum on the serendipitous path that has been cultivated since its genesis."
          </blockquote>
          <div className="text-right text-gray-700 pt-4 italic">-- Danny Ryan</div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="font-semibold">Vote Distribution</span>
            <span className="text-gray-600">{voteData.totalVotes} ETH Total</span>
          </div>
          <Progress
            value={voteData.yesPercentage}
            className="h-6 mb-2 rounded-full overflow-hidden"
            indicatorStyles={`transition-all duration-500 ${voteData.yesPercentage > 50
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
          />
          <div className="flex justify-between text-sm">
            <span>Yes: {voteData.yesVotes} ETH ({voteData.yesPercentage.toFixed(1)}%)</span>
            <span>No: {voteData.noVotes} ETH ({(100 - voteData.yesPercentage).toFixed(1)}%)</span>
          </div>
        </div>

        <div className="flex gap-4 justify-center mb-12">
          <Button
            onClick={() => handleVote("YES")}
            className="relative overflow-hidden group bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg transition-all duration-300 border border-green-400/20"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            <ThumbsUp className="mr-2" /> Vote YES
          </Button>
          <Button
            onClick={() => handleVote("NO")}
            className="relative overflow-hidden group bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white px-8 py-6 text-lg rounded-xl shadow-lg transition-all duration-300 border border-red-400/20"
          >
            <div className="absolute inset-0 bg-white/20 transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            <ThumbsDown className="mr-2" /> Vote NO
          </Button>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold mb-4">Recent Votes</h2>
          <div className="space-y-4">
            {recentVotes.map((vote, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-50 hover:border-blue-200 transition-colors duration-200">
                <div className="flex items-center">
                  <Ethereum className="mr-2 text-blue-500" />
                  <span className="font-mono">{vote.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={vote.vote === "YES" ? "text-green-500" : "text-red-500"}>
                    {vote.vote}
                  </span>
                  <span className="text-gray-600">{vote.amount}</span>
                  <span className="text-gray-400 text-sm">{vote.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="text-center mt-8 text-gray-600 space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Github className="h-4 w-4" />
          <span>Code opensource on</span>
          <a
            href="https://github.com/fabdarice/votedannyryan"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors"
          >
            github
          </a>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Twitter className="h-4 w-4" />
          <span>Bugs? Contact</span>
          <a
            href="https://x.com/fabdarice"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
          >
            @fabdarice
          </a>
        </div>
      </footer>


      <Dialog open={showVoteDialog} onOpenChange={setShowVoteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Vote!</DialogTitle>
          </DialogHeader>
          <div className="bg-blue-50 p-6 rounded-lg text-center">
            <h3 className="text-xl mb-4">
              You voted {voteType} for Danny Ryan as Executive Director!
            </h3>
            <Button
              onClick={() => window.open("https://twitter.com/intent/tweet")}
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white"
            >
              <Share2 className="mr-2" /> Share on Twitter
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
