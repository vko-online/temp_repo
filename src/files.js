import fs from 'fs'
import path from 'path'
import uuidv4 from 'uuid/v4'
import mime from 'mime-types'
import request from 'request'
import im from 'imagemagick'

export const deleteFile = Key => {
  return new Promise((resolve, reject) => {
    fs.unlink(path.join(__dirname, '../uploads', Key), (err) => {
      if (err) reject(err)
      resolve(Key)
    })
  })
}

export const deleteAllFiles = () => {
  return new Promise((resolve, reject) => {
    const directory = path.join(__dirname, '../uploads')
    fs.readdir(directory, (err, files) => {
      if (err) reject(err)

      for (const file of files) {
        fs.unlink(path.join(directory, file), err => {
          if (err) reject(err)
        })
      }
      resolve()
    })
  })
}

export const uploadRemoteFile = (url, type) =>
  new Promise((resolve, reject) => {
    const name = `${uuidv4()}.${type}`
    const filePath = path.join(__dirname, '../uploads', name)
    request(url)
      .pipe(
        fs.createWriteStream(filePath)
          .on('error', (err) => reject(err))
          .on('finish', () => {
            const result = {
              name,
              type,
              path: filePath
            }
            im.identify(['-format', '%wx%h', filePath], (err, output) => {
              if (err) reject(err)
              const parts = output.split('x')
              result.width = Number(parts[0])
              result.height = Number(parts[1])
              resolve(result)
            })
          })
      )
  })

export const uploadFile = (fileUrl, type) =>
  new Promise((resolve, reject) => {
    const name = `${uuidv4()}.${mime.extension(type)}`
    const filePath = path.join(__dirname, '../uploads', name)
    const readFileStream = fs.createReadStream(fileUrl)
    const writeFileStream = fs.createWriteStream(filePath)

    readFileStream.on('error', err => {
      reject(err)
    })
    writeFileStream.on('error', err => {
      reject(err)
    })

    readFileStream.pipe(writeFileStream)

    writeFileStream.on('finish', () => {
      const result = {
        name,
        type,
        path: filePath
      }
      im.identify(['-format', '%wx%h', filePath], (err, output) => {
        if (err) reject(err)
        const parts = output.split('x')
        result.width = Number(parts[0])
        result.height = Number(parts[1])
        resolve(result)
      })
    })
  })

export const getFileUrl = key =>
  `http://localhost:8080/uploads/${key}`
