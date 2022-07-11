const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, teamService, emailService } = require('../services');

const createTeam = catchAsync(async (req, res) => {
  const team = await teamService.createTeam(req.user, req.body.name);
  const user = await userService.addTeam(req.user, {id: team.id, name: team.name, role: 'teamOwner'});
  res.status(httpStatus.CREATED).send(user);
});

const setActiveTeam = catchAsync(async (req, res) => {
  const team = await teamService.getTeamById(req.body.teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  if (!req.user.teams || !req.user.teams.id(team.id)) {
    throw new ApiError(httpStatus.FORBIDDEN, 'User is not a part of this team'); 
  }
  const user = await userService.updateUser(req.user, {activeTeam: team.id});
  res.send(user);
});

const getTeam = catchAsync(async (req, res) => {
  const team = await teamService.getTeamById(req.params.teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }
  res.send(team);
});

const leaveTeam = catchAsync(async (req, res) => {
  const team = await teamService.deleteUserById(req.params.teamId, req.user.id);
  const user = await userService.deleteTeamById(req.user.id, team.id);
  res.send({user: user, team: team});
});

const updateTeam = catchAsync(async (req, res) => {
  const team = await teamService.updateTeamById(req.params.teamId, req.body);
  for (const user of team.users) {
    const m_user = await userService.updateTeamById(user.id, team);
    if(req.user.id === m_user.id) {
      req.user = m_user;
    }
  }
  res.send({user:req.user, team:team});
});

const deleteTeam = catchAsync(async (req, res) => {
  const team = await teamService.deleteTeamById(req.params.teamId);
  for (const user of team.users) {
    const m_user = await userService.deleteTeamById(user.id, team.id);
    if(req.user.id === m_user.id) {
      req.user = m_user;
    }
  }
  res.send(req.user);
});

const createInvitation = catchAsync(async (req, res) => {
  try {
    await emailService.transport.verify();
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Unable to send invitation email.');
  }

  let team = await teamService.getTeamById(req.params.teamId);
  if (!team) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Team not found');
  }

  for (const user of team.users) {
    if(req.body.email === user.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already a part of the team');   
    }
  }

  for (const invitation of team.invitations) {
    if(req.body.email === invitation.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invitation has already been sent to this email');   
    }
  }

  team = await teamService.createInvitation(team, {email: req.body.email, role: req.body.role});
  await emailService.sendTeamInvitationEmail(req.body.email, team, team.invitations[team.invitations.length -1]._id);  

  res.send(team);
});

const getInvitation = catchAsync(async (req, res) => {
  const {team, invitation} = await teamService.getInvitationById(req.params.teamId, req.params.invitationId);
  if(req.user.email !== invitation.email) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  res.send({teamName: team.name, invitation: invitation});
});

const handleInvitation = catchAsync(async (req, res) => {
  const {team, invitation} = await teamService.getInvitationById(req.params.teamId, req.params.invitationId);
  if(req.user.email !== invitation.email) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
  let user = req.user;
  if(req.body.accepted) {
    await teamService.addUser(team, {id: user.id, name: user.name, email: user.email, role: invitation.role});
    user = await userService.addTeam(user, {id: team.id, name: team.name, role: invitation.role});
  }
  await teamService.deleteInvitationById(req.params.teamId, req.params.invitationId);
  res.send(user);
});

const deleteInvitation = catchAsync(async (req, res) => {
  const team = await teamService.deleteInvitationById(req.params.teamId, req.params.invitationId);
  res.send(team);
});

const updateUser = catchAsync(async (req, res) => {
  const team = await teamService.updateUserById(req.params.teamId, req.params.userId, {role: req.body.role});
  const user = await userService.updateTeamById(req.params.userId, team);
  res.send({user: user, team: team});
});

const deleteUser = catchAsync(async (req, res) => {
  const team = await teamService.deleteUserById(req.params.teamId, req.params.userId);
  const user = await userService.deleteTeamById(req.params.userId, team.id);
  res.send({user: user, team: team});
});

module.exports = {
  createTeam,
  setActiveTeam,
  getTeam,
  leaveTeam,
  updateTeam,
  deleteTeam,
  createInvitation,
  getInvitation,
  handleInvitation,
  deleteInvitation,
  updateUser,
  deleteUser,
};
