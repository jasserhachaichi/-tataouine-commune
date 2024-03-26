const express = require("express");
const router = express.Router();
const Email = require('./../models/Email');
router.use(express.static('public'));
router.use(express.static("Attachments"));

router.get("/", async (req, res) => {
    try {
      const emailId = req.query.id;
      const email = await Email.findById(emailId);
      if (!email) {
        return res.redirect("/404");
      }
      return res.render('dashboard/email', { email });
    } catch (error) {
      console.error(error);
      return res.redirect("/404");
    }
  });


module.exports = router;
