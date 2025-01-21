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
  { name: "zkSync", value: Network.ZKSYNC_MAINNET },
  { name: "Linea", value: Network.LINEA_MAINNET },
];

export const getETHBalanceAllNetworks = async (walletAddress: string): Promise<bigint> => {
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
    balances.forEach(({ name, balance }) => {
      totalBalance += balance;
    });
    return totalBalance
  } catch (error) {
    throw error
  }
};
