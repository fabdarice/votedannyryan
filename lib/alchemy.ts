import { Alchemy, Network } from "alchemy-sdk";
import { formatEther } from "viem";

const config = {
  apiKey: process.env.ALCHEMY_SECRET_KEY,
};

const networks = [
  { name: "Ethereum Mainnet", value: Network.ETH_MAINNET },
  { name: "Base Mainnet", value: Network.BASE_MAINNET },
  { name: "Optimism", value: Network.OPT_MAINNET },
  { name: "Arbitrum", value: Network.ARB_MAINNET },
  { name: "Polygon", value: Network.MATIC_MAINNET },
  { name: "zkSync", value: Network.ZKSYNC_MAINNET },
  { name: "Linea", value: Network.LINEA_MAINNET },
  { name: "Polygon zkEVM", value: Network.POLYGONZKEVM_MAINNET },
];

export const getETHBalanceAllNetworks = async (walletAddress: string) => {
  const alchemyInstances = networks.map(({ name, value }) => ({
    name,
    alchemy: new Alchemy({
      ...config,
      network: value,
    }),
  }));

  try {
    const balances = await Promise.all(
      alchemyInstances.map(async ({ name, alchemy }) => {
        const balance = await alchemy.core.getBalance(walletAddress);
        const balanceBigInt = BigInt(balance.toString());
        return { name, balance: balanceBigInt };
      })
    );

    // Aggregate and display balances
    let totalBalance = BigInt(0);

    console.log(`\nBalances for address: ${walletAddress}\n`);
    console.log("---------------------------------------------------");

    balances.forEach(({ name, balance }) => {
      console.log(`${name} Balance: ${formatEther(balance)} ETH`);
      totalBalance += balance;
    });

    console.log("---------------------------------------------------");
    console.log(`\nAggregated Total Balance Across All Chains: ${formatEther(totalBalance)} ETH\n`);
    return totalBalance
  } catch (error) {
    console.error("An error occurred while fetching balances:", error);
    throw error
  }
};
