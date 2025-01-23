require('dotenv').config();

// Define a sleep function that returns a Promise
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendUpdateRequest(BASE_URL: string, adminKey: string): Promise<void> {
  try {
    const response = await fetch(`${BASE_URL}/api/admin/votes/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-key': adminKey,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      throw new Error(`Update failed: ${response.status} ${response.statusText}. Body: ${JSON.stringify(errorBody)}`);
    }

    const responseData = await response.json();
    console.log(`Update successful: ${JSON.stringify(responseData)}`);
  } catch (error) {
    console.error(`Error during update request: ${(error as Error).message}`);
    // Optionally, rethrow the error if you want to halt execution on failure
    // throw error;
  }
}

async function main() {
  // Retrieve environment variables
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  const adminKey = process.env.ADMIN_SECRET_KEY;

  // Validate the presence of the admin key
  if (!adminKey) {
    console.error('Error: ADMIN_SECRET_KEY is not set in environment variables.');
    process.exit(1);
  }

  // Total number of requests to send
  const TOTAL_REQUESTS = 200;
  // Delay between requests in milliseconds
  const DELAY_MS = 1000;

  console.log(`Starting to send ${TOTAL_REQUESTS} POST requests to ${BASE_URL}/api/admin/votes/update with ${DELAY_MS / 1000} second(s) delay.`);

  for (let i = 1; i <= TOTAL_REQUESTS; i++) {
    console.log(`\n--- Request ${i}/${TOTAL_REQUESTS} ---`);
    await sendUpdateRequest(BASE_URL, adminKey);

    if (i < TOTAL_REQUESTS) {
      await sleep(DELAY_MS);
    } else {
      console.log('\nAll requests have been sent.');
    }
  }
}

// Execute the main function and handle any uncaught errors
main().catch((err) => {
  console.error('Unhandled error in main execution:', err);
  process.exit(1);
});

