# SliMP3-Server
slimp3-server implements the SliMP3 Client Protocol in NodeJS. Designed to reflect the structure of the standard tcp server.

![Picture of slimp3 device](/slimp3.jpg)

This server only supprots the orinigal SliMP3 Client Protocol, meaning it only supports a limited number of devices. It has only been tested with the device pictured above.

# Quick Start
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

## Mapping Ir Codes
Client.mapper allows you to map ir codes to key strings.

### Default Sony Universal Remote (With JVC Codes)
The remote included with slimp3 is a sony universal remote, slimp3 uses the JVC mode that can be set by pressing:

* `S`
* `DVD`
* `0` `0` `7`
* `ENT`
* `DVD`
* `By default clients will map ir codes for the included remote.`

```node
server.on('connection', async function(client){
  // this function will return a promise that will be fulfilled when the next IR Code is recived
  var code = await client.get_ir()

  // if the code is unknown this will return 'unmapped'
  var key = client.mapper.map(code)

  // test if the key is in a group
  var bool = client.mapper.group('enter', key)
})
Non-Standard Remote
```

Create a mapper:
```node
const mapper = new slimp3.Mapper({
  // key mapping
  <ir_code>: '<key string>',
}, {
  // key groups
  yes: ['<key_string>'],
  no: ['<key_string>'],
  enter: ['<key_string>'],
  // ect...
})
```
Attach a mapper to a client:

```node
server.on('connection', async function(client){
  client.mapper = mapper
})
```
### IR Callback
You can also recive ir codes via callback:

```node
server.on('connection', async function(client){
  client.irCallback = function(code){
    // if the function returns false, the code will be ignored, and will not fufill the ir promise
    // this can be usefull for catching specific ir codes like `power` and `sleep`
    return true
  }
```

# Menu Building

### Pause
```node
server.on('connection', async function(client){
  // pauses on any mapped key
  await client.pauseAny()

  // pauses on a key in a group
  await client.pauseGroup('yes')
})
```

### Read A Digit Key
```node
server.on('connection', async function(client){
  const digit = client.readDigit()
  client.send('you pressed: ', digit)
})
```

### Menu
```node
const menu = ['Item1', 'Item2', 'Item 3', 'Fourth Item']

server.on('connection', async function(client){
  const index = await client.menu(menu, 'Choose an item')
  const item = menu[index]
  client.send('you chose: ' + item)
})
```

# Further Reading
* [SliMP3 Protocol Page](http://wiki.slimdevices.com/index.php/SLIMP3_client_protocol)
* [Wireshark Protocol Page](https://www.wireshark.org/docs/dfref/s/slimp3.html)
* [Slimp3 Instructions](SliMP3-Manual.pdf)

### Data Sheets
![VFD-Codes](vfd-codes.gif)
