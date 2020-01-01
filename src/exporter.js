import axios from 'axios'
import PQueue from 'p-queue'

const client = axios.create({
  baseURL: 'https://api.ncbi.nlm.nih.gov/lit/ctxp/v1/',
})

export const queue = new PQueue({ concurrency: 1 })

export const get = config => queue.add(() => client(config))
