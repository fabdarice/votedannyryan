require('dotenv').config();

async function mainSeed() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

  const adminKey = process.env.ADMIN_SECRET_KEY;
  if (!adminKey) {
    console.error('ADMIN_SECRET_KEY is not set in environment variables.');
    process.exit(1);
  }

  const response = await fetch(`${BASE_URL}/api/admin/proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': adminKey,
    },
    body: JSON.stringify({
      description: 'Danny Ryan as the sole Executive Director of the Ethereum Foundation',
      options: ['Yes', 'No'],
    }),
  });

  if (!response.ok) {
    console.error('Seeding failed:', response.status, response.statusText);
    const errorBody = await response.json().catch(() => null);
    console.error('Body:', errorBody);
    process.exit(1);
  }

  const proposal = await response.json();
  console.log('Seed successful! Created proposal:', proposal);
}

mainSeed().catch((err) => {
  console.error('Error seeding data:', err);
  process.exit(1);
});
