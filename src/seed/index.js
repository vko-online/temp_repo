import faker from 'faker'
import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'

import times from 'lodash/times'

import {
  User,
  Activity
} from '../models'

import {
  deleteAllFiles,
  uploadRemoteFile
} from '../files'

// create fake starter data
const USERS_COUNT = 10

const imageSourceFile = fs.readFileSync(path.join(__dirname, 'ACTIVITY_IMAGES'), { encoding: 'utf8' })
const IMAGES = imageSourceFile.split('\n')

deleteAllFiles().then(() => {
  // seed users
  times(USERS_COUNT, async (n) => {
    const password = '1'
    const hash = await bcrypt.hash(password, 10)
    const imageUrl = 'https://picsum.photos/200/200/?random'
    const upload = await uploadRemoteFile(imageUrl, 'jpeg')
    const user = await User.create({
      phone: faker.phone.phoneNumber('+# (###) ###-##-##'),
      password: hash,
      avatar: {
        filename: upload.name,
        width: upload.width,
        height: upload.height
      },
      version: 1
    })
    console.log(`{${user.id}, ${user.phone}, ${password}}`)
    return user
  })

  times(IMAGES.length, async (n) => {
    const upload = await uploadRemoteFile(IMAGES[n], IMAGES[n].split('.').pop())
    await Activity.create({
      title: faker.lorem.words(3),
      image: {
        filename: upload.name,
        width: upload.width,
        height: upload.height
      },
      description: faker.lorem.sentences(3),
      created_at: new Date(),
      start_date: faker.date.future(0)
    })
  })
})
