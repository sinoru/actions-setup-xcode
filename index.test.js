const process = require('process');
const util = require('util');
const execFile = util.promisify(require('child_process').execFile);
const path = require('path');

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', async () => {
  try {
    const ip = path.join(__dirname, 'index.mjs');
    const env = {
      ...process.env,
      'INPUT_XCODE-VERSION': '12.4'
    };

    const { stdout, stderr } = await execFile('node', [ip], {env});
    console.log(stdout);
    console.error(stderr);
  } catch (error) {
    console.error(error);
    throw error;
  }
}, 300000);
