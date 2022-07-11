const passport = require('passport');
const url = require('url'); 
const config = require('../config/config');
const logger = require('../config/logger');
const { githubStrategy, googleStrategy } = require('../config/passport');

const strategyExists = (strategy) => {
  let oauthStrategy;
  switch (strategy) {
    case 'github' : oauthStrategy = githubStrategy; break;
    case 'google' : oauthStrategy = googleStrategy; break;
    default : oauthStrategy = null;
  }
  return !!oauthStrategy;
}

const verifyCallback = (req, resolve, reject) => async (err, user, info) => {
  if (err || !user) {
    logger.warn(err);
    return reject(new Error('Authentication Failed'));
  }
  req.user = user;
  resolve();
};

const oauth = (strategy) => async (req, res, next) => {
  let redirectURL = req.header('Referer');
  if(redirectURL) {
    redirectURL = redirectURL.split("?").shift();
  } else {
    if(req.query && req.query.state) {
      redirectURL = redirectURL || JSON.parse(req.query.state).url;
    }
    redirectURL = redirectURL || `${config.clientURL}/auth/login`;
  }

  logger.info('Referer URL: ' + redirectURL);

  return new Promise((resolve, reject) => {
    if (!strategyExists(strategy)) {
      reject(new Error(`${strategy} strategy does not exist`));
    } else {
      passport.authenticate(strategy, { session: false, state: JSON.stringify({url: redirectURL}) }, verifyCallback(req, resolve, reject))(req, res, next);
    }
  })
    .then(() => next())
    .catch((err) => {
      logger.warn(err);
      res.redirect(
        url.format({
          pathname: redirectURL,
          query: {
            OAuthRedirect : strategy,
          }
        }
      ));
    });
};

module.exports = oauth;
