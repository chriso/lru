var events = require('events');
var sys = require('sys');

var LRU = exports.LRU = function (max) {
    events.EventEmitter.call(this);
    this.cache = {}
    this.head = this.tail = null;
    this.length = 0;
    this.max = max || 1000;
};
sys.inherits(LRU, events.EventEmitter);

LRU.prototype.remove = function (key) {
  var element = this.cache[key];
  if(element) {
    delete this.cache[key];
    --this.length;
    if(element.prev) this.cache[element.prev].next = element.next;
    if(element.next) this.cache[element.next].prev = element.prev;
    if(this.head == key) {
      this.head = element.prev;
    }
    if(this.tail == key) {
      this.tail = element.next;
    }
  }
  return element;
}

LRU.prototype.set = function (key, value) {
    element = this.remove(key);
    element = element || { value:value };

    element.next = null;
    element.prev = this.head;

    this.cache[key] = element;

    if (this.head) {
        this.cache[this.head].next = key;
        element.prev = this.head;
    }
    this.head = key;

    if(!this.tail) {
      this.tail = key;
    }

    if (++this.length > this.max) {
        this.evict();
    }
};

LRU.prototype.get = function (key) {
    var element = this.cache[key];
    if (!element) { return; }

    this.set(key, element.value);
    return element.value;
};

LRU.prototype.evict = function () {
    if(!this.tail) { return; }
    var key = this.tail;
    var element = this.remove(this.tail);
    this.emit('evict', {key:key, value:element.value});
};

