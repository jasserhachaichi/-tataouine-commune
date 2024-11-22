const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    // Get token from cookies or session based on your implementation
    //const token = req.cookies.token || req.session.token;
    //console.log("token" +  token);
    //console.log(req.session.token);
    const token = req.cookies.token;

    if (!token) {
        res.redirect("/home");
    } else {
        jwt.verify(token, process.env.TOKEN_SECRET , (err, decoded) => {
            if (err) {
                res.redirect("/home");
            } else {
                // If token is valid, attach the decoded user information to the request object
                req.userRole = decoded.userRole;
                //console.log(req.userRole);
                //req.user = decoded;// bug
                next();
            }
        });
    }
    
};

module.exports = authenticateToken;
