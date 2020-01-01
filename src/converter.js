import axios from 'axios'
import PQueue from 'p-queue'

const client = axios.create({
  baseURL: 'https://www.ncbi.nlm.nih.gov/pmc/utils/idconv/v1.0/',
})

client.interceptors.request.use(config => {
  config.params = {
    ...config.params,
    tool: 'CitationFinder',
    email: 'eaton.alf@gmail.com',
    format: 'json',
  }

  return config
})

export const queue = new PQueue({ concurrency: 1 })

export const get = config => queue.add(() => client(config))
