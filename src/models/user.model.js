const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');
const { userRoles, teamRoles } = require('../config/roles');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    githubId: {
      type: String,
      required: false,
      trim: true,
      index: {
        unique: true,
        partialFilterExpression: {githubId: {$type: "string"}}
      },
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      trim: true,
      index: {
        unique: true,
        partialFilterExpression: {googleId: {$type: "string"}}
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error('Password must contain at least one letter and one number');
        }
      },
      private: true, // used by the toJSON plugin
    },
    role: {
      type: String,
      enum: userRoles,
      default: 'user',
    },
    activeTeam: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Team',
      required: false, 
    },
    teams: {
      type: [{
        id: {
          type: mongoose.SchemaTypes.ObjectId,
          ref: 'Team',
          required: true,
        },
        name: {
          type: String,
          required: true,
          trim: true,
        },
        role: {
          type: String,
          enum: teamRoles,
          required: true,    
        },
      }],
      required: false,
    },
    subscription: {
      type: {
        id: {
          type: String,
        },
        subscriptionType: {
          type: String,
          required: true,
        },
      },
      default: {
        subscriptionType: 'free',
      },
    },
    stripeId: {
      type: String,
      required: true,
      unique: true,
      private: true, // used by the toJSON plugin
    },
    stripePaymentMethod: {
      type: {
        id: {
          type: String,
          required: true,
        },
        last4: {
          type: String,
          required: true,
          trim: true,
          minlength: 4,
          maxlength: 4,
          validate(value) {
            if (!value.match(/^\d+$/)) {
              throw new Error('last4 must be a number');
            }
          },
        }
      },
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

/**
 * @typedef User
 */
const User = mongoose.model('User', userSchema);

module.exports = User;
