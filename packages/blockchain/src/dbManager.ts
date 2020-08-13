import * as rlp from 'rlp'
import { Block, BlockHeader } from '@ethereumjs/block'
import Common from '@ethereumjs/common'
import Cache from './cache'
import {
  headsKey,
  headHeaderKey,
  headBlockKey,
  hashToNumberKey,
  numberToHashKey,
  tdKey,
  bodyKey,
  headerKey,
} from './util'

import BN = require('bn.js')
import type { LevelUp } from 'levelup'

const level = require('level-mem')

/**
 * @hidden
 */
export interface DBOp {
  type: String
  key: Buffer | String
  keyEncoding: String
  valueEncoding?: String
  value?: Buffer | object
}

/**
 * @hidden
 */
export interface GetOpts {
  keyEncoding?: string
  valueEncoding?: string
  cache?: string
}

/**
 * Abstraction over a DB to facilitate storing/fetching blockchain-related
 * data, such as blocks and headers, indices, and the head block.
 * @hidden
 */
export class DBManager {
  _cache: { [k: string]: Cache<Buffer> }
  _common: Common
  _db: LevelUp

  constructor(db: LevelUp, common: Common) {
    this._db = db
    this._common = common
    this._cache = {
      td: new Cache({ max: 1024 }),
      header: new Cache({ max: 512 }),
      body: new Cache({ max: 256 }),
      numberToHash: new Cache({ max: 2048 }),
      hashToNumber: new Cache({ max: 2048 }),
    }
  }

  /**
   * Fetches iterator heads from the db.
   */
  async getHeads(): Promise<{ [key: string]: Buffer }> {
    const heads = await this.get(headsKey, { valueEncoding: 'json' })
    Object.keys(heads).forEach((key) => {
      heads[key] = Buffer.from(heads[key])
    })
    return heads
  }

  /**
   * Fetches header of the head block.
   */
  async getHeadHeader(): Promise<Buffer> {
    return this.get(headHeaderKey)
  }

  /**
   * Fetches head block.
   */
  async getHeadBlock(): Promise<Buffer> {
    return this.get(headBlockKey)
  }

  /**
   * Fetches a block (header and body), given a block tag
   * which can be either its hash or its number.
   */
  async getBlock(blockTag: Buffer | BN | number): Promise<Block> {
    // determine BlockTag type
    if (typeof blockTag === 'number' && Number.isInteger(blockTag)) {
      blockTag = new BN(blockTag)
    }

    let number
    let hash
    if (Buffer.isBuffer(blockTag)) {
      hash = blockTag
      number = await this.hashToNumber(blockTag)
    } else if (BN.isBN(blockTag)) {
      number = blockTag
      hash = await this.numberToHash(blockTag)
    } else {
      throw new Error('Unknown blockTag type')
    }

    const header = (await this.getHeader(hash, number)).raw
    let body: any
    try {
      body = await this.getBody(hash, number)
    } catch (error) {
      if (error.type !== 'NotFoundError') {
        throw error
      }
      body = [[], []]
    }

    const blockData = [header].concat(body) as [Buffer[], Buffer[], Buffer[]]
    return new Block(blockData, { common: this._common })
  }

  /**
   * Fetches body of a block given its hash and number.
   */
  async getBody(hash: Buffer, number: BN): Promise<Buffer> {
    const key = bodyKey(number, hash)
    return rlp.decode(await this.get(key, { cache: 'body' }))
  }

  /**
   * Fetches header of a block given its hash and number.
   */

  async getHeader(hash: Buffer, number: BN) {
    const key = headerKey(number, hash)
    const encodedHeader = await this.get(key, { cache: 'header' })
    return new BlockHeader(rlp.decode(encodedHeader), {
      common: this._common,
    })
  }

  /**
   * Fetches total difficulty for a block given its hash and number.
   */
  async getTd(hash: Buffer, number: BN): Promise<BN> {
    const key = tdKey(number, hash)
    const td = await this.get(key, { cache: 'td' })
    return new BN(rlp.decode(td))
  }

  /**
   * Performs a block hash to block number lookup.
   */
  async hashToNumber(hash: Buffer): Promise<BN> {
    const key = hashToNumberKey(hash)
    return new BN(await this.get(key, { cache: 'hashToNumber' }))
  }

  /**
   * Performs a block number to block hash lookup.
   */
  async numberToHash(number: BN): Promise<Buffer> {
    if (number.ltn(0)) {
      throw new level.errors.NotFoundError()
    }

    const key = numberToHashKey(number)
    return this.get(key, { cache: 'numberToHash' })
  }

  /**
   * Fetches a key from the db. If `opts.cache` is specified
   * it first tries to load from cache, and on cache miss will
   * try to put the fetched item on cache afterwards.
   */
  async get(key: string | Buffer, opts: GetOpts = {}): Promise<any> {
    const dbOpts = {
      keyEncoding: opts.keyEncoding || 'binary',
      valueEncoding: opts.valueEncoding || 'binary',
    }

    if (opts.cache) {
      if (!this._cache[opts.cache]) {
        throw new Error(`Invalid cache: ${opts.cache}`)
      }

      let value = this._cache[opts.cache].get(key)
      if (!value) {
        value = <Buffer>await this._db.get(key, dbOpts)
        this._cache[opts.cache].set(key, value)
      }

      return value
    }

    return this._db.get(key, dbOpts)
  }

  /**
   * Performs a batch operation on db.
   */
  batch(ops: DBOp[]) {
    return this._db.batch(ops as any)
  }
}
