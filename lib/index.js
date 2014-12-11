var EventEmitter = require('events').EventEmitter;

function isBrowserRefreshEnabled() {
    return process.env.BROWSER_REFRESH_URL != null;
}

var nextId = 0;

exports.isBrowserRefreshEnabled = isBrowserRefreshEnabled;

exports.enableSpecialReload = function(patterns) {

    if (isBrowserRefreshEnabled()) {
        var events = new EventEmitter();

        var modifiedEvent = 'browser-refresh-client.fileModified' + (nextId++);

        process.send({
            type: 'browser-refresh.specialReload',
            patterns: patterns,
            modifiedEvent: modifiedEvent
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