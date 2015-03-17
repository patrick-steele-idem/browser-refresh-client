var EventEmitter = require('events').EventEmitter;

function isBrowserRefreshEnabled() {
    return process.env.BROWSER_REFRESH_URL != null;
}

var browserRefreshVersion = process.env.BROWSER_REFRESH_VERSION;

if (browserRefreshVersion) {
    var browserRefreshVersionParts = browserRefreshVersion.split(/[.]/);

    browserRefreshVersion = {
        major: browserRefreshVersionParts[0],
        minor: browserRefreshVersionParts[1],
        patch: browserRefreshVersionParts[2],
    };
}

var nextId = 0;

exports.isBrowserRefreshEnabled = isBrowserRefreshEnabled;

exports.enableSpecialReload = function(patterns, options) {

    if (isBrowserRefreshEnabled()) {
        var events = new EventEmitter();

        var modifiedEvent = 'browser-refresh-client.fileModified' + (nextId++);

        process.send({
            type: 'browser-refresh.specialReload',
            patterns: patterns,
            modifiedEvent: modifiedEvent,
            options: options
        });

        process.on('message', function(m) {
            if (typeof m === 'object' && m.type === modifiedEvent) {
                var path = m.path;
                events.emit('fileModified', path);
            }
        });

        return {
            onFileModified: function(callback) {
                events.on('fileModified', callback);
            }
        };
    } else {
        return {
            onFileModified: function() { /* no-op */ }
        };
    }
};

exports.refreshImages = function() {
    if (isBrowserRefreshEnabled()) {
        process.send({
            type: 'browser-refresh.refreshImages'
        });
    }
};

exports.refreshStyles = function() {
    if (isBrowserRefreshEnabled()) {
        process.send({
            type: 'browser-refresh.refreshStyles'
        });
    }
};

exports.refreshPage = function() {
    if (isBrowserRefreshEnabled()) {
        process.send({
            type: 'browser-refresh.refreshPage'
        });
    }
};