// src/auth.js
const fs = require('fs');
const { google } = require('googleapis');
const path = require('path');
const readline = require('readline');

const SCOPES = ['https://www.googleapis.com/auth/drive'];

class AuthService {
  constructor() {
    this.CRED_PATH = path.join(process.cwd(), 'credentials.json');
    this.TOKEN_PATH = path.join(process.cwd(), 'token.json');
    this.oAuth2Client = null;
  }

  async loadCredentials() {
    if (!fs.existsSync(this.CRED_PATH)) {
      throw new Error('credentials.json not found in project root');
    }
    const content = fs.readFileSync(this.CRED_PATH, 'utf8');
    return JSON.parse(content);
  }

  async initialize() {
    const creds = await this.loadCredentials();
    const { client_secret, client_id, redirect_uris } = creds.installed || creds.web;
    this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Try load token
    if (fs.existsSync(this.TOKEN_PATH)) {
      const token = JSON.parse(fs.readFileSync(this.TOKEN_PATH, 'utf8'));
      this.oAuth2Client.setCredentials(token);
      return this.oAuth2Client;
    }

    // Get new token
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    const code = await this._askQuestion('Enter the code from that page here: ');
    const { tokens } = await this.oAuth2Client.getToken(code.trim());
    this.oAuth2Client.setCredentials(tokens);
    fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('Token stored to', this.TOKEN_PATH);
    return this.oAuth2Client;
  }

  _askQuestion(q) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => rl.question(q, ans => { rl.close(); resolve(ans); }));
  }

  getClient() {
    if (!this.oAuth2Client) throw new Error('Auth client not initialized');
    return this.oAuth2Client;
  }
}

module.exports = AuthService;
