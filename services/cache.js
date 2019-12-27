const mongoose = require("mongoose");
const redis = require("redis");
const util = require("util");
const keys = require("../config/keys");
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function(options = {}) {
  this._cache = true;
  this._cacheKey = JSON.stringify(options.key || "");
  return this;
};

mongoose.Query.prototype.exec = async function() {
  if (!this._cache) {
    return exec.apply(this, arguments);
  }

  console.log("IM ABOUT TO RUN A QUERY");

  const key = JSON.stringify({
    ...this.getQuery(),
    collection: this.mongooseCollection.name
  });

  const cachedValue = await client.hget(this._cacheKey, key);

  if (cachedValue) {
    console.log("SERVING FROM CACHE");

    const doc = JSON.parse(cachedValue);
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  console.log("READING FROM MONGODB");

  const result = await exec.apply(this, arguments);

  client.hset(this._cacheKey, key, JSON.stringify(result));

  return result;
};

module.exports = {
  clearCache(cacheKey) {
    client.del(JSON.stringify(cacheKey));
  }
};
