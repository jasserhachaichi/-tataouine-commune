const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Visitor = require('./../models/Visitor');



passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
      passReqToCallback: true,
    },
    function (req, accessToken, refreshToken, profile, done) {
      Visitor.findOne({ googleId: profile.id })
        .then(visitor => {
          if (!visitor) {
            const newVisitor = new Visitor({
              googleId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
            });
            newVisitor.save();
            return newVisitor
          } else {
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
      done(null, visitor);
    })
    .catch(err => {
      done(err);
    });
});