import BN = require('bn.js')
import { zeros } from 'ethereumjs-util'
import VM from './index'
import { StorageReader } from './state'
import TxContext from './evm/txContext'
import Message from './evm/message'
import { default as Interpreter, InterpreterResult } from './evm/interpreter'
const Block = require('ethereumjs-block')

export interface RunCallOpts {
  block?: any
  storageReader?: StorageReader
  gasPrice?: Buffer
  origin?: Buffer
  caller?: Buffer
  gasLimit?: Buffer
  to?: Buffer
  value?: Buffer
  data?: Buffer
  code?: Buffer
  depth?: number
  compiled?: boolean
  static?: boolean
  salt?: Buffer
  selfdestruct?: { [k: string]: boolean }
  delegatecall?: boolean
}

export interface RunCallCb {
  (err: Error | null, results: InterpreterResult | null): void
}

/**
 * runs a CALL operation
 * @method vm.runCall
 * @private
 * @param opts
 * @param opts.block {Block}
 * @param opts.caller {Buffer}
 * @param opts.code {Buffer} this is for CALLCODE where the code to load is different than the code from the to account.
 * @param opts.data {Buffer}
 * @param opts.gasLimit {Buffer | BN.js }
 * @param opts.gasPrice {Buffer}
 * @param opts.origin {Buffer} []
 * @param opts.to {Buffer}
 * @param opts.value {Buffer}
 * @param {Function} cb the callback
 */
export default function runCall(this: VM, opts: RunCallOpts, cb: RunCallCb): void {
  const block = opts.block || new Block()
  const storageReader = opts.storageReader || new StorageReader(this.stateManager)

  const txContext = new TxContext(
    opts.gasPrice || Buffer.alloc(0),
    opts.origin || opts.caller || zeros(32),
  )
  const message = new Message({
    caller: opts.caller,
    gasLimit: opts.gasLimit ? new BN(opts.gasLimit) : new BN(0xffffff),
    to: opts.to && opts.to.toString('hex') !== '' ? opts.to : undefined,
    value: opts.value,
    data: opts.data,
    code: opts.code,
    depth: opts.depth || 0,
    isCompiled: opts.compiled || false,
    isStatic: opts.static || false,
    salt: opts.salt || null,
    selfdestruct: opts.selfdestruct || {},
    delegatecall: opts.delegatecall || false,
  })

  const interpreter = new Interpreter(this, txContext, block, storageReader)
  interpreter
    .executeMessage(message)
    .then(results => cb(null, results))
    .catch(err => cb(err, null))
}
