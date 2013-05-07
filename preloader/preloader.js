/**
 * global object "App"
 * EventEmitter
 * Namespace for framework
 * Properties:
 *     debug
 * Methods:
 *     preload
 *     postload
 *     route
 * Events:
 *     preload complete
 *     postload complete
 *     before route
 */
var App = window.App = new EventEmitter();

/**
 * "App" property "debug"
 * boolean
 * if true, debug log messages will be written to console
 */
App.debug = true;
App.preloadComplete = false;
App.documentReady = false;

function log(message) {
    if (App.debug === true) {
        console.log(message);
    }
}


/**
 * "App" property "preloader"
 * EventEmitter
 * Responsible for pre-DOM-load portion of app lifecycle
 *     property "handlers"
 *         Array
 *         array of handler functions to be executed during preload
 *     property "finishedHandlers"
 *         number
 *         count of number of preload handlers that have finished running
 */
App.preloader = new EventEmitter();
App.preloader.handlers = [];
App.preloader.finishedHandlers = 0;

/**
 * "preloader" property "preload(desc:string, fn:function)"
 * method
 * binds fn to execute during preload
 *
 * fn is passed a single argument, "callback", which is
 * a function that must be called when any/all asynchronous
 * code finishes executing within fn
 */
App.preloader.preload = function (desc, fn) {
    var handler = {
        id: this.handlers.length,
        description: desc,
        fn: fn
    };
    this.handlers.push(handler);
    this.emit("created", handler);
};


App.postloader = new EventEmitter();
App.postloader.handlers = [];
App.postloader.postload = function (desc, fn) {
    var handler = { 
        id: this.handlers.length, 
        description: desc, 
        fn: fn 
    };
    this.handlers.push(handler);
    this.emit("created", handler);
};


/**
 * "App" property "preload"
 * shortcut for App.preloader.preload
 */
App.preload = function (desc, fn) {
    App.preloader.preload.call(App.preloader, desc, fn);
};
/**
 * "App" property "postload"
 * shortcut for App.postloader.postload
 */
App.postload = function (desc, fn) {
    App.postloader.postload.call(App.postloader, desc, fn);
};



// this is called internally when preloaders should run
function doPreload() {
    function complete(handler) {
        this.emit("complete", handler);
        this.finishedHandlers++;
        if (this.finishedHandlers === this.handlers.length) {
            App.emit("preload complete", handler);
        }
    };
    for (var h in App.preloader.handlers) {
        var handler = handlers[h];
        handler.fn(function () { complete.call(App.preloader, handler); });
    }
}

// called internally when postloaders should run
function doPostload() {
    if (App.preloadComplete and App.documentReady) {
        for (var h in App.postloader.handlers) {
            var handler = App.postloader.handlers[h];
            handler.fn();
            App.postloader.emit("complete", handler);
        }
        App.emit("postload complete");
    }
}

doPreload();

App.preloader.on("complete", function () {
    App.preloadComplete = true;
    doPostload();
});

$(document).ready(function () {
    App.documentReady = true;
    doPostload();
});
