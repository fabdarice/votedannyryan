import { parseEther } from "viem";

export const getValidatorBalance = async (
  walletAddress: string
): Promise<bigint> => {
  const limit = 200; // Maximum number of validators per API request
  let offset = 0; // Pagination offset
  let totalValidators = 0; // Total count of validators

  const baseUrl = 'https://beaconcha.in/api/v1/validator/withdrawalCredentials';

  try {
    while (true) {
      const url = `${baseUrl}/${walletAddress}?limit=${limit}&offset=${offset}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();

      // Verify the API status
      if (json.status !== 'OK') {
        throw new Error(`API error! status: ${json.status}`);
      }

      const data = json.data;

      // Increment the total validators count
      totalValidators += data.length;

      // If fewer validators are returned than the limit, we've fetched all data
      if (data.length < limit) {
        break;
      }

      // Move to the next page
      offset += limit;
    }

    // Calculate total ETH staked: 32 ETH per validator
    const totalEth = parseEther("32") * BigInt(totalValidators);

    return totalEth;
  } catch (error) {
    console.error('Error fetching validators:', error);
    throw error; // Rethrow the error after logging
  }
};
