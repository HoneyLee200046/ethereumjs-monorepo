'use strict'

const EventEmitter = require('events')

const Pipe = function (id: any) {
  const buffer: any[] = []
  let closed = false

  return {
    source: (end: any, cb: any) => {
      if (closed) end = true
      if (end) return cb(end)
      const next = function () {
        if (closed) return
        if (buffer.length) {
          setTimeout(() => {
            const data = buffer.shift()
            cb(null, data)
          }, 1)
        } else {
          setTimeout(next, 1)
        }
      }
      next()
    },
    sink: (read: any) => {
      read(null, function next (end: any, data: any) {
        if (end === true || closed === true) return
        if (end) throw end
        buffer.push(data)
        read(null, next)
      })
    },
    close: () => {
      closed = true
    }
  }
} as any

const Connection = function (protocols: any) {
  const outgoing = new Pipe('OUT')
  const incoming = new Pipe('IN')

  return {
    local: (remoteId: any) => ({
      source: incoming.source,
      sink: outgoing.sink,
      remoteId,
      protocols
    }),
    remote: (location: any) => ({
      source: outgoing.source,
      sink: incoming.sink,
      location,
      protocols
    }),
    close: () => {
      incoming.close()
      outgoing.close()
    }
  }
} as any

export const servers: any = {}

export function createServer (location: any) {
  if (servers[location]) {
    throw new Error(`Already running a server at ${location}`)
  }
  servers[location] = {
    server: new EventEmitter(),
    connections: {}
  }
  setTimeout(() => servers[location].server.emit('listening'), 10)
  return servers[location].server
}

export function destroyServer (location: any) {
  if (servers[location]) {
    for (const id of Object.keys(servers[location].connections)) {
      destroyConnection(id, location)
    }
  }
  delete servers[location]
}

export function createConnection (id: any, location: any, protocols: any) {
  if (!servers[location]) {
    throw new Error(`There is no server at ${location}`)
  }
  const connection = new Connection(protocols)
  servers[location].connections[id] = connection
  setTimeout(() => servers[location].server.emit('connection', connection.local(id)), 10)
  return connection.remote(location)
}

export function destroyConnection (id: any, location: any) {
  if (servers[location]) {
    const conn = servers[location].connections[id]
    if (conn) {
      conn.close()
      delete servers[location].connections[id]
    }
  }
}