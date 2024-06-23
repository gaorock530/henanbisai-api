const FSP = require('node:fs/promises');
const fs = require('fs');

async function run() {
  try {
    const status = await FSP.opendir('./dist');
    await FSP.rm('./dist', { force: true, recursive: true });
  } catch (e) {}
  fs.cpSync('./assets', './dist/assets', { recursive: true });
}

run();
