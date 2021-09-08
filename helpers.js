const axios = require('axios')
const fs = require('fs')
const path = require('path')
const tmp = path.normalize(path.join(__dirname, '/', 'tmp'))
const {copy} = require('fs-extra')
const AdmZip = require('adm-zip')

exports.checkManifest = async (manifestPath) => {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'))
  return new Promise(async(resolve, reject) => {
    if(manifest.name.toLocaleLowerCase() !== 'all mangas reader') {
      reject('This folder contains an extension which is not AMR!')
    } else {
      resolve()
    }
  })
}

exports.checkVersion = async (dir) => {
  return new Promise(async(resolve, reject) => {
    const last_commitPath = path.join(dir, 'last_commit.txt')
    if(fs.existsSync(last_commitPath)) {
      const remote_commit = (await axios('https://raw.githubusercontent.com/JiPaix/AMR-BUILT/main/dist/last_commit.txt')).data
      const local_commit = fs.readFileSync(last_commitPath, 'utf-8')
      if(remote_commit === local_commit) {
        reject('Already up-to-date')
      } else {
        resolve()
      }
    } else {
      resolve() 
    }
  })
}

exports.clean = (folder, preinstall = true) => {
  return new Promise((resolve, reject) => {
    const tmpFolder = path.join(folder, 'tmp')
    try {
      if(fs.existsSync(path.join(folder, 'tmp'))) {
        fs.rmSync(tmpFolder, {recursive: true, force:true})
      }
      if(preinstall) {
        fs.mkdirSync(tmpFolder)
      }
      resolve()
    } catch(e) {
      reject(e.message)
    }
  })
}

exports.msg = (string, error = false) => {
  return {text: string, error: error}
}

exports.downloadAMR = async (folder) => {
  const url = 'https://github.com/JiPaix/AMR-BUILT/archive/refs/heads/main.zip'
  const writer = fs.createWriteStream(path.join(folder, 'tmp', 'amr.zip'))

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

exports.extractAMR = async(folder) => {
  const unzipFolder = path.join(folder, 'tmp')
  return new Promise((resolve, reject) => {
    const zip = new AdmZip(path.join(unzipFolder, 'amr.zip'))
    zip.extractAllToAsync(unzipFolder, true, (e) => {
      if(e) {
        reject('ZIP: '+e.message)
      } else {
        resolve()
      }
    })
  })
}

exports.moveAMR = async(folder) => {
  const distFolder = path.join(folder, 'tmp', 'AMR-BUILT-main', 'dist')
  return copy(distFolder, folder, {overwrite: true})
}
