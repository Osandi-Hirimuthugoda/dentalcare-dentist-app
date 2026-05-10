import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { httpServer, io } from '../../server.js';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'dentalcare_secret_key_change_in_production';

// Point mongodb-memory-server at the system-installed MongoDB binary
// Windows: local install | Linux/CI: apt-installed mongod
if (process.platform === 'win32') {
  if (!process.env.MONGOMS_SYSTEM_BINARY) {
    process.env.MONGOMS_SYSTEM_BINARY = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';
  }
} else if (!process.env.MONGOMS_SYSTEM_BINARY) {
  // On Linux CI, mongod is installed via apt at /usr/bin/mongod
  process.env.MONGOMS_SYSTEM_BINARY = '/usr/bin/mongod';
}

let mongoServer;

export const connectDB = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
};

export const closeDB = async () => {
  // Close database
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }

  // Close socket.io and http server if they are active
  // This resolves the "open handles" issue in Jest
  if (io) {
    io.close();
  }
  if (httpServer && httpServer.listening) {
    await new Promise(resolve => httpServer.close(resolve));
  }
};

export const clearDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};
