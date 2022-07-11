const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GitHubStrategy } = require('passport-github2');
const { OAuth2Strategy: GoogleStrategy } = require('passport-google-oauth');
const config = require('./config');
const logger = require('./logger');
const { tokenTypes } = require('./tokens');
const { userService } = require('../services');
const randomString = require('../utils/randomString');

//JWT Strategy
const jwtOptions = {
  secretOrKey: config.jwt.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    if (payload.type !== tokenTypes.ACCESS) {
      throw new Error('Invalid token type');
    }
    const user = await userService.getUserById(payload.sub);
    if (!user) {
      return done(null, false);
    }
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

//Github Strategy
const githubOptions = {
  clientID: config.github.id,
  clientSecret: config.github.secret,
  passReqToCallback: true,
  scope: ['user:email'],
};

const githubVerify = async (req, accessToken, refreshToken, profile, done) => {
  try {
    const userBody = {
      name: profile.displayName,
      email: profile.emails[0].value,
      isEmailVerified: true,
      githubId: profile.id,
      password: 'a1' + randomString(30),
    };
    const user = await userService.getOrCreateUserWithOAuth('github', userBody);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

let githubStrategy;
try {
  githubStrategy = new GitHubStrategy(githubOptions, githubVerify);
} catch (error) {
  logger.warn('Unable to create Github Strategy for auth. Make sure the Github Id and secret are set.');
}

//Google Strategy
const googleOptions = {
  clientID: config.google.id,
  clientSecret: config.google.secret,
  passReqToCallback: true,
  callbackURL: '/v1/auth/google/callback',
  scope: ['profile', 'email'],
};

const googleVerify = async (req, accessToken, refreshToken, params, profile, done) => {
  try {
    const userBody = {
      name: profile.displayName,
      email: profile.emails[0].value,
      isEmailVerified: true,
      googleId: profile.id,
      password: 'a1' + randomString(30),
    };
    const user = await userService.getOrCreateUserWithOAuth('google', userBody);
    done(null, user);
  } catch (error) {
    done(error, false);
  }
};

let googleStrategy;
try {
  googleStrategy = new GoogleStrategy(googleOptions, googleVerify);
} catch (error) {
  logger.warn('Unable to create Google Strategy for auth. Make sure the Google Id and secret are set.');
}

module.exports = {
  jwtStrategy,
  githubStrategy,
  googleStrategy,
};
