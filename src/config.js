import dotenv from 'dotenv'

dotenv.config({ silent: true })

export const {
  JWT_SECRET,
  MONGODB_URL,
  SEED
} = process.env

const defaults = {
  JWT_SECRET: 'your_secret',
  MONGODB_URL: 'your_mongo_url',
  SEED: false
}

Object.keys(defaults).forEach(key => {
  if (!process.env[key] || process.env[key] === defaults[key]) {
    throw new Error(
      `Please enter a custom ${key} in .env on the root directory`
    )
  }
})
