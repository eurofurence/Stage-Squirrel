module.exports = function(req, res, next) {
    if ((req.user || {}).isManager) {
        next();
        return;
    }
    res.redirect('/home');
};