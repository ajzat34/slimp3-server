# SliMP3-Server
slimp3-server provides functions for the SliMP3 Client Protocol. The package was designed to reflect the structure of the standard tcp socket server.

![Picture of slimp3 device](/slimp3.jpg)

This server only supprots the orinigal SliMP3 Client Protocol, meaning it only supports a limited number of devices. It has only been tested with the device pictured above.

# Quick Start
This section will show you how to install, and provide basic usage for slimp3-server

### Install:
```
npm install slimp3-server
```
### Require:
```node
const slimp3 = require('slimp3-server')
````

## Creating a server
```node
// create an instance of the server class
var server = new slimp3.Server()

// setup listening event
server.on('listening', function(){
  console.log(`listening on ${server.address().address}:${server.address().port}`)
})

// setup error event
server.on('error', function(err){
  console.error(err)
})

// event for new clients
// the callback for this event should accept an instance of the Client class
server.on('connection', async function(client){
  console.log('new connection')
  client.send('hi!')
})

// start listening on the server
server.bind() // Server.bind() accepts a port and address to listen on, if none is give it will default to 3483
```

## Reciving IR Remote Data
`client.get_ir()` returns a promise fufilled by the next IR Code

`client.setIrRepeatRate(<rate in ms>)` sets the number of milliseconds that must pass between button presses

eg:
```node
/// ... create a server ...

server.on('connection', async function(client){
  // this sets the number of milliseconds that must pass since the last button was pressed
  client.setIrRepeatRate(250) // (this is defualt value)
  // this function will return a promise that will be fulfilled when the next IR Code is recived
  // in practice you would probably want to wrap this in a try-catch statement
  console.log('Recived IR Code', await client.get_ir())
})
```

# Further Reading
* [SliMP3 Protocol Page](http://wiki.slimdevices.com/index.php/SLIMP3_client_protocol)
* [Wireshark Protocol Page](https://www.wireshark.org/docs/dfref/s/slimp3.html)
* [Slimp3 Instructions](SliMP3-Manual.pdf)

### Data Sheets
![VFD-Codes](vfd-codes.gif)
