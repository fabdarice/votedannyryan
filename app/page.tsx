"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { Github, Twitter, ThumbsUp, ThumbsDown, Share2, Feather as Ethereum, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { injected } from "wagmi/connectors";
import { formatEther, parseEther } from "viem";
import { timeAgo } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

require('dotenv').config();

interface Vote {
  wallet: string;
  vote_option: string;
  num_votes: string;
  created_at: string;
}

export default function Home() {
  const [showVoteDialog, setShowVoteDialog] = useState(false);
  const [userVote, setUserVote] = useState<"YES" | "NO" | null>(null);
  const [userNumVotes, setUserNumVotes] = useState(null);

  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { toast } = useToast();


  const [voteData, setVoteData] = useState({
    yesVotes: 0,
    noVotes: 0,
    totalVotes: 0,
    yesPercentage: 0,
    noPercentage: 0,
  });

  const [recentVotes, setRecentVotes] = useState<Vote[]>([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const fetchUserVote = async () => {
      if (isConnected && address) {
        try {
          const proposalId = process.env.NEXT_PUBLIC_PROPOSAL_ID;
          const response = await fetch(`/api/votes/${proposalId}/${address}`);

          if (!response.ok) {
            toast({
              title: "Error fetching user's vote",
              description: response.statusText,
              variant: "destructive"
            })
            return;
          }

          const data = await response.json();
          setUserVote(data["voteOption"]);
          setUserNumVotes(data["numVotes"]);
        } catch (error) {
          toast({
            title: "Error fetching user's vote",
            description: "",
            variant: "destructive"
          })
        }
      }
    };

    fetchUserVote();
  }, [isConnected, address, userVote]);

  useEffect(() => {
    const fetchVoteData = async () => {
      try {
        const proposalId = process.env.NEXT_PUBLIC_PROPOSAL_ID
        const response = await fetch(`/api/aggregate/${proposalId}`);

        if (!response.ok) {
          toast({
            title: "Error fetching all votes",
            description: response.statusText,
            variant: "destructive"
          })
          return;
        }

        const aggregate = await response.json();
        const yesVotesBig = parseEther(aggregate.total_votes.YES || "0");
        const noVotesBig = parseEther(aggregate.total_votes.NO || "0");
        const yesVotes = parseFloat(formatEther(yesVotesBig));
        const noVotes = parseFloat(formatEther(noVotesBig));
        const totalVotes = yesVotes + noVotes
        const yesPercentage = totalVotes === 0 ? 0 : (yesVotes / totalVotes) * 100;
        const noPercentage = totalVotes === 0 ? 0 : 100 - yesPercentage;

        setVoteData({
          yesVotes,
          noVotes,
          totalVotes,
          yesPercentage,
          noPercentage,
        });

      } catch (error) {
        toast({
          title: "Error fetching all votes",
          description: "",
          variant: "destructive"
        })
      }
    };

    fetchVoteData();
  }, [userVote]);


  useEffect(() => {
    const fetchRecentVotes = async () => {
      try {
        const proposalId = process.env.NEXT_PUBLIC_PROPOSAL_ID
        const response = await fetch(`/api/votes/${proposalId}`);

        if (!response.ok) {
          toast({
            title: "Error fetching recent votes",
            description: response.statusText,
            variant: "destructive"
          })
          return;
        }

        const data = await response.json();
        setTotalVotes(data.totalVotes);
        setRecentVotes(data.votes);

      } catch (error) {
        toast({
          title: "Error fetching recent votes",
          description: "",
          variant: "destructive"
        })
      }
    };

    fetchRecentVotes();
  }, [userVote]);

  const handleVote = async (vote: "YES" | "NO") => {
    if (!isConnected) {
      connect({ connector: injected() });
      return;
    }

    try {
      const proposalId = process.env.NEXT_PUBLIC_PROPOSAL_ID;
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
        toast({
          title: "Error voting",
          description: result.error,
          variant: "destructive"
        })
        return;
      }

      setUserVote(vote);
      setShowVoteDialog(true);
    } catch (error) {
      toast({
        title: "Error voting",
        description: "",
        variant: "destructive"
      })
    }
  };

  return (
    <div className="min-h-screen p-8 pt-16">
      {/* <div className="max-w-4xl mx-auto p-6"> */}
      {/*   {isConnected ? ( */}
      {/*     <Button */}
      {/*       onClick={() => disconnect()} */}
      {/*       className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-6 py-2 shadow-lg transition-all duration-300 border border-blue-300/20 backdrop-blur-sm" */}
      {/*     > */}
      {/*       <Wallet className="mr-2 h-4 w-4" /> */}
      {/*       {address?.slice(0, 6)}...{address?.slice(-4)} */}
      {/*     </Button> */}
      {/*   ) : ( */}
      {/*     <Button */}
      {/*       onClick={() => connect({ connector: injected() })} */}
      {/*       className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-full px-6 py-2 shadow-lg transition-all duration-300 border border-blue-300/20 backdrop-blur-sm" */}
      {/*     > */}
      {/*       <Wallet className="mr-2 h-4 w-4" /> */}
      {/*       Connect Wallet */}
      {/*     </Button> */}
      {/*   )} */}
      {/* </div> */}

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
            <span className="text-gray-600 font-semibold">{voteData.totalVotes.toFixed(2)} ETH Total</span>
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
            <span>Yes: {voteData.yesVotes.toFixed(2)} ETH ({voteData.yesPercentage.toFixed(2)}%)</span>
            <span>No: {voteData.noVotes.toFixed(2)} ETH ({(100 - voteData.yesPercentage).toFixed(2)}%)</span>
          </div>
        </div>

        {userVote ? (
          <div className="rounded-lg text-center gap-4 pb-6">
            <h3 className="text-xl mb-4 text-gray-600">
              You voted <span className={userVote === "YES" ? "text-green-500" : "text-red-500"}>{userVote}</span> with {parseFloat(userNumVotes ?? "0").toFixed(5)} ETH
            </h3>
            <Button
              onClick={() => window.open("https://twitter.com/intent/tweet")}
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white"
            >
              <Share2 className="mr-2" /> Share on Twitter
            </Button>
          </div>
        ) : (
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
          </div>)}

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold mb-4">Recent Votes <span className="text-sm pl=2 text-gray-600">(Total: {totalVotes})</span></h2>
          <div className="space-y-4">
            {recentVotes.map((vote, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-4 rounded-lg border border-blue-50 hover:border-blue-200 transition-colors duration-200">
                <div className="flex items-center">
                  <Ethereum className="mr-2 text-blue-500" />
                  <span className="font-mono">{vote.wallet}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={vote.vote_option === "YES" ? "text-green-500" : "text-red-500"}>
                    {vote.vote_option}
                  </span>
                  <span className="text-gray-600">{parseFloat(vote.num_votes).toFixed(4)} ETH</span>
                  <span className="text-gray-400 text-sm">{timeAgo(vote.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-left">
                What is the purpose of this vote?
              </AccordionTrigger>
              <AccordionContent>
                This vote is designed to showcase the Ethereum community’s support (or lack thereof) for whether Danny Ryan should become the sole Executive Director of the Ethereum Foundation.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-left">
                How is my vote weighted?
              </AccordionTrigger>
              <AccordionContent>
                Votes are weighted based on the amount of ETH in your connected wallet at the time of voting. The following blockchains are supported: Ethereum, Base, Optimism, Arbitrum, zkSync, Polygon, Linea, and PolygonSL. This ensures that stakeholders with greater investments in the Ethereum ecosystem have a proportional influence on the outcome.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Is it safe to vote?
              </AccordionTrigger>
              <AccordionContent>
                Yes, voting is safe. The code is public and available&nbsp;
                <a
                  href="https://github.com/fabdarice/votedannyryan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                >
                  here</a>.<br />
                It only requires a wallet signature with the following text:
                `I vote YES|NO for "Danny Ryan as the sole Executive Director of the Ethereum Foundation".
                Signing this transaction is free and will not cost you any gas.`
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">

                Do I need to pay any gas to vote?
              </AccordionTrigger>
              <AccordionContent>
                No, voting is completely free and does not require sending any transaction on-chain.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
              You voted <span className={userVote === "YES" ? "text-green-500" : "text-red-500"}>{userVote}</span> for Danny Ryan as Executive Director!
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
    </div >
  );
}
