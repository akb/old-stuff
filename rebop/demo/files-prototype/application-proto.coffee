fs = require "fs"
path = require "path"
util = require "util"

_ = require "underscore"
rebop = require "rebop"

# this is just a prototype, no tests

createFileResource = (pathname, identifier) ->
	self = rebop.resource.create identifier or path.basename(pathname)

	# bind handler for get event
	self.get (request, response, complete) ->
		response.writeHead 200
			'Content-Type': mimeTypes[ path.extname(pathname) ]
			'Content-Length': fs.statSync(pathname).size
			'Last-Modified': new Date(fs.statSync(pathname).mtime).toString()
			'Server': 'rebop+nodejs/0.1'

		fileStream = fs.createReadStream pathname
		fileStream.pipe response
	
	self


createDirectoryResource = (pathname, identifier) ->
	self = rebop.resource.collection.create identifier or path.basename(pathname)
	
	fs.readdir pathname, (err, files) ->
		throw err if err

		_(files).each (filename) ->
			fullpath = fs.realpathSync pathname + filename

			fs.stat fullpath, (err, stats) ->
				throw err if err

				if stats.isDirectory()
					self.addChild createDirectoryResource(fullpath)
				else if stats.isFile()
					self.addChild createFileResource(fullpath)
				else
					# ignore: device or socket

	self.get (request, response, complete) ->
		fs.readdir pathname, (err, files) ->
		message = "this is a directory, i have no default view yet"
		response.writeHead 200
			'Content-Type': 'text/plain'
			'Content-Length': message.length.toString()
		response.write message
		complete()
	
	self


mimeTypes =
	'.htm':  'text/html'
	'.html': 'text/html'
	'.js':   'text/javascript'
	'.css':  'text/css'
	'.xml':  'text/xml'
	'.csv':  'text/csv'
	'.txt':  'text/plain'
	'.json': 'application/json'
	'.gif':  'image/gif'
	'.jpg':  'image/jpeg'
	'.jpeg': 'image/jpeg'
	'.png':  'image/png'
	'.svg':  'image/svg+xml'
	'.ico':  'image/vnd.microsoft.icon'
	'.tif':  'image/tiff'
	'.tiff': 'image/tiff'
	'.mpg':  'video/mpeg'
	'.mpeg': 'video/mpeg'
	'.mp3':  'audio/mpeg'
	'.jqt':  'text/x-jquery-tmpl'
	'.ttf':  'application/x-font-ttf'
	'.swf':  'application/x-shockwave-flash'
	'.gz':   'application/x-gzip'


module.exports.load = load = (dir) ->
	root = createDirectoryResource dir, "root"

	server = rebop.server
		root: root

	server.listen 3000

	console.log "server started on port 3000"


load './approot/'
