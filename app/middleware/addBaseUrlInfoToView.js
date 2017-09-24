var url = require('url');

// Middleware for adding baseUrl (from config) sepecific data to views
module.exports = function(urlObject) {
    var urlInfo = (urlObject instanceof url.Url ? urlObject : url.parse(''));
    return function(req, res, next) {
        res.locals.baseUrlInfo = urlInfo;
        next();
    };
};