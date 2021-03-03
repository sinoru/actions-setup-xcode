const process = require('process');
const cp = require('child_process');
const path = require('path');

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  const env = {
    ...process.env,
    'INPUT_XCODE-VERSION': '12.4'
  };
  const ip = path.join(__dirname, 'index.js');
  console.log(cp.execFileSync('node', [ip], {env}).toString());
});
