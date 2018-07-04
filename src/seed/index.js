import faker from 'faker'
import bcrypt from 'bcrypt'
import fs from 'fs'
import path from 'path'

import times from 'lodash/times'
import sample from 'lodash/sample'
import sampleSize from 'lodash/sampleSize'

import {
  User,
  Activity,
  Invitation
} from '../models'

import {
  deleteAllFiles,
  uploadRemoteFile
} from '../files'

const imageSourceFile = fs.readFileSync(path.join(__dirname, 'ACTIVITY_IMAGES'), { encoding: 'utf8' })
let IMAGES = imageSourceFile.split('\n')
// duplicate
// IMAGES = IMAGES.concat(IMAGES)

const userSourceFile = fs.readFileSync(path.join(__dirname, 'USER_PHONES'), { encoding: 'utf8' })
const USERS = userSourceFile.split('\n')

deleteAllFiles().then(async () => {
  // seed users
  const usersPromises = times(USERS.length, async (n) => {
    const userPhone = USERS[n]
    const password = '1'
    const hash = await bcrypt.hash(password, 10)
    const imageUrl = 'https://picsum.photos/200/200/?random'
    const upload = await uploadRemoteFile(imageUrl, 'jpeg')
    const user = await User.create({
      phone: userPhone,
      password: hash,
      avatar: {
        filename: upload.name,
        width: upload.width,
        height: upload.height
      },
      version: 1
    })
    console.log(`{${user.phone}, ${password}}`)
    return user
  })
  const users = await Promise.all(usersPromises)
  times(IMAGES.length, async (n) => {
    const user = sample(users)
    const otherUsers = users.filter(v => v.id !== user.id)
    const invitedUsers = sampleSize(otherUsers, faker.random.number(otherUsers.length))
    const startDate = faker.date.future(0)
    const upload = await uploadRemoteFile(IMAGES[n], IMAGES[n].split('.').pop())
    const requirePeopleDecision = faker.random.boolean()
    const isPublic = faker.random.boolean()

    const invitationPromises = times(invitedUsers.length, async (n) => {
      return Invitation.create({
        created_at: new Date(),
        have_seen: false,
        user: invitedUsers[n]
      })
    })
    const invitations = await Promise.all(invitationPromises)

    await Activity.create({
      title: faker.lorem.words(3),
      image: {
        filename: upload.name,
        width: upload.width,
        height: upload.height
      },
      description: faker.lorem.sentences(3),
      created_at: new Date(),
      created_by: user,
      color: faker.internet.color(),
      require_people_decision: requirePeopleDecision,
      is_public: isPublic,
      invitations,
      start_date: startDate,
      end_date: faker.random.boolean() ? startDate.setHours(faker.random.number(3), faker.random.number(30)) : null,
      location: faker.address.streetAddress(),
      geolocation: {
        type: 'Point',
        coordinates: [Number(faker.address.longitude()), Number(faker.address.latitude())]
      }
    })
  })
})
