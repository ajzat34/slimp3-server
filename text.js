// centers text
function alignCenter(text, size, empty) {
  const paddingLeft = Math.max(Math.floor((size/2)-(text.length/2)), 0)
  var paddingRight = size-(paddingLeft + text.length)
  return pad(text, empty, paddingLeft, paddingRight)
}

// creates right padding
function alignLeft(text, size, empty) {
  return pad(text, empty, 0, (size-text.length))
}

// creates left padding, to right justify text
function alignRight(text, size, empty) {
  return pad(text, empty, (size-text.length), 0)
}

// adds left and right padding to text
function pad(text, empty, paddingLeft, paddingRight) {
  if (typeof empty === 'undefined') { empty = ' ' }
  if (paddingLeft < 0) { paddingLeft = 0 }
  if (paddingRight < 0) { paddingRight = 0 }
  return empty.repeat(paddingLeft) + text + empty.repeat(paddingRight)
}

// splits the bottom row
function truncRow(text_rows, size, ending) {
  const row = text_rows.pop()
  if (row.length > size) {
    const top = row.substring(0, size-(ending.length)) + ending
    const bottom = row.substring(size-(ending.length), row.length)
    text_rows.push(top)
    text_rows.push(bottom)
    return {rows: text_rows, split: true}
  }
  text_rows.push(row)
  return {rows: text_rows, split: false}
}

// wraps text into sized rows, and places ending strings on truncated lines
function rows(text, size, ending) {
  var rows = [text]
  while (true) {
    const v = truncRow(rows, size, ending)
    if (v.split === false) {
      return rows
    }
  }
}

// makes the last row of a rows array the same length
function fixLastRow(rows, size, spacer) {
  rows[rows.length - 1] = alignLeft(rows[rows.length - 1], size, spacer)
  return rows
}

exports.alignCenter = alignCenter
exports.alignLeft = alignLeft
exports.alignRight = alignRight
exports.rows = rows
exports.fixLastRow = fixLastRow
