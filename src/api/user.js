import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import map from 'lodash/map'

import { getAuthenticatedUser } from './auth'
import { User, Group, Contact } from '../models'

import { JWT_SECRET } from '../config'
import { HttpError } from '../lib'
import { uploadFile, getFileUrl, deleteFile } from '../files'

export default {
  async login (_, signinUserInput, ctx) {
    // find user by phone
    const { phone, password } = signinUserInput.user
    const user = await User.findOne({ phone })
    if (user) {
      // validate password
      const res = await bcrypt.compare(password, user.password)
      if (res) {
        // create jwt
        const token = jwt.sign(
          {
            id: user.id,
            phone: user.phone
          },
          JWT_SECRET
        )
        user.jwt = token
        ctx.user = Promise.resolve(user)
        return user
      }

      return HttpError.incorrectPassword()
    }

    return HttpError.notFound()
  },

  async signup (_, signinUserInput, ctx) {
    const { password, phone } = signinUserInput.user
    // find user by phone
    const existing = await User.findOne({ phone })

    if (!existing) {
      // hash password and create user
      const hash = await bcrypt.hash(password, 10)
      const user = await User.create({
        password: hash,
        phone: phone
      })
      const { id } = user
      const token = jwt.sign({ id, phone }, JWT_SECRET)
      user.jwt = token
      ctx.user = Promise.resolve(user)
      return user
    }

    return Promise.reject(new HttpError('Phone already exists', 400))
  },

  async all (_, args) {
    if (args.text) {
      return User.find({ phone: new RegExp(args.text, 'gi') })
    }
    return User.find()
  },

  async currentUser (_, args, ctx) {
    return getAuthenticatedUser(ctx)
  },

  async createGroup (_, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    const contacts = await Contact.find({
      _id: {
        $in: args.group.contactIds
      }
    })
    const newGroup = await Group.create({
      name: args.group.name,
      contacts: contacts
    })
    await user.update({
      $push: {
        groups: newGroup
      }
    })
    return newGroup
  },

  async deleteGroup (_, args, ctx) {
    const user = await getAuthenticatedUser(ctx)
    await user.update({
      $pull: {
        groups: args.id
      }
    })

    return Group.findByIdAndRemove(args.id)
  },

  async importContacts (_, args, ctx) {
    const user = await getAuthenticatedUser(ctx)

    // check if phone exists in db, if yes, attach user ref
    const contactPromises = map(args.contacts, async ct => Contact.create({
      name: ct.name,
      phone: ct.phone
    }))

    const contacts = await Promise.all(contactPromises)

    await user.update({
      contacts
    })

    return contacts
  },

  async groups (user, args, ctx) {
    return Group.find({
      _id: {
        $in: user.groups
      }
    }).populate('contacts')
  },
  async contacts (user, args, ctx) {
    return Contact.find({
      _id: {
        $in: user.contacts
      }
    })
  },
  async avatar_url (user, args, ctx) {
    return (user.avatar && user.avatar.filename) ? getFileUrl(user.avatar.filename) : ''
  },
  async updateUser (_, updateUserInput, ctx) {
    const {
      avatar,
      name,
      dob
    } = updateUserInput.user
    const user = await getAuthenticatedUser(ctx)

    if (name) {
      user.name = name
    }

    if (dob) {
      user.dob = dob
    }

    if (avatar) {
      const data = await uploadFile(avatar.path, avatar.type)

      if (user.avatar && user.avatar.filename) {
        await deleteFile(user.avatar.filename)
      }

      user.avatar = {
        filename: data.name,
        width: data.width,
        height: data.height
      }
    }

    await user.save()
    return user
  },
  async removeUserImage (_, removeUserImageInput, ctx) {
    const { image } = removeUserImageInput.user
    const user = await getAuthenticatedUser(ctx)

    await deleteFile(image)
    await user.update({ avatar: null })
    return user
  }
}
