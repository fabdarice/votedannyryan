import { verifyMessage } from 'viem';
import { createPublicClient, http } from 'viem';
import { formatUnits } from 'viem';
import { mainnet } from 'viem/chains';

export async function verifySignature(
  message: string,
  signature: string,
  wallet: string
): Promise<boolean> {
  try {
    const valid = await verifyMessage({
      message,
      signature: signature as `0x${string}`,
      address: wallet as `0x${string}`,
    });
    return valid;
  } catch (error) {
    return false;
  }
}

// Chainlink ETH/USD Price Feed on Ethereum Mainnet
const priceFeedAddress = '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419';

// Minimal ABI to read the latest price
const priceFeedABI = [
  {
    inputs: [],
    name: 'latestAnswer',
    outputs: [{ internalType: 'int256', name: '', type: 'int256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

// Initialize Viem client
const client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Function to fetch ETH price
export async function getEthPrice() {
  try {
    const data = await client.readContract({
      address: priceFeedAddress,
      abi: priceFeedABI,
      functionName: 'latestAnswer',
    });

    // Chainlink returns price with 8 decimals
    const ethPrice = Number(formatUnits(data as bigint, 8));
    return ethPrice
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    return 3500
  }
}
