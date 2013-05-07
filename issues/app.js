
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , issues = require('./routes/issues')
  , http = require('http')
  , path = require('path');

var db = require('./db');

var app = express();

app.configure(function () {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function () {
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/issues', issues.list);
app.get('/issues/new', issues.newForm);
app.post('/issues', issues.create);
app.get('/issues/:issueId', issues.show);
app.put('/issues/:issueId', issues.modify);
app.get('/issues/:issueId/edit', issues.editForm);

// app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function () {
  console.log("Express server listening on port " + app.get('port'));
});
