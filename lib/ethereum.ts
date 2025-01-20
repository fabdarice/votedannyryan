import { verifyMessage } from 'viem';

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
    console.error('Signature verification error:', error);
    return false;
  }
}
