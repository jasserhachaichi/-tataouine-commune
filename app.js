const express = require("express");
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
    cookie: { secure: false } // Change secure to true if using HTTPS
}));

// passport  for authentication google
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
require('./config/googleauth2');





// url Routes
app.get('/', (req, res) => {
    res.redirect("/home");
})
app.use("/home", require("./routes/homeroute"));

app.get('/404', (req, res) => {
    return res.render("404");
})
app.get('/blog', (req, res) => {
    return res.render("blogpage");
})
app.get('/logout', (req, res) => {
    // Clear the token from cookie
    res.clearCookie('token');

    // Clear the session token if it exists
    if (req.session && req.session.token) {
        req.session.token = null;
    }

    return res.redirect("/login");
});
app.use("/forms", require("./routes/formsroute"));
app.use("/termsofuse" , require("./routes/termsofuseroute"));
app.use("/galleryimages", require("./routes/gimageroute"));
app.use("/galleryvideos", require("./routes/gvideoroute"));
app.use("/contact", require("./routes/contactroute"));
app.use("/companies", require("./routes/companiesroute"));
app.use("/allannouncement", require("./routes/announcementroute"));
app.use("/blogs", require("./routes/blogsroute"));

app.use("/events", require("./routes/eventsroute"));
const Event = require("./models/Event");
app.get("/allevents", async (req, res) => {
    console.log("jasser");
    try {
        const events = await Event.find({}, { __v: 0 });
        return res.status(200).json({ events: events });
    } catch (error) {
        return res.status(500).json({ message: "Failed to fetch events", error: error.message });
    }
});

app.use("/faq", require("./routes/faqroute"));
app.get('/about', (req, res) => {
    return res.render("about");
})
//Dashboard
const authenticateToken = require('./middleware/authenticate');
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

app.use("/teamform", authenticateToken , require("./routes/teamformroute"));

app.use("/form", /* authenticateToken, checkUserRole, */ require("./routes/formroute"));
app.get(
    '/auth/google/form',
    passport.authenticate('google', {
        scope: ['email', 'profile'],
    })
);
app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/protected',
        failureRedirect: '/404',
    })
);
app.use('/auth/logout', (req, res) => {
    res.clearCookie('visitor'); // Clear the visitor cookie
    req.session.destroy();
    res.send('See you again!');
});
app.get('/auth/protected', (req, res) => {
    //console.log("2 hhhhhh");
    //console.log(req.user);
    const userCookie = JSON.stringify(req.user);
    res.cookie('visitor', userCookie, { httpOnly: true, maxAge: 15 * 24 * 60 * 60 * 1000 });
    //res.send(`Cookie set: ${userCookie}`);
    return res.redirect("/forms");
});










/* app.get('/dashhome', authenticateToken, (req, res) => {
    res.render("dashboard/home");
}); */
app.use("/success" , require("./routes/successroute"));
app.use("/failure" , require("./routes/failureroute"));





// Gestionnaire de route pour les routes non définies
app.use((req, res, next) => {
    return res.redirect("/404");
});

// Running The Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
    console.log(`Example app listening at http://localhost:${PORT}`)
);
