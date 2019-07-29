import { BlockHeader } from './header'
import * as ethUtil from 'ethereumjs-util'
import { NetworkOptions } from './types'

/**
 * Creates a new block header object from Ethereum JSON RPC.
 *
 * @param blockParams - Ethereum JSON RPC of block (eth_getBlockByNumber)
 * @param networkOptions - An object describing the network
 */
export default function blockHeaderFromRpc(blockParams: any, networkOptions?: NetworkOptions) {
  const blockHeader = new BlockHeader(
    {
      parentHash: blockParams.parentHash,
      uncleHash: blockParams.sha3Uncles,
      coinbase: blockParams.miner,
      stateRoot: blockParams.stateRoot,
      transactionsTrie: blockParams.transactionsRoot,
      receiptTrie: blockParams.receiptRoot || blockParams.receiptsRoot || ethUtil.KECCAK256_NULL,
      bloom: blockParams.logsBloom,
      difficulty: blockParams.difficulty,
      number: blockParams.number,
      gasLimit: blockParams.gasLimit,
      gasUsed: blockParams.gasUsed,
      timestamp: blockParams.timestamp,
      extraData: blockParams.extraData,
      mixHash: blockParams.mixHash,
      nonce: blockParams.nonce,
    },
    networkOptions,
  )

  // override hash in case something was missing
  blockHeader.hash = function() {
    return ethUtil.toBuffer(blockParams.hash)
  }

  return blockHeader
}
