var rebop = require("rebop");
    resource = rebop.resource;

/*
 * Low-level API demo
 * This app demonstrates the basic API for interacting with the rebop resource 
 * tree. This was primarily written to suppliment the automated tests with an
 * example that will actually run in a browser.
 *
 * The API at this level is clumsy and certainly not advantageous to use as a
 * real-world app in most cases. However, with the addition of a database and
 * templating engine, it would be certainly possible to create a complete app 
 * with this API alone.
 */

var root = resource.collection.create('root');

root.get(function (request, response, complete) {
    var body = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<title>rebop low-level api demo</title>',
        '<link rel="stylesheet" type="text/css" href="/style">',
        '</head>',
        '<body>',
        '    <div id="container">',
        '        <h1>rebop: next-generation web framework for node.js</h1>',
        '        <div id="info">This is the sample index page for the root resource.</div>',
        '        <a href="/otherpage">Another page, for the sake of demonstration</a>',
        '    </div>',
        '</body>',
        '</html>'
    ].join("\n");

    response.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'text/html',
        'Content-Language': 'en'
    });
    response.write(body);
    complete();
});

var otherpage = resource.create('otherpage');
otherpage.get(function (request, response, complete) {
    var body = [
        '<!DOCTYPE html>',
        '<html lang="en">',
        '<head>',
        '<title>rebop low-level api demo</title>',
        '<link rel="stylesheet" type="text/css" href="/style">',
        '</head>',
        '<body>',
        '    <div id="container">',
        '        <h1>rebop: next-generation web framework for node.js</h1>',
        '        <div id="info">',
        '            And here it is! TWO pages served from the same server!',
        '            Actually, that\'s a lie, there is also a stylesheet and a redirect.',
        '        </div>',
        '        <a href="/">Back to Home</a>',
        '    </div>',
        '</body>',
        '</html>'
    ].join("\n");

    response.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'text/html',
        'Content-Language': 'en'
    });
    response.write(body);
    complete();
});
root.addChild(otherpage);

var style = resource.create('style');
style.get(function (request, response, complete) {
    var body = [
        'div#container { ',
        '    width: 600px;',
        '    height: 300px;',
        '    background: rgb(127, 127, 192);',
        '    border: 1px dotted black;',
        '    -moz-border-radius:5px; -webkit-border-radius:5px;',
        '    -moz-box-shadow: 10px 10px 5px #888; -webkit-box-shadow: 10px 10px 5px #888;',
        '    padding: 20px',
        '}',
        'h1 {',
        '    font-size:20px;',
        '    border-bottom: 1px solid black;',
        '}',
        'div#info {',
        '    font-family:Arial;',
        '}'
    ].join("\n");

    response.writeHead(200, {
        'Content-Length': body.length,
        'Content-Type': 'text/css'
    });
    response.write(body);
    complete();
});
root.addChild(style);

var index = resource.create('index');
index.get(function (request, response, complete) {
    response.writeHead(301, {
        'Location': '/'
    });
    complete();
});
root.addChild(index);

rebop.server({ root: root }).listen(3000);
console.log("Server started on port 3000");