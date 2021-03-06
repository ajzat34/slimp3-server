const JVCIR = require('./JVCIR.js').export
const GROUPS = require('./GROUPS.js').export

// maps ir codes to key strings
class Mapper{

  constructor (mapping, group) {
    // object that maps codes to strings
    if (mapping) {
      this.mapping = mapping
    } else {
      // defaults
      this.mapping = JVCIR
    }

    // lists meanings of keys
    if (group) {
      this.groups = group
    } else {
      this.groups = GROUPS
    }

  }

  map (code) {
    const k = this.mapping[code]
    if (k) {
      return k
    } else {
      return 'unmapped'
    }
  }

  isMapped (code) {
    if (this.mapping[code]) {
      return true
    } else {
      return false
    }
  }

  group (name, key) {
    if (this.groups[name]) {
      return this.groups[name].includes(key)
    } else {
      throw new Error(`Mapper does not contain group '${name}'`)
    }
  }

  groupCode (name, code) {
    return this.group(name, this.map(code))
  }

}

exports.Mapper = Mapper
