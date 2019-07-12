import axios from 'axios'
import PQueue from 'p-queue'

const client = axios.create({
  baseURL: 'https://api.crossref.org',
})

client.interceptors.request.use(config => {
  config.params = {
    ...config.params,
    mailto: 'eaton.alf@gmail.com',
  }

  return config
})

export const queue = new PQueue({ concurrency: 1 })

export const get = config => queue.add(() => client(config))

export const authors = items =>
  items
    .map(({ family, given }) => [given, family].filter(Boolean).join(' '))
    .filter(Boolean)
    .join(', ')

export const year = ({ 'date-parts': [[year]] }) => year
