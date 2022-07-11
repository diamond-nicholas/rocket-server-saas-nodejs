const mongoose = require('mongoose');
const validator = require('validator');
const { toJSON } = require('./plugins');
const { teamRoles } = require('../config/roles');

const teamSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    users: {
      type: [{
        id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
          validate(value) {
            if (!validator.isEmail(value)) {
              throw new Error('Invalid email');
            }
          },
        },
        role: {
          type: String,
          enum: teamRoles,
          required: true,    
        },
      }],
      required: true,
    },
    invitations: {
      type: [{
        email: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
          validate(value) {
            if (!validator.isEmail(value)) {
              throw new Error('Invalid email');
            }
          },
        },
        role: {
          type: String,
          enum: teamRoles,
          required: true,    
        },
        created: {
          type: Date, 
          default: Date.now,
        },
      }],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
teamSchema.plugin(toJSON);

/**
 * @typedef Team
 */
const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
