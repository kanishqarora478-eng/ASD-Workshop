const cache = {};

const TTL = 60 * 1000;

function cacheMiddleware(req, res, next) {
  let key = req.originalUrl;
  let value = cache[key];

  if (value) {
    let currentTime = Date.now();
    let cacheAge = currentTime - value.createdAt;

    if (cacheAge < TTL) {
      res.set("X-Cache", "HIT");
      return res.json(value.data);
    }

    delete cache[key];
  }

  res.set("X-Cache", "MISS");

  next();
}

function setCache(key, data) {
  cache[key] = {
    data: data,
    createdAt: Date.now(),
  };
}

function clearCache() {
  Object.keys(cache).forEach((key) => {
    delete cache[key];
  });
}

module.exports = {
  cacheMiddleware,
  setCache,
  clearCache,
};
