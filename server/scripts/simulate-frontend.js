#!/usr/bin/env node
/**
 * Frontend API Call Simulator
 * Simulates what SupportWidget/SupportScreen do from the browser
 */

const http = require('http');

const BASE_URL = 'http://localhost:4000';

async function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

(async () => {
  console.log('🌐 FRONTEND API SIMULATION\n');

  // Simulate SupportWidget session
  const sessionId = 'sim_' + Date.now();
  console.log(`Session ID: ${sessionId}\n`);

  try {
    // 1. Simulate sending a message (like clicking send in SupportWidget)
    console.log('1️⃣ POST /api/support/message (like SupportWidget)');
    const sendRes = await makeRequest('POST', '/api/support/message', {
      sessionId,
      message: 'Message from SupportWidget simulation',
      senderName: 'Frontend Tester',
    });
    console.log(`   Status: ${sendRes.status}`);
    console.log(`   Response: ${JSON.stringify(sendRes.data)}`);

    if (sendRes.status !== 200) {
      console.log('   ❌ But backend responded!');
    } else {
      console.log('   ✓ Success!');
    }

    // 2. Simulate fetching messages (like opening SupportScreen)
    console.log('\n2️⃣ GET /api/support/messages/:sessionId (like SupportScreen)');
    const fetchRes = await makeRequest('GET', `/api/support/messages/${sessionId}`);
    console.log(`   Status: ${fetchRes.status}`);
    console.log(`   Message count: ${fetchRes.data?.messages?.length || 0}`);
    if (fetchRes.data?.messages?.length > 0) {
      console.log(`   Latest: "${fetchRes.data.messages[fetchRes.data.messages.length - 1].message}"`);
    }

    // 3. Test CORS headers
    console.log('\n3️⃣ CORS Header Check');
    const corsRes = await makeRequest('GET', '/health');
    console.log(`   Status: ${corsRes.status}`);
    console.log(`   Response: ${JSON.stringify(corsRes.data)}`);

    console.log('\n✅ API Simulation complete');
  } catch (err) {
    console.log(`\n❌ Connection error: ${err.message}`);
    console.log('\nMake sure the server is running:');
    console.log('  cd a:\\app fon\\server');
    console.log('  npm start');
  }

  process.exit(0);
})();
