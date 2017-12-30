module.exports = function(req, res, next) {
    var user = (req.user || {});
    if (user.isCreator || user.isManager) {
        next();
        return;
    }
    res.redirect('/home');
};