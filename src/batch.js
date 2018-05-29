import DataLoader from 'dataloader'
import { User, Activity, Message } from './models'

const batchGet = (model, keys) =>
  model.findAll({ where: { id: keys } }).then(elements => {
    const map = new Map(elements.map(element => [element.id, element]))
    return keys.map(key => map.get(key))
  })

export const userLoader = () => new DataLoader(keys => batchGet(User, keys))
export const activityLoader = () => new DataLoader(keys => batchGet(Activity, keys))
export const messageLoader = () => new DataLoader(keys => batchGet(Message, keys))
