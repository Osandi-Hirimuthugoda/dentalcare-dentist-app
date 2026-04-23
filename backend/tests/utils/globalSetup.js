/**
 * Jest Global Setup
 * Runs once before all test suites.
 * Uses the locally installed MongoDB binary (no download needed).
 */

// Point mongodb-memory-server at the locally installed MongoDB
process.env.MONGOMS_SYSTEM_BINARY = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';

import { MongoMemoryServer } from 'mongodb-memory-server';

export default async function globalSetup() {
  console.log('\n🔍 Verifying local MongoDB binary for tests...');
  
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log(`✅ In-memory MongoDB started at: ${uri}`);
  await mongoServer.stop();
  
  console.log('✅ MongoDB binary ready. Starting tests...\n');
}
