const passport = require('passport');
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { allUserRights, allTeamRights, userRoleRights, teamRoleRights } = require('../config/roles');

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
  if (err || info || !user) {
    return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
  req.user = user;

  const requiredUserRights = requiredRights.filter(requiredRight => allUserRights.includes(requiredRight));
  const requiredTeamRights = requiredRights.filter(requiredRight => allTeamRights.includes(requiredRight));

  if(requiredUserRights.length) {
    const userRights = userRoleRights[user.role];
    const hasRequiredRights = requiredUserRights.every((requiredRight) => userRights.includes(requiredRight));
    if (!hasRequiredRights && req.params.userId !== user.id) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
    }
  }

  if(requiredTeamRights.length) {
    if (!req.params.teamId || !user.teams.id(req.params.teamId)) {
      return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden')); 
    } else {
      const team = user.teams.id(req.params.teamId);
      const teamRights = teamRoleRights[team.role];
      const hasRequiredRights = requiredTeamRights.every((requiredRight) => teamRights.includes(requiredRight));
      if (!hasRequiredRights) {
        return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }   
    }
  }

  resolve();
};

const auth = (...requiredRights) => async (req, res, next) => {
  return new Promise((resolve, reject) => {
    passport.authenticate('jwt', { session: false }, verifyCallback(req, resolve, reject, requiredRights))(req, res, next);
  })
    .then(() => next())
    .catch((err) => next(err));
};

module.exports = auth;
