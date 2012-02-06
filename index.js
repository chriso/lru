var LRU = exports.LRU = function (max) {
    this.cache = {}
    this.head = this.tail = null;
    this.length = 0;
    this.max = max || 1000;
};

LRU.prototype.set = function (key, value) {
    this.cache[key] = {
        next: null
      , prev: this.head
      , value: value
    };
    if (this.head) {
        this.cache[this.head].next = key;
    }
    this.head = key;
    if (!this.tail) {
        this.tail = key;
    }
    if (++this.length > this.max) {
        this.evict();
    }
};

LRU.prototype.get = function (key) {
    var element = this.cache[key];
    if (!element) {
        return;
    }
    if (element.next) {
        this.cache[element.next].prev = element.prev;
    }
    if (element.prev) {
        this.cache[element.prev].next = element.next;
    } else {
        this.tail = element.next || key;
    }
    element.prev = this.head;
    element.next = null;
    if (this.head) {
        this.cache[this.head].next = key;
    }
    this.head = key;
    return element.value;
};

LRU.prototype.evict = function () {
    var tail = this.cache[this.tail].next;
    delete this.cache[this.tail];
    this.cache[tail].prev = null;
    this.tail = tail;
    this.length--;
};

