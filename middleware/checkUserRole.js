const checkUserRole = (req, res, next) => {
    // Check if user is logged in and user object is attached to request
    if (req.user) {
        // Check if the user's position is 'user'
        if (req.user.userRole === 'user') {
            // If user's position is 'user', redirect to dashboard home
            return res.redirect('/dashhome');
        }
    }
    // If user is an admin or not logged in, proceed to next middleware
    next();
};

module.exports = checkUserRole;
