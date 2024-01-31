const FSP = require('node:fs/promises')
const fs = require('fs')

const Path = require('path');


async function copyDir(src,dest) {
    const entries = await FSP.readdir(src, {withFileTypes: true});
    await FSP.mkdir(dest);
    for(let entry of entries) {
        const srcPath = Path.join(src, entry.name);
        const destPath = Path.join(dest, entry.name);
        if(entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await FSP.copyFile(srcPath, destPath);
        }
    }
}

async function run () {
  try{
    const status = await FSP.opendir('./dist')
    console.log({status})
    await FSP.rm('./dist', {force: true, recursive: true})
  } catch(e) {

  }
  // await FSP.mkdir('./dist/ssl', {recursive: true})
  fs.cpSync('./ssl', './dist/ssl', {recursive: true})
}



run()