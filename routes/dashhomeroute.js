const express = require("express");
const router = express.Router();

const Visitor = require('./../models/Visitor');
const Blog = require('./../models/Blog');
const Company = require('./../models/Company');
const Image = require('./../models/Image');
const FormData = require('./../models/FormData');
const Video = require('../models/Videog');
const Announcement = require('../models/Announcement');

const AdvancedEvent = require('./../models/AdvancedEvent');
const Event = require("./../models/Event");

const followerModel = require('./../models/Follower');


const jwt = require('jsonwebtoken');

router.get("/", async (req, res) => {
    const token = req.cookies.token || req.session.token;
    const decoded = jwt.decode(token);

    const visitorCount = await Visitor.countDocuments();
    const blogCount = await Blog.countDocuments();
    const companyCount = await Company.countDocuments();
    const imageCount = await Image.countDocuments();
    const formDataCount = await FormData.countDocuments();
    const videoCount = await Video.countDocuments();
    const announcementCount = await Announcement.countDocuments();
    const advancedEventCount = await AdvancedEvent.countDocuments();
    const eventCount = await Event.countDocuments();
    const followerCount = await followerModel.countDocuments();

    // Fetch the top 5 blogs by number of views
    const topBlogs = await Blog.find().select('title autor.fullname nb_views createdAt').sort({ nb_views: -1 }).limit(5);
    //console.log(topBlogs);

    // Fetch upcoming events from both collections { startDate: { $gte: new Date() } }
    //const Events = await AdvancedEvent.find().select('title startDate').sort({ start: 1 }).limit(3);
    const Events = await Event.find({ start: { $gte: new Date() } }).select('title start').sort({ start: 1 }).limit(3);

    //console.log(Events);
    // Pass the values to the home.ejs file
    return res.render("dashboard/home", {
        firstname: decoded.userFname,
        userRole: decoded.userRole,
        visitorCount,
        blogCount,
        companyCount,
        imageCount,
        formDataCount,
        videoCount,
        announcementCount,
        advancedEventCount,
        eventCount,
        followerCount,
        topBlogs,
        Events
    });
});

module.exports = router;