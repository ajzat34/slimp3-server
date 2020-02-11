// creates the Slimp3 Client Protocol header
function createHeader() {
  return Buffer.alloc(18)
}

// Writes the first byte of the header
function writeHeaderType(buf, t) {
  buf.write(t, 0, 1, 'ascii')
}

// creates a discovery response packet
function createDiscovery() {
  var buf = createHeader()
  writeHeaderType(buf, 'D')
  return buf
}

// creates a hello packet
function createHello() {
  var buffer = createHeader()
  writeHeaderType(buffer, 'h')
  return buffer
}

// creates a rune command
function createCode(rune) {
  var buf = Buffer.alloc(2)
  buf.writeUInt8(3, 0)
  buf.writeUInt8(rune.charCodeAt(0), 1)
  return buf
}

// creates a reset command
function createResetCode() {
  var buf = Buffer.alloc(2)
  buf.writeUInt8(2, 0)
  buf.writeUInt8(2, 1)
  return buf
}

// creates a write string packet
function createWrite(text) {
  var buf = createHeader()
  writeHeaderType(buf, 'l')
  var codes = [createResetCode()]
  for (var r in text) {
    codes.push(createCode(text[r]))
  }
  return Buffer.concat([buf].concat(codes))
}

// builds a packet
function build(options) {
  switch (options.type) {
    case 'discovery':
      return createDiscovery()
    case 'hello':
      return createHello()
    case 'write':
      return createWrite(options.text)
  }
}

// reads packet fields
function read(buffer) {
  const type = buffer.slice(0,1).toString()
  const mac = buffer.slice(12,17).toString('hex')
  switch (type) {
    case 'd':
      return {type:type, mac: mac, client: buffer.readUInt8(2), firmware: buffer.readUInt8(3)}
    case 'h':
      return {type:type, mac: mac}
    case 'i':
      return {type:type, mac: mac, time: buffer.readUInt32BE(2), code: buffer.readUInt32BE(8)}
    default:
      return {type:'unknown', mac: mac}
  }
}

exports.build = build
exports.read = read
