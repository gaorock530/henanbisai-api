const FSP = require('node:fs/promises')
const fs = require('fs')
const Path = require('path');


async function run () {
  try{
    const status = await FSP.opendir('./dist')
    await FSP.rm('./dist', {force: true, recursive: true})
  } catch(e) {
    
  }
  fs.cpSync('./assets', './dist/assets', {recursive: true})
}



run()