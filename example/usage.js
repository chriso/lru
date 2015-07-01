var LRU = require('../').LRU

var cache = new LRU(2);

var evicted

cache.on('evict',function(data) { evicted = data })

cache.set('foo', 'bar');
cache.get('foo'); //=> bar

cache.set('foo2', 'bar2');
cache.get('foo2'); //=> bar2

cache.set('foo3', 'bar3');
cache.get('foo3'); //=> bar3,  evicted = { key: 'foo', value: 'bar' }

console.log(evicted)
