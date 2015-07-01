# lru

**A simple LRU cache supporting O(1) set, get and eviction of old keys**

## Installation

```bash
$ npm install lru
```

### Example

```javascript
var LRU = require('lru').LRU;

var cache = new LRU(2),
    evicted

cache.on('evict',function(data) { evicted = data });

cache.set('foo', 'bar');
cache.get('foo'); //=> bar

cache.set('foo2', 'bar2');
cache.get('foo2'); //=> bar2

cache.set('foo3', 'bar3');
cache.get('foo3'); //=> bar3,  evicted = { key: 'foo', value: 'bar' }
```

### API

#### `require('lru').LRU( length )`
Create a new LRU cache that stores `length` elements before evicting the least recently used.

**Returns**: the newly created LRU cache


#### Methods

##### `.set( key, value )`
Set the value of the key and mark the key as most recently used.

**Returns**: `value`

##### `.set( key, value )`
Set the value of the key and mark the key as most recently used.

##### `.get( key )`
Query the value of the key and mark the key as most recently used.

**Returns**: value of key if found; `undefined` otherwise.

##### `.on( event, callback )`
Respond to events. Currently only the `evict` event is implemented. When a key is evicted, the callback is executed with an associative array containing the evicted key: `{key: key, value: value}`.


### Credits

A big thanks to [Dusty Leary](https://github.com/dustyleary) who
finished the library.

### License

MIT
