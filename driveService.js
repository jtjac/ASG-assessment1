// src/driveService.js
const { google } = require('googleapis');

class DriveService {
  constructor(auth) {
    this.drive = google.drive({ version: 'v3', auth });
  }

  // List files owned by the authenticated user
  async listOwnedFiles(pageSize = 50) {
    const res = await this.drive.files.list({
      pageSize,
      q: "mimeType!='application/vnd.google-apps.folder' and 'me' in owners",
      fields: 'files(id,name,owners)',
    });
    return res.data.files || [];
  }

  async getFileDetails(fileId) {
    const res = await this.drive.files.get({
      fileId,
      fields: 'id,name,owners,permissions,webViewLink',
    });
    return res.data;
  }

  async searchFiles(name, pageSize = 50) {
    const q = `name contains '${name.replace(/'/g, "\\'")}' and 'me' in owners`;
    const res = await this.drive.files.list({ q, pageSize, fields: 'files(id,name)' });
    return res.data.files || [];
  }

  // Create permission (writer or owner). For owner transfer set role:'owner' and transferOwnership:true
  async createPermission(fileId, email, role = 'writer', sendNotificationEmail = false, transferOwnership = false) {
    const res = await this.drive.permissions.create({
      fileId,
      requestBody: {
        type: 'user',
        role,
        emailAddress: email,
      },
      transferOwnership,
      sendNotificationEmail,
      fields: 'id,role',
    });
    return res.data;
  }
}

module.exports = DriveService;
