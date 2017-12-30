module.exports = function(req, res, next) {
    if ((req.user || {}).isAdmin) {
        next();
        return;
    }
    res.redirect('/home');
};