const text = require('./text.js')

class Buff {
  // this class buffers a slimp3 screen of any size
  // the it stores the display data in a single buffer, and offers methods for randomly writing to it
  // Buff.visual() will return a string with the display data, and Buff.nice() will return a boxed representation

  constructor(row_size, row_count) {
    this.size = row_size
    this.count = row_count
    this.buff = null
    this.make_clear()
  }

  // recreates the buffer, and fills it with spaces
  make_clear() {
    this.buff = Buffer.allocUnsafe(this.size*this.count)
    this.buff.fill(' ')
  }

  // fills the buffer with spaces
  clear() {
    this.buff.fill(' ')
  }

  // returns the index of a Letter on the display
  indexLixel(x,y){
    if (x>=this.size) { throw new Error(`x: ${x} out of range (max: ${this.size-1})`)}
    if (y>=this.count) { throw new Error(`y: ${y} out of range (max: ${this.count-1})`)}
    return (this.size*y)+x
  }

  // write a string to the buffer
  write(x, y, str) {
    this.buff.write(str, this.indexLixel(x,y), str.length, 'ascii')
  }

  // returns the buffer with ascii encoding
  print() {
    return this.buff.toString('ascii')
  }

  // reads the buffer into a string, with newlines
  visual() {
    var result = []
    for (var offset = 0; (offset+this.size) <= this.buff.length; offset += this.size) {
      result.push(this.buff.slice(offset, offset+this.size).toString())
    }
    return result
  }

  // reads the buffer into a string, with a nice box
  nice() {
    return '┏' +  text.alignCenter('[Slimp3]', this.size, '━') + '┓\n┃' + this.visual().join('┃\n┃') + '┃\n┗' + '━'.repeat(this.size) + '┛'
  }

  // gets the offset needed for centering text (given the length of the text)
  centerOffset(text_length) {
    return Math.max(Math.floor((this.size/2) - (text_length/2)), 0)
  }

  // gets the offset needed for aligning text to the right (given the length of the text)
  rightOffset(text_length){
    return this.size - text_length
  }
}

exports.Buff = Buff
