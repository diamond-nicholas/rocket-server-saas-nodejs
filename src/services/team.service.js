const httpStatus = require('http-status');
const { User, Team } = require('../models');
const stripeService = require('./stripe.service');
const ApiError = require('../utils/ApiError');

/**
 * Create a team
 * @param {Object} user
 * @param {Object} teamName
 * @returns {Promise<Team>}
 */
const createTeam = async (user, teamName) => {
  const teamBody = {
    name: teamName,
    owner: user.id,
    users: [{
      _id: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: 'teamOwner',
    }],
    invitations: [],
  };
  const team = await Team.create(teamBody);
  return team;
};

/**
 * Get team by id
 * @param {ObjectId} id
 * @returns {Promise<Team>}
 */
const getTeamById = async (id) => {
  return Team.findById(id);
};

/**
 * Update team by id
 * @param {ObjectId} teamId
 * @param {Object} updateBody
 * @returns {Promise<Team>}
 */
const updateTeamById = async (teamId, updateBody) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  if (updateBody.owner && !(await User.findById(updateBody.owner))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Owner user not found');
  }
  if (updateBody.users || updateBody.invitations) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot update users or invitations');
  }
  Object.assign(team, updateBody);
  await team.save();
  return team;
};


/**
 * Delete team by id
 * @param {ObjectId} teamId
 * @returns {Promise<Team>}
 */
const deleteTeamById = async (teamId) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  await team.remove();
  return team;
};

/**
 * Create invitation
 * @param {Team} team
 * @param {Object} userBody
 * @returns {Promise<Team>}
 */
const createInvitation = async (team, userBody) => {
  team.invitations.push(userBody);
  await team.save();
  return team;
};

/**
 * Delete invitation
 * @param {Team} team
 * @param {string} email
 * @returns {Promise<Team>}
 */
const deleteInvitation = async (team, email) => {
  let found = false;
  for (const invitation of team.invitations) {
    if(email === invitation.email) {
      found = true;
      invitation.remove();
    }
  }
  if(!found) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email not found');
  }
  await team.save();
  return team;
};

/**
 * Get invitation by Id
 * @param {ObjectId} teamId
 * @param {ObjectId} invitationId
 * @returns {Promise<Team>}
 */
const getInvitationById = async (teamId, invitationId) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  const invitation = team.invitations.id(invitationId);
  if(!invitation) {
     throw new ApiError(httpStatus.BAD_REQUEST, 'Invitation not found');   
  }
  return {team, invitation};
};

/**
 * Delete invitation by Id
 * @param {ObjectId} teamId
 * @param {ObjectId} invitationId
 * @returns {Promise<Team>}
 */
const deleteInvitationById = async (teamId, invitationId) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  team.invitations.pull(invitationId);
  await team.save();
  return team;
};

/**
 * Add user
 * @param {Team} team
 * @param {Object} userBody
 * @returns {Promise<Team>}
 */
const addUser = async (team, userBody) => {
  team.users.push({_id: userBody.id, ...userBody});
  await team.save();
  return team;
};

/**
 * Update user by Id
 * @param {ObjectId} teamId
 * @param {ObjectId} userId
 * @returns {Promise<Team>}
 */
const updateUserById = async (teamId, userId, userBody) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  const user = team.users.id(userId);
  if(!user) {
     throw new ApiError(httpStatus.BAD_REQUEST, 'Team user not found');   
  }
  Object.assign(user, userBody);
  await team.save();
  return team;
};

/**
 * Delete user by Id
 * @param {ObjectId} teamId
 * @param {ObjectId} userId
 * @returns {Promise<Team>}
 */
const deleteUserById = async (teamId, userId) => {
  const team = await getTeamById(teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  const user = team.users.id(userId);
  if(user && user.role === 'teamOwner') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot delete team owner');     
  }
  team.users.pull(userId);
  await team.save();
  return team;
};

module.exports = {
  createTeam,
  getTeamById,
  updateTeamById,
  deleteTeamById,
  createInvitation,
  getInvitationById,
  deleteInvitation,
  deleteInvitationById,
  addUser,
  updateUserById,
  deleteUserById
};
