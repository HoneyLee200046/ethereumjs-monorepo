import * as events from 'events'
import { FastEthereumService, LightEthereumService } from './service'
import { Config } from './config'

/**
 * Represents the top-level ethereum node, and is responsible for managing the
 * lifecycle of included services.
 * @memberof module:node
 */
export default class Node extends events.EventEmitter {
  public config: Config

  public services: any

  public opened: boolean
  public started: boolean

  /**
   * Create new node
   * @param {Object}   options constructor parameters
   * @param {Config}   [options.config] Client configuration
   * @param {LevelDB}  [options.db=null] blockchain database
   * @param {Object[]} [options.bootnodes] list of bootnodes to use for discovery
   * @param {string[]} [options.clientFilter] list of supported clients
   * @param {number}   [options.refreshInterval] how often to discover new peers
   */
  constructor(options: any) {
    super()

    this.config = options.config

    this.services = [
      this.config.syncmode === 'fast'
        ? new FastEthereumService({
          config: this.config,
          db: options.db,
        })
        : new LightEthereumService({
          config: this.config,
          db: options.db,
        }),
    ]
    this.opened = false
    this.started = false
  }

  /**
   * Open node. Must be called before node is started
   * @return {Promise}
   */
  async open() {
    if (this.opened) {
      return false
    }
    this.config.servers.map((s) => {
      s.on('error', (error: Error) => {
        this.emit('error', error)
      })
      s.on('listening', (details: any) => {
        this.emit('listening', details)
      })
    })
    this.services.map((s: any) => {
      s.on('error', (error: any) => {
        this.emit('error', error)
      })
      s.on('synchronized', () => {
        this.emit('synchronized')
      })
    })
    await Promise.all(this.services.map((s: any) => s.open()))
    this.opened = true
  }

  /**
   * Starts node and all services and network servers.
   * @return {Promise}
   */
  async start() {
    if (this.started) {
      return false
    }
    await Promise.all(this.config.servers.map((s) => s.start()))
    await Promise.all(this.services.map((s: any) => s.start()))
    this.started = true
  }

  /**
   * Stops node and all services and network servers.
   * @return {Promise}
   */
  async stop() {
    if (!this.started) {
      return false
    }
    await Promise.all(this.services.map((s: any) => s.stop()))
    await Promise.all(this.config.servers.map((s) => s.stop()))
    this.started = false
  }

  /**
   * Returns the service with the specified name.
   * @param {string} name name of service
   * @return {Service}
   */
  service(name: string) {
    return this.services.find((s: any) => s.name === name)
  }

  /**
   * Returns the server with the specified name.
   * @param {string} name name of server
   * @return {Server}
   */
  server(name: string) {
    return this.config.servers.find((s) => s.name === name)
  }
}