const fmt = require('./text.js')
const data = require('./data.js')
const display = require('./display.js')
const map = require('./mapping.js')

function wrap (n, nt) {
  n = n%nt
  if (n<0) {
    n = nt-1
  }
  return n
}

class Client {
  constructor (mac, address, port, uds, close_callback) {
    // setup a lot of variables
    var self = this
    this.mac = mac
    this.address = address
    this.port = port
    this.dropConnectionTimer = null
    this.uds = uds // attach the socket
    this.dbuf = new display.Buff (40, 2) // create a display buffer
    this.timeout = 4000
    this.testing_rate = 5000
    this.mapper = new map.Mapper()
    this.ir_speed = 250 // number of milliseconds that must pass before reciving duplicate ir codes
    this.last_ir_recv = Date.now()
    this.close_callback = close_callback // callback on client closing, set internally
    this.lastIr = 0 // last ir time (used to filter ir code data, so old codes will be ignored. this is nessesary because udp does not insure delivery order)
    // can be set explicitly, if the callback returns false, the ir code will be ignored
    // this callback can be used to override certain keys
    this.irCallback = null
    // tests the connection by sending hellos, and waiting for responses
    this.connection_testing = setInterval(function(){
      // send hello
      self.uds.send(data.build({type: 'hello'}), self.port, self.address)
      // await response
      self.dropConnectionTimer = setTimeout(function() {
        clearInterval(self.connection_testing)
        close_callback()
      }, self.testing_rate)
    }, this.testing_rate)
  }

  // hello packets for this client are routed here
  recv_hello (h, info) {
    if (info.address) {
      this.address = info.address
    }
    clearTimeout(this.dropConnectionTimer)
  }

  // this sets the number of milliseconds that must pass since the last button was pressed
  setIrRepeatRate (rate) {
    this.ir_speed = rate
  }

  // ir codes for this client are routed here
  recv_ir (time, code) {
    if (code === 0) {
      return
    }
    if (this.lastIr < time ) {
      this.lastIr = time
    } else {
      console.log('discarded ir code: out of order')
      return
    }

    if (Date.now() - this.last_ir_recv < this.ir_speed) {
      return
    }
    this.last_ir_recv = Date.now()

    // call the ir callback if one has been set
    if (this.irCallback) {
      // if the ir callback returns false then dont fulfill the promise
      if ( this.irCallback(code) === false ){
        return
      }
    }

    // fulfill the ir deferred promise
    if (this.ir_defered) {
      this.ir_defered.resolve(code)
      this.ir_defered = null
    }

  }

  // returns a promise that will be fulfilled when a non-zero ir code is recived
  get_ir() {
    this.ir_defered = new Deferred()
    return this.ir_defered.promise
  }

  // clears the display buffer
  clear () {
    this.dbuf.clear()
  }

  // writes data to the display buffer
  write (x,y,str) {
    this.dbuf.write(x,y,str)
  }

  // updates the screen from the display buffer
  update () {
    this.uds.send(data.build({type: 'write', text: this.dbuf.print()}), this.port, this.address)
  }

  // clear, write, update alias
  send (data) {
    this.clear()
    this.write(0,0,data)
    this.update()
  }

  // closes the connection to the client
  close () {
    clearInterval(this.connection_testing)
    this.close_callback()
  }

  // calls a function of (code, object) in a loop
  // code is an ir code, and object is an arbartrary object that can be used for storing data across calls
  // an object must be returned: {exit: <bool>, return: <anything>}
  async filter (filterCallback) {
    var o = {}
    try {
      while (true) {
        var code = await this.get_ir()
        var result = filterCallback(code, o)
        if (result.exit) {
          return result.return
        }
      }
    } catch (err) {
      throw err
    }
  }

  // returns a promise, fulfilled when any mapped key is pressed
  pauseAny () {
    return this.filter(function(code){
      if (this.mapper.isMapped(code)) {
        return {exit: true}
      }
    })
  }

  // returns a promise, fulfilled when any mapped key in the sepcified group is pressed
  pauseGroup (groupName) {
    return this.filter(function(code){
      if (this.mapper.groupCode(groupName, code)) {
        return {exit: true}
      }
    })
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

exports.Client = Client
