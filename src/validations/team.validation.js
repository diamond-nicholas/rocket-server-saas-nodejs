const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createTeam = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const setActiveTeam = {
  body: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

const getTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

const leaveTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

const updateTeam = {
  params: Joi.object().keys({
    teamId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string(),
    })
    .min(1),
};

const deleteTeam = {
  params: Joi.object().keys({
    teamId: Joi.string().custom(objectId),
  }),
};

const createInvitation = {
  params: Joi.object().keys({
    teamId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      email: Joi.string().required().email(),
      role: Joi.string().required().valid('teamAdmin', 'teamUser'),
    }),
};

const getInvitation = {
  params: Joi.object().keys({
    teamId: Joi.required().custom(objectId),
    invitationId: Joi.required().custom(objectId),
  }),
};

const handleInvitation = {
  params: Joi.object().keys({
    teamId: Joi.required().custom(objectId),
    invitationId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      accepted: Joi.boolean().required(),
    }),
};

const deleteInvitation = {
  params: Joi.object().keys({
    teamId: Joi.required().custom(objectId),
    invitationId: Joi.required().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    teamId: Joi.required().custom(objectId),
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      role: Joi.string().required().valid('teamAdmin', 'teamUser'),
    }),
};

const deleteUser = {
  params: Joi.object().keys({
    teamId: Joi.required().custom(objectId),
    userId: Joi.required().custom(objectId),
  }),
};

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
