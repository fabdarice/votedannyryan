import { Alchemy, Network } from "alchemy-sdk";
import { getValidatorBalance } from "./beaconchain";

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

// Define the ERC20 tokens to include with their contract addresses per network
const tokensPerNetwork: {
  [key: string]: {
    stETH?: string;      // Lido ETH
    wstETH?: string;      // wrapped Lido ETH
    rETH?: string;       // Rocket Pool ETH
    WETH?: string;       // Wrapped ETH
    aEthWETH?: string;       // Aave Wrapped ETH
    aEthwstETH?: string;
    aEthweETH?: string;
  };
} = {
  [Network.ETH_MAINNET]: {
    stETH: "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // Lido stETH
    rETH: "0xae78736Cd615f374D3085123A210448E74Fc6393",  // Rocket Pool rETH
    WETH: "0xC02aaA39b223FE8D0A0E5C4F27eAD9083C756Cc2",  // WETH
    aEthWETH: "0x4d5F47FA6A74757f35C14fD3a6Ef8E3C9BC514E8", // Aave WETH
    aEthwstETH: "0x0B925eD163218f6662a35e0f0371Ac234f9E9371", // Aave Lido stETH
    aEthweETH: "0xBdfa7b7893081B35Fb54027489e2Bc7A38275129" // Aave EtherFI ETH
  },
  [Network.BASE_MAINNET]: {
    wstETH: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452", // lido wstETH
    WETH: "0x4200000000000000000000000000000000000006"
  }, // Add tokens for Base
  [Network.ARB_MAINNET]: {
    wstETH: "0x5979D7b546E38E414F7E9822514be443A4800529", // lido wstETH
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1"
  }, // Add tokens for Arbitrum 
  [Network.OPT_MAINNET]: {
    wstETH: "0x1F32b1c2345538c0c6f582fCB022739c4A194Ebb", // lido wstETH
    WETH: "0x4200000000000000000000000000000000000006"
  }, // Add tokens for OP 

};

export const getETHBalanceAllNetworks = async (walletAddress: string): Promise<bigint> => {
  const alchemyInstances = networks.map(({ name, value }) => ({
    name,
    alchemy: new Alchemy({
      ...config,
      network: value,
    }),
    networkValue: value,
  }));

  try {
    const balances = await Promise.all(
      alchemyInstances.map(async ({ name, alchemy, networkValue }) => {
        // Fetch native ETH balance
        const nativeBalance = await alchemy.core.getBalance(walletAddress);
        const nativeBalanceBigInt = BigInt(nativeBalance.toString());

        // Fetch ERC20 token balances
        const tokenAddresses = Object.values(tokensPerNetwork[networkValue] || {}).filter(addr => addr !== "0x...");
        let tokenBalancesBigInt: bigint = BigInt(0);

        if (tokenAddresses.length > 0) {
          const tokenBalancesResponse = await alchemy.core.getTokenBalances(
            walletAddress,
            tokenAddresses
          );

          // Iterate through each token balance and sum them
          tokenBalancesResponse.tokenBalances.forEach(token => {
            if (token && token.tokenBalance && token.tokenBalance !== "0x0000000000000000000000000000000000000000000000000000000000000000") {
              tokenBalancesBigInt += BigInt(token.tokenBalance);
            }
          });
        }

        // Total ETH-equivalent balance for this network
        const totalNetworkBalance = nativeBalanceBigInt + tokenBalancesBigInt;

        return { name, balance: totalNetworkBalance };
      })
    );

    // Aggregate and display balances
    let totalBalance = BigInt(0);
    balances.forEach(({ name, balance }) => {
      totalBalance += balance;
    });

    const validatorBalance = await getValidatorBalance(walletAddress);

    return (totalBalance + validatorBalance);
  } catch (error) {
    console.error("getETHBalanceAllNetworks error", error);
    throw error
  }
};

