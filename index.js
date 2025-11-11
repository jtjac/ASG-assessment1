// src/index.js
const AuthService = require('./auth');
const DriveService = require('./driveService');
const TransferService = require('./transferService');
const CLI = require('./cli');

(async function main() {
  try {
    const auth = new AuthService();
    const authClient = await auth.initialize();
    const driveService = new DriveService(authClient);
    const transferService = new TransferService(driveService);
    const cli = new CLI(driveService, transferService);
    await cli.start();
  } catch (err) {
    console.error('Startup error:', err.message || err);
    process.exit(1);
  }
})();
