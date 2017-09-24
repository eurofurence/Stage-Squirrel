// Middleware for intercepting and correcting the redirection path
module.exports = function() {
    return function(req, res, next) {
        if (typeof res.locals.baseUrlInfo !== 'undefined') {
            var basePath = res.locals.baseUrlInfo.pathname;
            var oldRedirect = res.redirect;

            res.redirect = function() {
                var params = arguments;
                if (params.length && params[0].startsWith('/')) {
                    params[0] = basePath + params[0].substr(1);
                }
                oldRedirect.apply(res, params);
            };
        }
        next();
    };
};