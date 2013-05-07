var settings = require("settings");

var collections = {};

var datapi = module.exports = function (url) {
  _(url.split("/")).each(function (segment, index) {

  });
};

datapi.connect = function (request, response) {
  var collection = datapi(request.url);
};
