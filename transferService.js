// src/transferService.js
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

class TransferService {
  constructor(driveService) {
    this.drive = driveService;
  }

  async transferSingleFile(fileId, newOwnerEmail, options = { notify: false }) {
    try {
      // Attempt direct ownership transfer (Google supports transferOwnership param)
      const res = await this.drive.createPermission(fileId, newOwnerEmail, 'owner', options.notify, true);
      return { success: true, fileId, newOwner: newOwnerEmail, permissionId: res.id };
    } catch (err) {
      return { success: false, fileId, error: err.message || String(err) };
    }
  }

  async transferMultipleFiles(fileIds, newOwnerEmail, delayMs = 500, options = { notify: false }) {
    const results = [];
    for (const fileId of fileIds) {
      const result = await this.transferSingleFile(fileId, newOwnerEmail, options);
      results.push(result);
      await sleep(delayMs);
    }
    const summary = {
      total: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    };
    return summary;
  }
}

module.exports = TransferService;
