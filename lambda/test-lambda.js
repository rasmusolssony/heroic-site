const { handler } = require('./index');

async function testLambda() {
  // Simulate API Gateway event
  const event = {
    httpMethod: 'POST',
    body: JSON.stringify({
      rsn: 'Sn0ut',
      discordName: 'POILK',
      country: 'sweden',
      timeZone: 'cet',
      alts: 'alt1 and alt2',
      reason: 'I wanted to join an amazing clan',
      clanHistory: 'None',
      referral: 'SnaffarN',
    }),
  };

  try {
    const response = await handler(event);
    console.log('Response:', JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testLambda();
