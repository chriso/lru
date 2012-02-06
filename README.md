**A simple LRU cache supporting O(1) set, get and eviction of old keys**

## Installation

```bash
$ npm install lru
```

### Usage

```javascript
var LRU = require('lru').LRU;

var cache = new LRU(10);

cache.set('foo', bar');
cache.get('foo'); //=> bar
```

