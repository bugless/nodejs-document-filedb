const DEFAULT_DB_DIR = "/tmp"
    , DEFAULT_PERSISTENCE_DELAY = 1000
    , DEFAULT_SHOULD_PERSIST = true;

var fs      = require('fs')
  , sugar   = require('sugar')
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

    var _store;
    if (fs.existsSync(_path)) {
      try { _store = require(_path); } 
      catch (dbReadError) {
        LOG.warn("Database (" + name + ") is corrupt. Re-creating it");
      }
    }

    _store = Object.extended(_store);
    LOG.info("Creating DataStore '" + name + "' on disk at: " + _path);

    /**
     * Persists database on disk
     * @private
     * @param  {Boolean} isRecurring Boolean that tells us whether to persist to disk at regular intervals or not
     * @return {void}
     */
    function _persist(isRecurring) {
      LOG.debug("Saving DataStore " + name + " to disk: " + _path);
      fs.writeFile(_path, JSON.stringify(_store), function(dbWriteError) {
        if (dbWriteError) {
          LOG.error("There was an error writing DB to disk: " + _path);
          return;
        }

        if (_shouldPersist && isRecurring) {
          setTimeout(_persist, _persistenceDelay, isRecurring);
        }
      }); 
    };

    // Persist Database on process exit and at regular intervals
    if (_shouldPersist) {
      _persist(true);
    }

    /**
     * Closes the Database and doesn't persist after invoking
     * @public
     * @return {void}
     */
    _store.close = function() {
      LOG.debug("Closing Database (" + name + ")");
      _shouldPersist = false;
    };

    return _cache[name] = _store;
  }
}

module.exports = DataStore;