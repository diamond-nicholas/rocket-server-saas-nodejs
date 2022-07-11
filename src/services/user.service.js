const httpStatus = require('http-status');
const { User } = require('../models');
const stripeService = require('./stripe.service');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const user = await User.create(userBody);
  return user;
};

/**
 * Create a user along with a Stripe customer account
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUserWithStripe = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  userBody.stripeId = "id";
  const user = await User.create(userBody);
  const stripeUser = await stripeService.createCustomer(userBody.name, userBody.email);
  Object.assign(user, {stripeId: stripeUser.id});
  await user.save();
  return user;
};

/**
 * Get or Create a user along with an OAuth account
 * @param {String} strategy
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const getOrCreateUserWithOAuth = async (strategy, userBody) => {
  let user;
  switch (strategy) {
    case 'github' : user = await User.findOne({ githubId: userBody.githubId }); break;
    case 'google' : user = await User.findOne({ googleId: userBody.googleId }); break;
    default : user = null;
  }
  if (user) {
    return user;
  }
  user = await User.findOne({ email: userBody.email });
  if (user) {
    delete userBody.name;
    delete userBody.password;
    user = await updateUser(user, userBody);
    return user;
  }
  user = await createUserWithStripe(userBody);
  return user;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by stripe Id
 * @param {String} stripeId
 * @returns {Promise<User>}
 */
const getUserByStripeId = async (stripeId) => {
  return User.findOne({ stripeId });
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  let user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user = await updateUser(user, updateBody);
  return user;
};

/**
 * Update user
 * @param {Object} user
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUser = async (user, updateBody) => {
  if(updateBody.teams) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update user teams');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, user.id))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

/**
 * Add team
 * @param {User} user
 * @param {Object} team
 * @returns {Promise<User>}
 */
const addTeam = async (user, team) => {
  user.teams.push({_id: team.id, ...team});
  await user.save();
  return user;
};

/**
 * Update team by id
 * @param {ObjectId} userId
 * @param {Object} team
 * @returns {Promise<User>}
 */
const updateTeamById = async (userId, team) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const m_team = user.teams.id(team.id);
  if (!m_team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  m_team.name = team.name;
  m_team.role = team.users.id(userId).role;
  await user.save();
  return user;
};

/**
 * Delete team by id
 * @param {ObjectId} userId
 * @param {ObjectId} teamId
 * @returns {Promise<User>}
 */
const deleteTeamById = async (userId, teamId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  user.teams.pull(teamId);
  if (user.activeTeam && user.activeTeam.toString() === teamId) {
    user.activeTeam = null;
  }
  await user.save();
  return user;
};

module.exports = {
  createUser,
  createUserWithStripe,
  getOrCreateUserWithOAuth,
  queryUsers,
  getUserById,
  getUserByStripeId,
  getUserByEmail,
  updateUserById,
  updateUser,
  deleteUserById,
  addTeam,
  updateTeamById,
  deleteTeamById,
};
