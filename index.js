const EventEmitter = require('events')

class LRU extends EventEmitter {
  constructor (opts) {
    super()
    if (typeof opts === 'number') opts = { max: opts }
    if (!opts) opts = {}
    this.cache = {}
    this.head = this.tail = null
    this.length = 0
    this.max = opts.max || 1000
    this.maxAge = opts.maxAge || 0
  }

  get keys () {
    return Object.keys(this.cache)
  }

  clear () {
    this.cache = {}
    this.head = this.tail = null
    this.length = 0
  }

  remove (key) {
    if (typeof key !== 'string') key += ''
    if (!this.cache.hasOwnProperty(key)) return

    const element = this.cache[key]
    delete this.cache[key]
    this._unlink(key, element.prev, element.next)
    return element.value
  }

  _unlink (key, prev, next) {
    this.length--

    if (this.length === 0) {
      this.head = this.tail = null
    } else {
      if (this.head === key) {
        this.head = prev
        this.cache[this.head].next = null
      } else if (this.tail === key) {
        this.tail = next
        this.cache[this.tail].prev = null
      } else {
        this.cache[prev].next = next
        this.cache[next].prev = prev
      }
    }
  }

  peek (key) {
    if (!this.cache.hasOwnProperty(key)) return

    const element = this.cache[key]

    if (!this._checkAge(key, element)) return
    return element.value
  }

  set (key, value) {
    if (typeof key !== 'string') key += ''

    let element

    if (this.cache.hasOwnProperty(key)) {
      element = this.cache[key]
      element.value = value
      if (this.maxAge) element.modified = Date.now()

      // If it's already the head, there's nothing more to do:
      if (key === this.head) return value
      this._unlink(key, element.prev, element.next)
    } else {
      element = { value, modified: 0, next: null, prev: null }
      if (this.maxAge) element.modified = Date.now()
      this.cache[key] = element

      // Eviction is only possible if the key didn't already exist:
      if (this.length === this.max) this.evict()
    }

    this.length++
    element.next = null
    element.prev = this.head

    if (this.head) this.cache[this.head].next = key
    this.head = key

    if (!this.tail) this.tail = key
    return value
  }

  _checkAge (key, element) {
    if (this.maxAge && (Date.now() - element.modified) > this.maxAge) {
      this.remove(key)
      this.emit('evict', { key, value: element.value })
      return false
    }
    return true
  }

  get (key) {
    if (typeof key !== 'string') key += ''
    if (!this.cache.hasOwnProperty(key)) return

    const element = this.cache[key]

    if (!this._checkAge(key, element)) return

    if (this.head !== key) {
      if (key === this.tail) {
        this.tail = element.next
        this.cache[this.tail].prev = null
      } else {
        // Set prev.next -> element.next:
        this.cache[element.prev].next = element.next
      }

      // Set element.next.prev -> element.prev:
      this.cache[element.next].prev = element.prev

      // Element is the new head
      this.cache[this.head].next = key
      element.prev = this.head
      element.next = null
      this.head = key
    }

    return element.value
  }

  evict () {
    if (!this.tail) return
    const key = this.tail
    const value = this.remove(this.tail)
    this.emit('evict', { key, value })
  }
}

module.exports = LRU
