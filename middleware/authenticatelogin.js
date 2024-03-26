const jwt = require('jsonwebtoken');

const authenticatelogin = (req, res, next) => {
    // Get token from cookies or session based on your implementation
    const token = req.cookies.token || req.session.token;

    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
            if (err) {
                // If token verification fails, continue to login page
                next();
            } else {
                // If token is valid, redirect to dashboard
                res.redirect("/dashhome");
            }
        });
    } else {
        // If no token found, continue to login page
        next();
    }
};

module.exports = authenticatelogin;
