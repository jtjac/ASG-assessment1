// src/cli.js
const inquirer = require('inquirer');

class CLI {
  constructor(driveService, transferService) {
    this.drive = driveService;
    this.transfer = transferService;
  }

  async start() {
    let exit = false;
    while (!exit) {
      const { choice } = await inquirer.prompt([{ type:'list', name:'choice', message:'Main Menu', choices:[
        {name:'List my files', value:'list'},
        {name:'Search files', value:'search'},
        {name:'Transfer single file', value:'single'},
        {name:'Transfer multiple files', value:'multi'},
        {name:'Get file details', value:'details'},
        {name:'Exit', value:'exit'}
      ] }]);
      try {
        switch(choice) {
          case 'list':
            const files = await this.drive.listOwnedFiles(50);
            console.table(files.map(f=>({id:f.id, name:f.name})));
            break;
          case 'search':
            const {term} = await inquirer.prompt([{name:'term', message:'Search term:'}]);
            const found = await this.drive.searchFiles(term, 50);
            console.table(found.map(f=>({id:f.id, name:f.name})));
            break;
          case 'single':
            var p = await inquirer.prompt([{name:'fileId', message:'File ID:'},{name:'email', message:'New owner email:'},{type:'confirm', name:'notify', message:'Send notification email?', default:false}]);
            const res = await this.transfer.transferSingleFile(p.fileId, p.email, {notify: p.notify});
            console.log(res);
            break;
          case 'multi':
            var p = await inquirer.prompt([{name:'fileIds', message:'File IDs (comma separated):'},{name:'email', message:'New owner email:'},{name:'delay', message:'Delay between transfers (ms)', default:'500'}]);
            const ids = p.fileIds.split(',').map(s=>s.trim()).filter(Boolean);
            const summary = await this.transfer.transferMultipleFiles(ids, p.email, Number(p.delay), {notify:false});
            console.log(summary);
            break;
          case 'details':
            const {fid} = await inquirer.prompt([{name:'fid', message:'File ID:'}]);
            const details = await this.drive.getFileDetails(fid);
            console.log(details);
            break;
          case 'exit':
            exit = true; break;
        }
      } catch (err) {
        console.error('Error:', err.message || err);
      }
    }
  }
}

module.exports = CLI;
