const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const CompanyInfo = require('./../models/Company');

// Validation rules using Express Validator
const validationRules = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('mobile').isMobilePhone().withMessage('Invalid mobile number'),
  body('location').notEmpty().withMessage('Location is required'),
  body('domain').notEmpty().withMessage('Domain is required'),
];

router.get("/", (req, res) => {
  return res.render("dashboard/addcompany");
});

router.post('/', validationRules, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {
      name,
      email,
      mobile,
      linkc,
      Ttd,
      location,
      domain,
    } = req.body;

    const companyInfo = new CompanyInfo({
      name,
      email,
      mobile,
      link: linkc,
      ltd: Ttd,
      location,
      domain,
    }); 



    await companyInfo.save();
    return res.status(200).json({ message: 'Company information saved successfully' });
  } catch (error) {
    console.error('Error saving company information:', error);
    return res.status(500).json({ message: 'Error saving company information' });
  }
});

module.exports = router;
