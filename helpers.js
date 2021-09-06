const axios = require('axios')
const fs = require('fs')
const path = require('path')
const tmp = path.normalize(path.join(__dirname, '/', 'tmp'))
const mv = require('mv')
const AdmZip = require('adm-zip')


exports.clean = (folder, preinstall = true) => {
  return new Promise((resolve, reject) => {
    const amrFolder = path.join(folder, 'AMR')
    const tmpFolder = path.join(folder, 'tmp')
    try {
      if(preinstall) {
        if(fs.existsSync(amrFolder)) {
          fs.rmSync(amrFolder, {recursive: true, force:true})
        }
      }
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
        return reject('ZIP: '+e.message)
      } else {
        mv(path.join(unzipFolder, 'AMR-BUILT-main', 'dist'), path.normalize(path.join(folder, 'AMR')), {mkdirp: true}, (e) => {
          if(e) {
            reject('MV: '+e)
          } else {
            resolve()
          }
        })
      }
    })
  })
}