const express = require("express");
const helmet = require("helmet");
const crypto = require("crypto");
const path = require("path");
// Init App
const app = express();

//  auto refrech
require("./config/autoRefresh");
require("dotenv").config();
// Set View Engine
app.set("view engine", "ejs");
//mongoose Database
const connectToDB = require("./config/db");
// Connection To Database
connectToDB();
// Enable all default Helmet protections
app.use(helmet());
// Middleware to generate and attach nonce to response locals
app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString("base64"); // Generate nonce
    next();
});
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"
                , "'unsafe-inline'"
                , (req, res) => `'nonce-${res.locals.nonce}'`,
                , "https://formbuilder.online"

            ],
            frameSrc: ["'self'", "https://www.google.com", "www.youtube.com",], // Allow framing from Google
            imgSrc: ["'self'", "data:", "https://formbuilder.online", "i.ytimg.com", "https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif"],
            // Add other directives as needed (e.g., imgSrc, connectSrc, etc.)
        },
        // Set reportOnly to true during testing to monitor violations without blocking
        reportOnly: false,
    })
);




// body Parser
const bodyParser = require('body-parser');
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));
// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());

// Serve static files from the 'public', 'views', and 'attachments' directories
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "views")));
app.use(express.static(path.join(__dirname, "attachments")));


const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(cookieParser());
app.use(session({
    secret: process.env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true } // Change secure to true if using HTTPS
}));

// passport  for authentication google
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
require('./config/googleauth2');

// Additional Helmet protections
//app.use(helmet.crossOriginEmbedderPolicy());// problem: block embedded YouTube player and localhost
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy());
app.use(helmet.originAgentCluster());
app.use(helmet.dnsPrefetchControl());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());
// Middleware to set no-cache headers
app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});



// url Routes
app.get('/', (req, res) => {
    console.log("bye bye3");
    res.redirect("/home");
})
app.use("/home", require("./routes/homeroute"));

app.get('/404', (req, res) => {
    return res.render("404");
})
app.get('/blog', (req, res) => {
    return res.render("blogpage");
})
app.use("/forms", require("./routes/formsroute"));
app.use("/termsofuse", require("./routes/termsofuseroute"));
app.use("/galleryimages", require("./routes/gimageroute"));
app.use("/galleryvideos", require("./routes/gvideoroute"));
app.use("/contact", require("./routes/contactroute"));
app.use("/companies", require("./routes/companiesroute"));
app.use("/allannouncement", require("./routes/announcementroute"));
app.use("/blogs", require("./routes/blogsroute"));
app.use("/about", require("./routes/aboutroute"));
app.use("/events", require("./routes/eventsroute"));
app.use("/faq", require("./routes/faqroute"));


//Dashboard
const authenticateToken = require('./middleware/authenticateToken.js');
const authenticatelogin = require('./middleware/authenticatelogin');
const checkUserRole = require("./middleware/checkUserRole");

app.use("/dashhome", authenticateToken, require("./routes/dashhomeroute.js"));
app.use("/addvideo", authenticateToken, checkUserRole, require("./routes/addvideoroute"));
app.use("/allvideos", authenticateToken, checkUserRole, require("./routes/allvideosroute"));

app.use("/addimage", authenticateToken, checkUserRole, require("./routes/addimageroute"));
app.use("/allimage", authenticateToken, checkUserRole, require("./routes/allimageroute"));

app.use("/emailbox", authenticateToken, checkUserRole, require("./routes/emailroute"));

app.use("/addcompany", authenticateToken, checkUserRole, require("./routes/addcompanyroute"));
app.use("/allcompanies", authenticateToken, require("./routes/allcompaniesroute"));


app.use("/users", authenticateToken, checkUserRole, require("./routes/usersroute"));
app.use("/adduser", authenticateToken, checkUserRole, require("./routes/adduserroute"));

app.use("/login", authenticatelogin, require("./routes/loginroute"));

app.use("/addpost", authenticateToken, checkUserRole, require("./routes/addpostroute"));
app.use("/allposts", authenticateToken, checkUserRole, require("./routes/allpostsroute"));


app.use("/addblog", authenticateToken, checkUserRole, require("./routes/addblogroute"));
app.use("/allblogs", authenticateToken, checkUserRole, require("./routes/allblogsroute"));

app.use("/calendarmanagement", authenticateToken, checkUserRole, require("./routes/dashcalendarroute"));
app.use("/createevent", authenticateToken, checkUserRole, require("./routes/createeventroute"));

app.use("/updatetermsofuse", authenticateToken, checkUserRole, require("./routes/updatetermsofuseroute"));


app.use("/allfaq", authenticateToken, checkUserRole, require("./routes/allfaqroute"));
app.use("/updateachievement", authenticateToken, checkUserRole, require("./routes/achievementroute"));

app.use("/createassistance", authenticateToken, checkUserRole, require("./routes/createassIstanceRoute"));
app.use("/assistances", authenticateToken, checkUserRole, require("./routes/assIstanceRoute"));

app.use("/teamform", authenticateToken, require("./routes/teamformroute"));

app.use("/form", /* authenticateToken, checkUserRole, */ require("./routes/formroute"));
app.get('/auth/google/form', passport.authenticate('google', { scope: ['email', 'profile'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/404',
}), (req, res) => {
    if (req.user) {
        const visitorInfo = encodeURIComponent(JSON.stringify({
            id: req.user.googleId,
            name: req.user.name,
            email: req.user.email
        }));
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + 15); // 15 days from now


        res.cookie('visitor', visitorInfo, { httpOnly: true, secure: true, expires: expirationDate });
        return res.redirect("/forms");
    } else {
        res.redirect('/auth/google/form');
    }
});





app.get('/logout', (req, res) => {
    // Clear the token from cookie
    res.clearCookie('token');

    // Clear the session token if it exists
    if (req.session && req.session.token) {
        req.session.token = null;
    }

    return res.redirect("/login");
});








/* app.get('/dashhome', authenticateToken, (req, res) => {
    res.render("dashboard/home");
}); */
app.use("/success", require("./routes/successroute"));
app.use("/failure", require("./routes/failureroute"));





// Gestionnaire de route pour les routes non définies
app.use((req, res, next) => {
    return res.redirect("/404");
});

// Running The Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
    console.log(`Example app listening at http://localhost:${PORT}`)
);
