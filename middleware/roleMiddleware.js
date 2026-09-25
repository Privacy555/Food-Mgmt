module.exports = function allowedRole(...roles) {
    return function(req, res, next) {
        const user = req.user;

        if (!user || !roles.includes(user.role)) {
            return res.status(403).json({error: "Access denied: insufficient permissions."});
        }
        next();
    }
}