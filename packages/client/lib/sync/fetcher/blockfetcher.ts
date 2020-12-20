import { Fetcher, FetcherOptions } from './fetcher'
import { Block, BlockBodyBuffer } from '@ethereumjs/block'
import { BN } from 'ethereumjs-util'
import { Peer } from '../../net/peer'
import { EthProtocolMethods } from '../../net/protocol'
import { Chain } from '../../blockchain'
import { Job } from '../../types'
import { BlockFetcherBase, JobTask, BlockFetcherOptions } from './blockfetcherbase'


/**
 * Implements an eth/62 based block fetcher
 * @memberof module:sync/fetcher
 */
export class BlockFetcher extends BlockFetcherBase<Block>{
  /**
   * Create new block fetcher
   * @param {BlockFetcherOptions}
   */
  constructor(options: BlockFetcherOptions) {
    super(options)
  }

  /**
   * Generate list of tasks to fetch
   * @return {Object[]} tasks
   */
  tasks(): JobTask[] {
    const { first, count } = this
    const max = this.maxPerRequest
    const tasks: JobTask[] = []
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
   * @param job
   */
  async request(job: Job<JobTask, Block>): Promise<Block[]> {
    const { task, peer } = job
    const { first, count } = task
    const headers = await (peer!.eth as EthProtocolMethods).getBlockHeaders({
      block: first,
      max: count,
    })
    const bodies: BlockBodyBuffer[] = <BlockBodyBuffer[]>await peer!.eth!.getBlockBodies(headers.map((h) => h.hash()))
    const blocks: Block[] = bodies.map(([txsData, unclesData]: BlockBodyBuffer, i: number) =>
      Block.fromValuesArray([headers[i].raw(), txsData, unclesData], { common: this.config.common })
    )
    return blocks
  }

  /**
   * Process fetch result
   * @param  job fetch job
   * @param  result fetch result
   * @return {*} results of processing job or undefined if job not finished
   */
  process(job: Job<JobTask, Block>, result: Block[]): Block[] | null {
    if (result && result.length === job.task.count) {
      return result
    }
    return null
  }

  /**
   * Store fetch result. Resolves once store operation is complete.
   * @param {Block[]} blocks fetch result
   * @return {Promise}
   */
  async store(blocks: Block[]) {
    await this.chain.putBlocks(blocks)
  }

  /**
   * Returns a peer that can process the given job
   * @param  job job
   * @return {Peer}
   */
  // TODO: find out what _job is supposed to be doing here...
  peer(): Peer {
    return this.pool.idle((p: any) => p.eth)
  }
}
