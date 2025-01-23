import { verifyMessage } from 'viem';
import { createPublicClient, encodeAbiParameters, keccak256, http } from 'viem';
import { stringToBytes, concat } from 'viem/utils';
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

const gnosisSafeAbi = [
  {
    constant: true,
    inputs: [
      { name: 'hash', type: 'bytes32' },
      { name: 'signature', type: 'bytes' },
    ],
    name: 'isValidSignature',
    outputs: [{ name: 'magicValue', type: 'bytes4' }],
    type: 'function',
  },
];

const MAGIC_VALUE = '0x1626ba7e'; // EIP-1271 magic value for valid signatures

export async function verifySafeSignature(
  message: string,
  signature: string,
  wallet: `0x${string}`
): Promise<boolean> {
  try {
    // Create a viem client
    const client = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    const prefix = `\x19Ethereum Signed Message:\n${message.length}`;
    const payloadBytes = concat([stringToBytes(prefix), stringToBytes(message)]);

    // 3. Compute keccak256 hash of the prefixed message
    const dataHash = keccak256(payloadBytes);

    // Call the isValidSignature method on the Gnosis Safe
    const magicValue = await client.readContract({
      address: wallet,
      abi: gnosisSafeAbi,
      functionName: 'isValidSignature',
      args: [dataHash, signature],
    });

    // Return true if the magic value matches the expected value
    return magicValue === MAGIC_VALUE;
  } catch (error) {
    console.error('Error verifying signature:', error);
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
