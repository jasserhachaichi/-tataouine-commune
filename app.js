const express = require("express");
// Init App
const app = express();
// Serve static files from the 'public' directory
app.use(express.static("public"));
app.use(express.static("views"));
app.use(express.static("Attachments"));
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






const cookieParser = require('cookie-parser');
const session = require('express-session');

app.use(cookieParser());
app.use(session({
    secret: process.env.TOKEN_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Change secure to true if using HTTPS
}));




// url Routes
app.get('/', (req, res) => {
    res.redirect("/home");
})
app.use("/home", require("./routes/homeroute"));

app.get('/404', (req, res) => {
    res.render("404");
})
app.get('/blog', (req, res) => {
    res.render("blogpage");
})
app.get('/logout', (req, res) => {
    // Clear the token from cookies
    res.clearCookie('token');

    // Clear the session token if it exists
    if (req.session && req.session.token) {
        req.session.token = null;
    }

    res.redirect("/login");
});

app.use("/galleryimages", require("./routes/gimageroute"));
app.use("/galleryvideos", require("./routes/gvideoroute"));
app.use("/contact", require("./routes/contactroute"));
app.use("/companies", require("./routes/companiesroute"));
app.use("/allannouncement", require("./routes/announcementroute"));
app.use("/blogs", require("./routes/blogsroute"));



//Dashboard
const authenticateToken = require('./middleware/authenticate');
const authenticatelogin = require('./middleware/authenticatelogin');
const checkUserRole = require("./middleware/checkUserRole");
app.get('/dashhome', authenticateToken, (req, res) => {
    res.render("dashboard/home");
})

app.use("/addvideo", authenticateToken, require("./routes/addvideoroute"));
app.use("/allvideos", authenticateToken, require("./routes/allvideosroute"));

app.use("/addimage", authenticateToken, require("./routes/addimageroute"));
app.use("/allimage", authenticateToken, require("./routes/allimageroute"));

app.use("/emailbox", authenticateToken, checkUserRole, require("./routes/emailroute"));
app.use("/email", authenticateToken, checkUserRole, require("./routes/emailsroute"));
app.use("/emailcreator", authenticateToken, checkUserRole, require("./routes/emailcreatorroute"));

app.use("/addcompany", authenticateToken, checkUserRole, require("./routes/addcompanyroute"));
app.use("/allcompanies", authenticateToken, require("./routes/allcompaniesroute"));



app.use("/users", authenticateToken, checkUserRole, require("./routes/usersroute"));
app.use("/adduser", authenticateToken, checkUserRole, require("./routes/adduserroute"));

app.use("/login", authenticatelogin, require("./routes/loginroute"));

app.use("/addpost", authenticateToken, checkUserRole, require("./routes/addpostroute"));
app.use("/allposts", authenticateToken, checkUserRole, require("./routes/allpostsroute"));


app.use("/addblog", authenticateToken, checkUserRole, require("./routes/addblogroute"));
app.use("/allblogs", authenticateToken, checkUserRole, require("./routes/allblogsroute"));


// Gestionnaire de route pour les routes non définies
app.use((req, res, next) => {
    res.redirect("/404");
});

// Running The Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () =>
    console.log(`Example app listening at http://localhost:${PORT}`)
);
