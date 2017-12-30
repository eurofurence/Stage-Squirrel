module.exports = function(req, res, next) {
    if ((req.user || {}).isCreator) {
        next();
        return;
    }
    res.redirect('/home');
};