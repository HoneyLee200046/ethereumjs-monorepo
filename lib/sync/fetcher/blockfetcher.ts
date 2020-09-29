
const Fetcher = require('./fetcher')
const Block = require('ethereumjs-block')
const BN = require('bn.js')

const defaultOptions = {
  maxPerRequest: 128
}

/**
 * Implements an eth/62 based block fetcher
 * @memberof module:sync/fetcher
 */
export = module.exports = class BlockFetcher extends Fetcher {
  /**
   * Create new block fetcher
   * @param {Object}       options constructor parameters
   * @param {PeerPool}     options.pool peer pool
   * @param {Chain}        options.chain blockchain
   * @param {BN}           options.first block number to start fetching from
   * @param {BN}           options.count how many blocks to fetch
   * @param {number}       [options.timeout] fetch task timeout
   * @param {number}       [options.banTime] how long to ban misbehaving peers
   * @param {number}       [options.interval] retry interval
   * @param {number}       [options.maxPerRequest=128] max items per request
   * @param {Logger}       [options.logger] Logger instance
   */
  constructor (options: any) {
    super(options)
    options = { ...defaultOptions, ...options }
    this.maxPerRequest = options.maxPerRequest
    this.chain = options.chain
    this.first = options.first
    this.count = BN.isBN(options.count) ? options.count : new BN(options.count)
  }

  /**
   * Generate list of tasks to fetch
   * @return {Object[]} tasks
   */
  tasks () {
    let { first, count } = this
    const max = this.maxPerRequest
    const tasks = []
    while (count.gten(max)) {
      tasks.push({ first: first.clone(), count: max })
      first.iaddn(max)
      count.isubn(max)
    }
    if (count.gtn(0)) {
      tasks.push({ first: first.clone(), count: count.toNumber() })
    }
    return tasks
  }

  /**
   * Requests blocks associated with this job
   * @param  job
   */
  async request (job: any): Promise<any> {
    const { task, peer } = job
    let { first, count } = task
    const headers = await peer.eth.getBlockHeaders({ block: first, max: count })
    const bodies = await peer.eth.getBlockBodies(headers.map((h: any) => h.hash()))
    const blocks = bodies.map((body: any, i: number) => new Block([headers[i]].concat(body), { common: this.common }))
    return { blocks }
  }

  /**
   * Process fetch result
   * @param  job fetch job
   * @param  result fetch result
   * @return {*} results of processing job or undefined if job not finished
   */
  process (job: any, result: any) {
    if (result.blocks && result.blocks.length === job.task.count) {
      return result.blocks
    }
  }

  /**
   * Store fetch result. Resolves once store operation is complete.
   * @param {Block[]} blocks fetch result
   * @return {Promise}
   */
  async store (blocks: Array<any>) {
    await this.chain.putBlocks(blocks)
  }

  /**
   * Returns a peer that can process the given job
   * @param  job job
   * @return {Peer}
   */
  peer (job: any) {
    return this.pool.idle((p: any) => p.eth)
  }
}
