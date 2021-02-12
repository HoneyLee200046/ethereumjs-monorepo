import Common from '@ethereumjs/common'

// Blockchain
export * from '../lib/blockchain/chain'

// Peer
export * from '../lib/net/peer/peer'
export * from '../lib/net/peer/libp2ppeer'
export * from './libp2pnode'

// Peer Pool
export * from '../lib/net/peerpool'

// Protocol
export * from '../lib/net/protocol/protocol'
export * from '../lib/net/protocol/ethprotocol'
export * from '../lib/net/protocol/lesprotocol'
export * from '../lib/net/protocol/flowcontrol'

// Server
export * from '../lib/net/server/server'
export * from '../lib/net/server/libp2pserver'
import { Libp2pServer } from '../lib/net/server/libp2pserver'

// EthereumClient
export * from '../lib/client'
import EthereumClient from '../lib/client'

// Service
export * from '../lib/service/service'
export * from '../lib/service/fullethereumservice'
export * from '../lib/service/lightethereumservice'

// Synchronizer
export * from '../lib/sync/sync'
export * from '../lib/sync/fullsync'
export * from '../lib/sync/lightsync'

// Utilities
export * from '../lib/util'
import { Config } from '../lib/config'

// Logging
export * from './logging'
import { getLogger } from './logging'

export function createClient(args: any) {
  const logger = getLogger({ loglevel: args.loglevel ?? 'info' })
  const config = new Config({
    common: new Common({ chain: args.network ?? 'mainnet' }),
    servers: [new Libp2pServer({ multiaddrs: [], config: new Config({ logger }), ...args })],
    syncmode: args.syncmode ?? 'full',
    logger,
  })
  return new EthereumClient({ config })
}

export async function run(args: any) {
  const client = createClient(args)
  const { logger, common } = client.config
  logger.info('Initializing Ethereumjs client...')
  logger.info(`Connecting to network: ${common.chainName()}`)
  client.on('error', (err: any) => logger.error(err))
  client.on('listening', (details: any) => {
    logger.info(`Listener up transport=${details.transport} url=${details.url}`)
  })
  client.on('synchronized', () => {
    logger.info('Synchronized')
  })
  await client.open()
  logger.info('Synchronizing blockchain...')
  await client.start()
  return client
}
