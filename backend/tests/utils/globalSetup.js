export default async function globalSetup() {
  if (process.platform === 'win32') {
    if (!process.env.MONGOMS_SYSTEM_BINARY) {
      process.env.MONGOMS_SYSTEM_BINARY = 'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe';
    }
  } else if (!process.env.MONGOMS_SYSTEM_BINARY) {
    process.env.MONGOMS_SYSTEM_BINARY = '/usr/bin/mongod';
  }
}
