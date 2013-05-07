(function () {
    
if (typeof EventEmitter !== 'function') {
    throw new Error("anchor requires EventEmitter");
}

var anchor = window.anchor = function anchor(anchorName, fn) {
    anchorName = resolveDefaultAnchorName(anchorName);
    
    if (typeof fn === 'function') {
        return createAnchor(anchorName, fn);
    } else if (typeof anchorName === 'string') {
        return routeAnchor(anchorName);
    } else {
        throw new Error("anchor: invalid arguments");
    }
};

function resolveDefaultAnchorName(anchorName) {
    if (anchorName === '#' || anchorName === '') { // alias an empty anchor to the one named 'default'
        return 'default';
    } else if (anchorName[0] === '#') { // if the supplied anchorname begins with '#', strip it
        return anchorName.substr(1);
    } else {
        return anchorName;
    }
}

var anchors = {};

var anchorRequires = function (fn) {
    this.prerequisites.push(fn);
};

function createAnchor(anchorName, fn) {
    var newAnchor = new EventEmitter(anchorName);
    newAnchor.prerequisites = [];
    newAnchor.requires = function (fn) { anchorRequires.call(newAnchor, fn); };
    newAnchor.fn = fn || function () {};
    anchors[anchorName] = newAnchor;
    anchor.emit('newAnchor', newAnchor);
    return newAnchor;
}

function routeAnchor(anchorName) {
    var actionAnchor;
    
    if (anchorName in anchors) {
        actionAnchor = anchors[anchorName];
    } else {
        return null;
    }
    
    if (actionAnchor.prerequisites.length > 0) {
        for (var c in actionAnchor.prerequisites) {
            var status = actionAnchor.prerequisites[c]();
            if (status !== true) {
                actionAnchor.emit("failed prerequisite", status);
                return null;
            }
        }
    }
    
    if (typeof actionAnchor.fn === 'function') {
        anchor.emit('beforeEmit', anchorName);
        actionAnchor.emit('before');
        actionAnchor.fn();
        actionAnchor.emit('after');
        anchor.emit('afterEmit', anchorName);
        return anchorName;
    } else {
        return null;
    }
}

anchor.bindWindowEvents = function () {
    if (window.location.hash) {
        anchor(window.location.hash);
    }

    if ("onhashchange" in window) {
        window.onhashchange = function () {
            anchor(window.location.hash);
        };
    }
};

var anchorEmitter = new EventEmitter('anchor');
anchor.on = function () { return anchorEmitter.on.apply(anchorEmitter, arguments); };
anchor.emit = function () { return anchorEmitter.emit.apply(anchorEmitter, arguments); };

anchor('default', function () { return true; });

})();