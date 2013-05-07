var connect = require("connect"),
  settings = require("settings");

var datapi = require("./datapi");

var server, server;

server = connect();

settings.default({
  server: {
    port: 3000,
    stack: {
      logger: function () { return settings.environment() },
      favicon: null,
      methodOverride: null,
      query: null,
      urlencoded: null,
      json: null
    }
  }
});

var api = module.exports = _({
  init: function () {
    if (settings.environment() === "development") {
      _(settings("server.stack")).each(function (value, middleware) {
        if (typeof value === 'function') value = value();
        this.use(connect[middleware].apply(connect[middleware], value);
      }, this);
      this.use(datapi.connect);
    }
  },

  start: function () {
    var port = settings("server.port");
    this.listen(3000);
  }
}).bindAll(server);
