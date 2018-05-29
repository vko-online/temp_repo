import faker from 'faker'
import bcrypt from 'bcrypt'

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

const IMAGES = ['https://i.pinimg.com/236x/d8/3a/9b/d83a9b6faf2e58ff895342242bd62214.jpg', 'https://i.pinimg.com/236x/61/35/93/613593ea3d5537c7f85f7365f0d72f45.jpg', 'https://i.pinimg.com/236x/52/7c/66/527c66879c1bbbeaf53938e467ee8927.jpg', 'https://i.pinimg.com/236x/16/8e/1e/168e1e2ba9e74baf37e1c64df576b79c.jpg', 'https://i.pinimg.com/236x/22/0f/01/220f016c154044a51abca097f7ecc4ea.jpg', 'https://i.pinimg.com/236x/14/3a/8c/143a8c283ecaecbf90058ac0f914a1ed.jpg', 'https://i.pinimg.com/236x/3d/65/6f/3d656f63189290a84d906b92d0d1565d.jpg', 'https://i.pinimg.com/236x/7a/2c/f2/7a2cf28357e37a95dfac3d273ef9cb0a.jpg', 'https://i.pinimg.com/236x/57/f2/c5/57f2c55991b7173ffa9056c413cae260.jpg', 'https://i.pinimg.com/236x/e0/d3/85/e0d385c22794dc2140639ffc73257047.jpg', 'https://i.pinimg.com/236x/b2/bf/d8/b2bfd8cb9ecb96982de45d96ef5f5801.jpg', 'https://i.pinimg.com/236x/c3/73/2a/c3732abb95e790432a0208097c4e662e.jpg', 'https://i.pinimg.com/236x/24/1b/5e/241b5eb929d7353e7a85c37cffad4027.jpg', 'https://i.pinimg.com/236x/8b/73/b9/8b73b932a9d73ae7e17f3ccc8fc4029c.jpg', 'https://i.pinimg.com/236x/88/a8/4d/88a84d09003aae699bde89d888428642.jpg', 'https://i.pinimg.com/236x/3c/ca/4f/3cca4f233f253b4ca72010f5200cb372.jpg', 'https://i.pinimg.com/236x/35/50/b5/3550b5659e25022e8af69fb8f6417e13.jpg', 'https://i.pinimg.com/236x/ba/2d/f9/ba2df9aa774329560f3ee48fc947a299.jpg', 'https://i.pinimg.com/236x/f0/45/4d/f0454d0a5047ba3c73a50cc8c9d80bba.jpg', 'https://i.pinimg.com/236x/d8/64/ca/d864cad4ec4d9cfb1a08202a887bb175.jpg', 'https://i.pinimg.com/236x/2d/f4/91/2df491590161974dc461767bd405de8e.jpg', 'https://i.pinimg.com/236x/c6/6d/02/c66d0236627dbb979f8b1c1b5cc3e8fb.jpg', 'https://i.pinimg.com/236x/bd/3c/35/bd3c35762f8174decf01096f980c10e0.jpg', 'https://i.pinimg.com/236x/90/0a/49/900a49c038c9759f79ddccbf6a82c499.jpg', 'https://i.pinimg.com/236x/13/24/2f/13242f1e28dfe2e590859107d31758a1.jpg', 'https://i.pinimg.com/236x/cc/da/2a/ccda2a351bb00a0267bb98e6bc8067eb.jpg', 'https://i.pinimg.com/236x/a7/1e/97/a71e9712083d908d31d55ada64598125.jpg', 'https://i.pinimg.com/236x/2d/cf/1e/2dcf1eca1f7329f45b4ecc572841b0f7.jpg', 'https://i.pinimg.com/236x/d5/32/b3/d532b398c2c824bace748d5c876e0d1f.jpg', 'https://i.pinimg.com/236x/4f/a3/44/4fa3442fd9a7e2da25ddaddb968b6d0a.jpg']

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
    const upload = await uploadRemoteFile(IMAGES[n], 'jpg')
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