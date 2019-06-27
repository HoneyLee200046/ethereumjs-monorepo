import VM from '../../'

import Account from 'ethereumjs-account'
import * as utils from 'ethereumjs-util'
import { promisify } from 'util'

const Trie = require('merkle-patricia-tree/secure')
const Block = require('ethereumjs-block')
const Blockchain = require('ethereumjs-blockchain')
const BlockHeader = require('ethereumjs-block/header.js')
const levelMem = require('level-mem')
const testData = require('./test-data')
const level = require('level')

const rlp = utils.rlp

async function main() {
  const state = new Trie()
  const blockchainDB = levelMem()

  const hardfork = testData.network.toLowerCase()

  const blockchain = new Blockchain({
    db: blockchainDB,
    hardfork,
    // This flag can be control whether the blocks are validated. This includes:
    //    * Verifying PoW
    //    * Validating each blocks's difficulty, uncles, tries, header and uncles.
    validate: true,
  })

  // When verifying PoW, setting this cache improves the performance of subsequent runs of this
  // script. It has no effect if the blockchain is initialized with `validate: false`.
  setEthashCache(blockchain)

  const vm = new VM({
    state: state,
    blockchain: blockchain,
    hardfork,
  })

  await setupPreConditions(state, testData)

  await setGenesisBlock(blockchain, hardfork)

  await putBlocks(blockchain, hardfork, testData)

  await vm.runBlockchain(blockchain)

  const blockchainHead = await promisify(vm.blockchain.getHead.bind(vm.blockchain))()

  console.log('--- Finished processing the BlockChain ---')
  console.log('New head:', '0x' + blockchainHead.hash().toString('hex'))
  console.log('Expected:', testData.lastblockhash)
}

function setEthashCache(blockchain: any) {
  if (blockchain.validate) {
    blockchain.ethash.cacheDB = level('./.cachedb')
  }
}

async function setupPreConditions(state: any, testData: any) {
  for (const address of Object.keys(testData.pre)) {
    const acctData = testData.pre[address]
    const account = new Account()

    account.nonce = utils.toBuffer(acctData.nonce)
    account.balance = utils.toBuffer(acctData.balance)

    const storageTrie = state.copy()
    storageTrie.root = null

    for (const hexStorageKey of Object.keys(acctData.storage)) {
      const val = utils.toBuffer(acctData.storage[hexStorageKey])
      const storageKey = utils.setLength(utils.toBuffer(hexStorageKey), 32)

      await promisify(storageTrie.put.bind(storageTrie))(storageKey, rlp.encode(val))
    }

    const codeBuf = utils.toBuffer(acctData.code)

    await setCode(account, state, codeBuf)

    account.stateRoot = storageTrie.root

    await promisify(state.put.bind(state))(utils.toBuffer(address), account.serialize())
  }
}

async function setCode(account: Account, state: any, code: Buffer) {
  return new Promise((resolve, reject) => {
    account.setCode(state, code, (err, codeHash) => {
      if (err) {
        reject(err)
        return
      }

      resolve(codeHash)
    })
  })
}

async function setGenesisBlock(blockchain: any, hardfork: string) {
  const genesisBlock = new Block({ hardfork })
  genesisBlock.header = new BlockHeader(testData.genesisBlockHeader, { hardfork })

  await promisify(blockchain.putGenesis.bind(blockchain))(genesisBlock)
}

async function putBlocks(blockchain: any, hardfork: string, testData: any) {
  for (const blockData of testData.blocks) {
    const block = new Block(utils.toBuffer(blockData.rlp), { hardfork })
    await promisify(blockchain.putBlock.bind(blockchain))(block)
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
