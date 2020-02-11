const dgram = require('dgram')
const fmt = require('./text.js')
const data = require('./data.js')
const display = require('./display.js')
const events = require('events')
const Client = require('./client.js').Client
const Mapper = require('./mapping.js').Mapper

class Server {

  // slimp3 server class

  constructor () {
    var self = this
    this.emitter = new events.EventEmitter()

    // create object to store active client
    this.clients = {}

    // create dgram UDP4 socket
    this.uds = dgram.createSocket('udp4')
    // error callback
    this.uds.on('error', function(err) {
      this.emitter.emit('error', err)
    })
    // listening callback
    this.uds.on('listening', () => {
      this.emitter.emit('listening')
    })

    // setup the callback for reciving data
    // establish connections and route messages to clients
    this.uds.on('message', function(message, info){
      // parse the message
      const p = data.read(message)
      if (self.clients[p.mac]) {
        // if the client is known, route the data
        if (p.type === 'h') {
          self.clients[p.mac].recv_hello(p, info)
        } else if (p.type === 'i') {
          // route ir packets
          self.clients[p.mac].recv_ir(p.time, p.code)
        } // other packets are ignored
      } else if (p.type === 'd') {
        // if the message is a discovery broadcast, send the servers discovery response
        self.uds.send(data.build({type:'discovery'}), self.port, info.address)
      } else if (p.mac !== '0000000000') {
        // add the client
        self.add_client(p.mac, info.address)
      }
    })
  }

  on(event, fn) {
    this.emitter.on(event, fn)
  }

  once(event, fn) {
    this.emitter.once(event, fn)
  }

  // adding client
  add_client(mac, address){
    var self = this
    if (!this.ready) {
      throw new Error('server not ready (have you run Server.bind()?)')
    }
    self.clients[mac] = new Client(mac, address, self.port, self.uds, function() {
      console.log(`removing client: ${mac}`)
      delete self.clients[mac]
    })
    this.emitter.emit('connection', self.clients[mac])
  }

  // returns the address and port that the dgram socket is bound to
  address () {
    return this.uds.address()
  }

  // passthru to dgram server bind, of port is not specified the default 3483 is used
  bind(port, address) {
    if (typeof port === 'undefined') {
      port = 3483
    }
    this.port = port
    this.uds.bind(port, address)
    this.ready = true
  }

}

// class for deferred promises
class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject)=> {
      this.reject = reject
      this.resolve = resolve
    })
  }
}

// exports
exports.hexString = function (num) { return num.toString(16) }
exports.Server = Server
exports.Client = Client
exports.Deferred = Deferred
exports.Mapper = Mapper
exports.fmt = fmt
