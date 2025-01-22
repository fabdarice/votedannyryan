require('dotenv').config();

async function main() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey) {
    console.error('ADMIN_SECRET_KEY is not set in environment variables.');
    process.exit(1);
  }

  const response = await fetch(`${BASE_URL}/api/admin/votes/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
    },
  });

  if (!response.ok) {
    console.error('Update failed:', response.status, response.statusText);
    const errorBody = await response.json().catch(() => null);
    console.error('Body:', errorBody);
    process.exit(1);
  }

  await response.json();
  console.log("Update for all balances!");
}

main().catch((err) => {
  console.error('Error fetching updates balances:', err);
  process.exit(1);
});
