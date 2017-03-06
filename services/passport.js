const passport = require('passport');
const User = require('../models/user');
const config = require('../config');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

// Create local strategy
// By default local strategy use username, need to set email field
const localOptions = {
  usernameField: 'email'
};

const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
  // Verify this email and password, call done with the user
  // if it is the correct email and password
  // otherwise, call done with false
  User.findOne({ email: email }, function(err, user) {
    if (err) { return done(err, false); }
    if (!user) { return done(null, false); }

    // compare passwords - is `password` is equal to user.password
    user.comparePassword(password, function(err, isMath) {
      if (err) { return done(err, false); }
      if (!isMath) { return done(null, false); }

      return done(null, user);
    });
  });
});

// Setup options for JWT Strategy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: config.secret
};

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
  // See if the user ID in the payload exists in our database
  // If it dows, call 'done' with that other
  // otherwise, call done without a user object
  User.findById(payload.sub, function(err, user) {
    // second argument to done is a user object
    if (err) { return done(err, false); }

    if (user) {
      done(null, user);
    } else {
      done(null, false);
    }
  });
});

// Tell passport to use this strategy
passport.use(jwtLogin);
passport.use(localLogin);
