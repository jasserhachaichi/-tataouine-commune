const path = require('path');
const fs = require('fs').promises;
const ejs = require('ejs');
const nodemailer = require('nodemailer');
const transporter = require('./nodemailer');
const sharp = require('sharp');



const Image = require('./../models/Image');
const Blogmodel = require('./../models/Blog');
const Annoncemodel = require('./../models/Announcement');
const Eventmodel = require('./../models/Event');

// Function to truncate strings
function truncateString(str, num) {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
}

// Function to send newsletter
async function sendNewsletter(followers) {
    try {
        
        const emailVars = {}; // Assuming you have some variables to pass to the template
        const templatePath = path.join(__dirname, '../Emailmodels/newsletters.ejs');

        // Read the email template
        const template = await fs.readFile(templatePath, 'utf8');

        // Fetch the latest six images from the database
        const images = await Image.find().sort({ createdAt: -1 }).limit(6).exec();

        // Fetch the latest two announcements, two blogs, and one event from the database
        const announcements = await Annoncemodel.find().sort({ createdAt: -1 }).limit(2).select('title expiredDate path').exec();
        const blogs = await Blogmodel.find().sort({ createdAt: -1 }).limit(2).select('title subtitle coverIMGpath createdAt ').exec();
        const events = await Eventmodel.find().sort({ createdAt: -1 }).limit(1).select('title description start end regDead coverpath').exec();

        // Process images: resize and create attachments
        const attachments = await Promise.all(images.map(async (img, index) => {
            const resizedImagePath = path.join(__dirname, `../temp/resized_${img.filename}`);

            // Resize the image
            await sharp("attachments" + img.path)
                .resize(390, 300)//195, 150
                .toFile(resizedImagePath);

            return {
                filename: img.filename,
                path: resizedImagePath,
                cid: `uniqueimg@image.${index}`
            };
        }));

        // Resize announcement images
        const announcementAttachments = await Promise.all(announcements.map(async (ann, index) => {
            const resizedImagePath = path.join(__dirname, `../temp/announcement_resized_${index}`);

            let annpath = ann.path;
            if (annpath != "/images/Default-thumbnail.png") {
                annpath = "attachments" + annpath;
            }

            await sharp(annpath)
                .resize(290, 180)
                .toFile(resizedImagePath);

            return {
                filename: `announcement_${index}.jpg`,
                path: resizedImagePath,
                cid: `announcement@image.${index}`
            };
        }));

        // Resize blog images
        const blogAttachments = await Promise.all(blogs.map(async (blog, index) => {
            const resizedImagePath = path.join(__dirname, `../temp/blog_resized_${index}`);
            let coverIMGpath = blog.coverIMGpath;
            if (coverIMGpath != "/images/Default-cover.jpg") {
                coverIMGpath = "attachments" + coverIMGpath
            }

            await sharp(coverIMGpath)
                .resize(580, 380)//290, 190
                .toFile(resizedImagePath);

            return {
                filename: `blog_${index}.jpg`,
                path: resizedImagePath,
                cid: `blog@image.${index}`
            };
        }));

        // Resize event image
        const event = events[0];
        const eventResizedImagePath = path.join(__dirname, `../temp/event_resized_eventcoverpath`);

        let eventcoverpath = event.coverpath;
        if (eventcoverpath != "/images/Default-cover.jpg") {
            eventcoverpath = "attachments" + eventcoverpath
        }

        await sharp(eventcoverpath)
            .resize(1200, 400)//600, 200
            .toFile(eventResizedImagePath);

        const eventAttachment = {
            filename: `event.jpg`,
            path: eventResizedImagePath,
            cid: `event@image.0`
        };
        //console.log(path.join(__dirname));
        //console.log(path.join(__dirname, '../public/images/CTlogo.webp'))

        const img1 = path.join(__dirname, '../public/images/CTlogo.png');
        const img2 = path.join(__dirname, '../public/images/ovclogo.png');

        const img3 = path.join(__dirname, '../public/images/email/location.png');
        const img4 = path.join(__dirname, '../public/images/email/phone.png');
        const img5 = path.join(__dirname, '../public/images/email/envelope.png');

        const img6 = path.join(__dirname, '../public/images/email/facebook_31.png');
        const img7 = path.join(__dirname, '../public/images/email/twitter_32.png');
        const img8 = path.join(__dirname, '../public/images/email/google_33.png');
        const img9 = path.join(__dirname, '../public/images/email/youtube_34.png');

        const img10 = path.join(__dirname, '../public/images/email/check_11.png');

        const themeImgs = [{
            filename: 'image1.png',
            path: img1,
            cid: 'unique@image.1'
        },
        {
            filename: 'image2.png',
            path: img2,
            cid: 'unique@image.2'
        },
        {
            filename: 'image3.png',
            path: img3,
            cid: 'unique@image.3'
        },
        {
            filename: 'image4.png',
            path: img4,
            cid: 'unique@image.4'
        },
        {
            filename: 'image5.png',
            path: img5,
            cid: 'unique@image.5'
        },
        {
            filename: 'image6.png',
            path: img6,
            cid: 'unique@image.6'
        },
        {
            filename: 'image7.png',
            path: img7,
            cid: 'unique@image.7'
        },
        {
            filename: 'image8.png',
            path: img8,
            cid: 'unique@image.8'
        },
        {
            filename: 'image9.png',
            path: img9,
            cid: 'unique@image.9'
        },
        {
            filename: 'image10.png',
            path: img10,
            cid: 'unique@image.10'
        }]



        const currentYear = new Date().getFullYear();
        const baseYear = 2024;
        const yearText = currentYear === baseYear ? baseYear : `${baseYear}-${currentYear}`;

        // Combine all attachments
        const allAttachments = [...attachments, ...announcementAttachments, ...blogAttachments, eventAttachment, ...themeImgs];

        // Add images to emailVars for use in the template
        emailVars.images = images;
        emailVars.announcements = announcements;
        emailVars.blogs = blogs;
        emailVars.events = events;
        emailVars.yearText = yearText;
        emailVars.truncateString = truncateString;

        // Render the template with the variables
        const htmlContent = ejs.render(template, emailVars);

        const mailOptions = {
            from: process.env.sendermail,
            to: followers.map(follower => follower.email),
            subject: "Découvrez les dernières nouvelles de notre site !",
            html: htmlContent,
            attachments: allAttachments
        };

        // Send the email
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                console.log("Error sending newsletter email:", error);
            } else {
                console.log('Newsletter email sent:', info.response);
            }
            const allAttachmentsdelete = [...attachments, ...announcementAttachments, ...blogAttachments, eventAttachment];
            // Call clean up after sending email
            await cleanUpImages(allAttachmentsdelete);
        });
    } catch (error) {
        console.error("Error sending newsletter:", error);
    }
}

async function cleanUpImages(attachments) {
    try {
        const deletePromises = attachments.map(async (img) => {
            try {
                await fs.unlink(img.path);
            } catch (error) {
                if (error.code === 'ENOENT') {
                    console.warn(`File not found, skipping: ${img.path}`);
                } else {
                    throw error;
                }
            }
        });
        await Promise.all(deletePromises);
    } catch (error) {
        console.error("Error cleaning up images:", error);
    }
}




module.exports = sendNewsletter;
