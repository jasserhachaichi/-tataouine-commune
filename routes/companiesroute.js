const express = require("express");
const router = express.Router();
const Company = require('./../models/Company');
router.use(express.static("public"));

// GET route for displaying all companies with filters and pagination
router.get("/", async (req, res) => {
  const nonce = res.locals.nonce;
  try {
    const { page = 1, location, domain, search } = req.query;
    const limit = 12; // Number of companies per page

    // Build the query based on filters
    const query = {};
    if (location) query.location = location;
    if (domain) query.domain = domain;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } }, // Case-insensitive search by name
        { email: { $regex: search, $options: 'i' } }, // Case-insensitive search by email
        { mobile: { $regex: search, $options: 'i' } }, // Case-insensitive search by mobile
      ];
    }
    const allcompanies = await Company.find(); // Fetch all companies
    const locations = [...new Set(allcompanies.map(company => company.location))];
    const domains = [...new Set(allcompanies.map(company => company.domain))]; // Extract unique domains


    // Fetch companies with pagination
    const companies = await Company.find(query)
      .limit(limit)
      .skip((page - 1) * limit);

    // Count total number of companies (for pagination)
    const totalCompanies = await Company.countDocuments(query);

    res.render("companies", {
      companies,
      currentPage: page,
      totalPages: Math.ceil(totalCompanies / limit),
      location,
      domain,
      search,
      locations, selectedLocation: req.query.location,
      domains,selectedDomain: req.query.domain,nonce
    });
  } catch (error) {
    console.error(error);
    //return res.redirect("/404");
    return res.render("error", { error });
  }
});

module.exports = router;
