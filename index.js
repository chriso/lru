var events = require('events');
var util = require('util');

var LRU = module.exports = function (opts) {
    if (!(this instanceof LRU)) return new LRU(opts);
    if (typeof opts === 'number') opts = {max: opts};
    if (!opts) opts = {};
    events.EventEmitter.call(this);
    this.cache = {}
    this.head = this.tail = null;
    this.length = 0;
    this.max = opts.max || 1000;
    this.maxAge = opts.maxAge || 0;
};
util.inherits(LRU, events.EventEmitter);

LRU.prototype.remove = function (key) {
    if (!this.cache.hasOwnProperty(key)) return;

    var element = this.cache[key];
    delete this.cache[key];

    --this.length;

    if (this.length === 0) {
        this.head = this.tail = null;
    } else {
        if (this.head == key) {
            this.head = element.prev;
            this.cache[this.head].next = null;
        } else if (this.tail == key) {
            this.tail = element.next;
            this.cache[this.tail].prev = null;
        } else {
            this.cache[element.prev].next = element.next;
            this.cache[element.next].prev = element.prev;
        }
    }

    return element.value;
}

LRU.prototype.peek = function (key) {
  return this.cache.hasOwnProperty(key) ? this.cache[key].value : null
}

LRU.prototype.set = function (key, value) {
    var element;
    if( this.cache.hasOwnProperty(key) ) {
        element = this.cache[key]
        element.value = value
        if (this.maxAge) element.modified = Date.now();

        // If it's already the head, there's nothing more to do:
        if( key === this.head ) {
            return value;
        }
    } else {
        element = { value:value };
        if (this.maxAge) element.modified = Date.now();

        this.cache[key] = element;

        // Eviction is only possible if the key didn't already exist:
        if (this.length === this.max) {
            this.evict();
        }
        ++this.length;
    }

    element.next = null;
    element.prev = this.head;

    if (this.head) {
        this.cache[this.head].next = key;
    }
    this.head = key;

    if(!this.tail) {
      this.tail = key;
    }

    return value
};

LRU.prototype.get = function (key) {
    if (!this.cache.hasOwnProperty(key)) return;
    var element = this.cache[key];

    if (this.maxAge && (Date.now() - element.modified) > this.maxAge) {
        this.remove(key);
        this.emit('evict', {key:key, value:element.value});
        return;
    }

    if( this.head !== key ) {
        if (key === this.tail) {
            this.tail = element.next;
            this.cache[this.tail].prev = null;
        } else {
            // Set prev.next -> element.next:
            this.cache[element.prev].next = element.next;
        }

        // Set element.next.prev -> element.prev:
        this.cache[element.next].prev = element.prev;

        // Element is the new head
        this.cache[this.head].next = key;
        element.prev = this.head;
        element.next = null;
        this.head = key;
    }

    return element.value;
};

LRU.prototype.evict = function () {
    if(!this.tail) { return; }
    var key = this.tail;
    var removedValue = this.remove(this.tail);
    this.emit('evict', {key:key, value:removedValue});
};
