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
import { useAccount } from "wagmi";
import { Github, Twitter, ThumbsUp, ThumbsDown, Share2, Feather as Ethereum, Wallet, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatEther, parseEther } from "viem";
import { formatNumberWithCommas, formatUSD, timeAgo, truncateAddress } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSignMessage } from "wagmi";
import { useAppKit } from "@reown/appkit/react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';


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
  const [yesVoters, setYesVoters] = useState(0);
  const [noVoters, setNoVoters] = useState(0);

  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const { signMessageAsync } = useSignMessage();
  const { open } = useAppKit();
  const [isLoading, setIsLoading] = useState(false);

  const [voteData, setVoteData] = useState({
    yesVotes: 0,
    noVotes: 0,
    totalVotes: 0,
    yesPercentage: 0,
    noPercentage: 0,
    totalVoteUSD: 0,
  });

  const [recentVotes, setRecentVotes] = useState<Vote[]>([]);
  const [totalVoters, setTotalVoters] = useState(0);

  const pieData = [
    { name: 'Yes Votes', value: voteData.yesVotes, color: '#22c55e' },
    { name: 'No Votes', value: voteData.noVotes, color: '#ef4444' },
  ];

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

        const { aggregate, totalVoteUSD } = await response.json();
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
          totalVoteUSD,
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
        setTotalVoters(data.totalVoters);
        setYesVoters(data.yesVoters);
        setNoVoters(data.noVoters);
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
      open();
      return;
    }

    try {

      setIsLoading(true);
      const proposalId = process.env.NEXT_PUBLIC_PROPOSAL_ID;
      const voteMessage = `I vote ${vote} for "Danny Ryan as the sole Executive Director of the Ethereum Foundation".\n\nSigning this transaction is free and will not cost you any gas.`;

      const signature = await signMessageAsync({
        message: voteMessage,
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
    } finally {
      setIsLoading(false);
    }
  };
  const handleShareTwitter = () => {
    if (!userVote) {
      return;
    }

    const tweetText = `I voted ${userVote} for Danny Ryan as the sole Executive Director of the Ethereum Foundation.\n\nhttps://www.votedannyryan.com/`;
    const encodedTweet = encodeURIComponent(tweetText);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedTweet}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen p-3 pt-3">
      <div className="max-w-4xl mx-auto flex justify-end pb-3">
        <appkit-button />
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 backdrop-blur-sm border border-blue-100">
        <h1 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
          Danny Ryan as the sole Executive Director of the Ethereum Foundation
        </h1>

        <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100 hidden sm:block">
          <blockquote className="text-md text-center italic text-gray-700">
            Ethereum&apos;s infancy is long past, and its adolescence, too, is now in the rear-view mirror. As a young adult, the world is riddled with complexity, false prophets, complex incentives, dead-ends, and other dangers. Everyone&apos;s true-north of what Ethereum should be and where it all should go is a bit different, but in aggregate, each decision that you make sums with all others to direct Ethereum through this critical time. Stay true to the good. Do your part in keeping Ethereum on the serendipitous path that has been cultivated since its genesis.
          </blockquote>
          <div className="text-right text-gray-700 pt-4 italic">-- Danny Ryan</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Vote Distribution</h3>
              <div className="text-right">
                <div className="text-sm text-gray-600">Total Votes</div>
                <div className="font-medium">{formatNumberWithCommas(voteData.totalVotes)} ETH</div>
                <div className="text-sm text-gray-500">{formatUSD(voteData.totalVoteUSD)}</div>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between text-sm mt-4">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <div>
                  <div>Yes: {voteData.yesPercentage.toFixed(2)}%</div>
                  <div className="text-gray-600">{formatNumberWithCommas(voteData.yesVotes)} ETH</div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <div>
                  <div>No: {voteData.noPercentage.toFixed(2)}%</div>
                  <div className="text-gray-600">{formatNumberWithCommas(voteData.noVotes)} ETH</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h3 className="text-lg font-semibold mb-4">Voter Participation</h3>
            <div className="space-y-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{totalVoters}</span>
                </div>
                <p className="text-gray-600">Total Voters</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xl font-semibold text-green-500">{yesVoters}</div>
                  <div className="text-sm text-gray-600">Yes Voters</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-xl font-semibold text-red-500">{noVoters}</div>
                  <div className="text-sm text-gray-600">No Voters</div>
                </div>
              </div>
              <Progress
                value={voteData.yesPercentage}
                className="h-2 rounded-full"
              />
              <div className="text-sm text-gray-600 text-center">
                {((yesVoters / totalVoters) * 100).toFixed(2)}% Yes Voters
              </div>
            </div>
          </div>
        </div>


        {userVote ? (
          <div className="rounded-lg text-center gap-4 pb-6">
            <h3 className="text-xl mb-4 text-gray-600">
              You voted <span className={userVote === "YES" ? "text-green-500" : "text-red-500"}>{userVote}</span> with {parseFloat(userNumVotes ?? "0").toFixed(5)} ETH
            </h3>
            <Button
              onClick={handleShareTwitter}
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white"
            >
              <Share2 className="mr-2" /> Share on Twitter
            </Button>
          </div>
        ) : (
          <div className="flex gap-6 justify-center mb-12">
            <Button
              onClick={() => handleVote("YES")}
              className="group relative flex items-center overflow-hidden bg-white hover:bg-gray-50 text-gray-800 px-10 py-6 text-lg rounded-2xl shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-gray-100/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <ThumbsUp className="mr-3 h-5 w-5" />
              <span className="font-medium tracking-wide">Vote YES</span>
            </Button>
            <Button
              onClick={() => handleVote("NO")}
              className="group relative flex items-center overflow-hidden bg-white hover:bg-gray-50 text-gray-800 px-10 py-6 text-lg rounded-2xl shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-gray-300"
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-gray-100/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <ThumbsDown className="mr-3 h-5 w-5" />
              <span className="font-medium tracking-wide">Vote NO</span>
            </Button>
          </div>
        )}

        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold mb-4">
            Recent Votes
          </h2>
          <div className="space-y-4">
            {recentVotes.map((vote, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-4 rounded-lg border border-blue-50 hover:border-blue-200 transition-colors duration-200"
              >
                {/* Wallet Address Section */}
                <div className="flex items-center mb-2 sm:mb-0">
                  <Ethereum className="mr-2 text-blue-500" />
                  {/* Truncate address on small screens */}
                  <span className="font-mono text-sm sm:text-base">
                    <span className="block sm:hidden">
                      {truncateAddress(vote.wallet, 4)}
                    </span>
                    <span className="hidden sm:block">{vote.wallet}</span>
                  </span>
                </div>

                {/* Vote and ETH Section */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <span
                    className={`text-sm sm:text-base font-medium ${vote.vote_option === 'YES' ? 'text-green-500' : 'text-red-500'
                      }`}
                  >
                    {vote.vote_option}
                  </span>
                  <span className="text-gray-600 text-sm sm:text-base">
                    {parseFloat(vote.num_votes.toString()).toFixed(4)} ETH
                  </span>
                  <span className="text-gray-400 text-xs sm:text-sm hidden sm:block">
                    {timeAgo(vote.created_at)}
                  </span>
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
                Votes are weighted based on the amount of ETH, ETH staked (beaconchain), ETH derivates in your connected wallet at the time of voting. The following blockchains are supported: $ETH (Ethereum, Base, Optimism, Arbitrum, zkSync, Linea), WETH (L1, Base, Optimism, Arbitrum), rETH (L1), stETH (L1, Base, Arbitrum, Optimism), Aave ETH (L1), Aave stETH (L1), Aave eETH (L1). This ensures that stakeholders with greater investments in the Ethereum ecosystem have a proportional influence on the outcome.
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
                `I vote YES|NO for Danny Ryan as the sole Executive Director of the Ethereum Foundation.
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
              onClick={handleShareTwitter}
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
