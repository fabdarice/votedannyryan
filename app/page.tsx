"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Github, Twitter, Bug, ThumbsUp, ThumbsDown, Share2, Feather as Ethereum, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { injected } from "wagmi/connectors";

export default function Home() {
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [voteType, setVoteType] = useState<"YES" | "NO" | null>(null);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Mock data - replace with actual blockchain data
  const yesVotes = 1500;
  const noVotes = 500;
  const totalVotes = yesVotes + noVotes;
  const yesPercentage = (yesVotes / totalVotes) * 100;

  const recentVotes = [
    { address: "0x1234...5678", vote: "YES", amount: "5.5 ETH", timestamp: "2 mins ago" },
    { address: "0x8765...4321", vote: "NO", amount: "2.1 ETH", timestamp: "5 mins ago" },
    // Add more mock votes...
  ];

  const handleVote = (type: "YES" | "NO") => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }
    setVoteType(type);
    setShowVoteDialog(true);
    // Implement actual voting logic here
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
            <span className="text-gray-600">{totalVotes} ETH Total</span>
          </div>
          <Progress
            value={yesPercentage}
            className="h-6 mb-2 rounded-full overflow-hidden"
            indicatorStyles={`transition-all duration-500 ${yesPercentage > 50
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-red-400 to-red-500'
              }`}
          />
          <div className="flex justify-between text-sm">
            <span>Yes: {yesVotes} ETH ({yesPercentage.toFixed(1)}%)</span>
            <span>No: {noVotes} ETH ({(100 - yesPercentage).toFixed(1)}%)</span>
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
