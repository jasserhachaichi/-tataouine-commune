const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Visitor = require('./../models/Visitor');



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: 'http://localhost:5000/auth/google/callback',
      passReqToCallback: true,
    },
    function(req, accessToken, refreshToken, profile, done) {
      // Check if the visitor exists in your database
      Visitor.findOne({ googleId: profile.id })
        .then(visitor => {
          if (!visitor) {
            // If the visitor doesn't exist, create a new one
            const newVisitor = new Visitor({
              googleId: profile.id,
              email: profile.emails[0].value, // Extracting the email
              name: profile.displayName, // Extracting the display name
              // You can add other fields as needed
            });
            return newVisitor.save();
          } else {
            // If the visitor exists, return the visitor object
            return visitor;
          }
        })
        .then(visitor => {
          done(null, visitor);
        })
        .catch(err => {
          done(err);
        });
    }
  )
);







passport.serializeUser((visitor, done) => {
  done(null, visitor.id); 
});

passport.deserializeUser((id, done) => {
  Visitor.findById(id)
    .then(visitor => {
      done(null, visitor); // Pass the visitor to the next middleware
    })
    .catch(err => {
      done(err); // Pass any errors to the next middleware
    });
});


