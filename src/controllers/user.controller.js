const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../config/logger');
const { User } = require('../models');
const { userService, teamService, tokenService, stripeService } = require('../services');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUserWithStripe(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const userOld = await userService.getUserById(req.params.userId);
  if (!userOld) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const name = req.body.name || userOld.name;
  const email = req.body.email || userOld.email;
  if (req.body.email) {
    req.body.isEmailVerified = false;
  }
  const user = await userService.updateUser(userOld, req.body);
  for (const team of user.teams) {
    await teamService.updateUserById(team.id, user.id, {name: user.name, email: user.email});
  }
  await stripeService.updateCustomer(userOld.stripeId, name, email);
  if (req.body.email) {
    try{
      const emailVerificationToken = await tokenService.generateEmailVerificationToken(user);
      await emailService.sendEmailVerificationEmail(req.body.email, emailVerificationToken);  
    } catch (error) {
      logger.warn('Unable to send verification email. Make sure that the email server is connected');
    }
  }
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  for (const team of user.teams) {
    if (team.role === 'teamOwner') {
      const m_team = await teamService.deleteTeamById(team.id);
      for (const m_user of m_team.users) {
        await userService.deleteTeamById(user.id, team.id);
      }
    } else {
      await teamService.deleteUserById(team.id, user.id);
    }
  }
  await userService.deleteUserById(req.params.userId);
  await stripeService.deleteCustomer(user.stripeId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
