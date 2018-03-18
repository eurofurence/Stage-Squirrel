var util = require('util');

// For message categories
var levels = {
    ERROR: 'error',
    INFO: 'info',
    WARNING: 'warning',
};

// For rendering info
var classes = {
    ERROR: 'danger',
    INFO: 'info',
    WARNING: 'warning',
};
var headers = {
    ERROR: 'Oops! Something went terrribly wrong.',
    INFO: null,
    WARNING: 'Attention, please!',
};

// Middleware for adding flash messages to the Response.locals
module.exports = function() {
    return function(req, res, next) {
        res.locals.messages = [];
        for (var key in levels) {
            var messages = req.flash(levels[key]);
            if (!messages.length) {
                continue;
            }

            var cssClass = classes[key];
            var header = headers[key];

            for (var message of messages) {
                var content = util.inspect(message, false, null).trim();
                if (!content.length) {
                    continue;
                }
                res.locals.messages.push({
                    class: cssClass,
                    header: header,
                    body: content,
                });
            }
        }

        req.flashError = (function(message) { req.flash(levels.ERROR, message); });
        req.flashInfo = (function(message) { req.flash(levels.INFO, message); });
        req.flashWarning = (function(message) { req.flash(levels.WARNING, message); });

        next();
    };
};