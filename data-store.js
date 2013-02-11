const DEFAULT_DB_DIR = "/tmp"
    , DEFAULT_PERSISTENCE_DELAY = 1000
    , DEFAULT_SHOULD_PERSIST = true;

var fs      = require('fs')
  , LOG     = require('clog')
  , _cache  = {};

/**
 * Setup Debug info if DEBUG flag is enabled
 */
if (process.env.NODE_DEBUG !== "true") {
  LOG.debug = new Function();
}

/**
 * Creates a Database
 * @param {String} name    Name of the collection
 * @param {Object} options Database options
 */
function DataStore(name, options) {
  name = name || "db-" + new Date().getTime();

  if (name in _cache) {
    LOG.info("Returning DataStore " + name + " from cache");
    return _cache[name];
  } else {
    options = options || {};
    var _dbDir = options.path || DEFAULT_DB_DIR;
    var _persistenceDelay = options.delay || DEFAULT_PERSISTENCE_DELAY;
    var _shouldPersist = options.persist || DEFAULT_SHOULD_PERSIST;

    var _path = _dbDir + '/' + name + '.json';
    var _store = fs.existsSync(_path) ? require(_path) : {};

    LOG.info("Creating DataStore '" + name + "' on disk at: " + _path);

    /**
     * Persists database on disk
     * @private
     * @param  {Boolean} isRecurring Boolean that tells us whether to persist to disk at regular intervals or not
     * @return {void}
     */
    function _persist(isRecurring) {
      LOG.debug("Saving DataStore " + name + " to disk: " + _path);
      fs.writeFileSync(_path, JSON.stringify(_store));
      
      if (isRecurring) {
        setTimeout(_persist, _persistenceDelay, isRecurring);
      }
    };

    // Persist Database on process exit and at regular intervals
    if (_shouldPersist) {
      process.on("exit", _persist);
      _persist(true);
    }

    return _cache[name] = _store;
  }
}

module.exports = DataStore;