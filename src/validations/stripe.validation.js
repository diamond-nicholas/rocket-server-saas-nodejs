const Joi = require('joi');

const getStripeProducts = {
  body: Joi.object().keys({}),
};

const updatePaymentMethod = {
  body: Joi.object().keys({
    paymentMethodId: Joi.string().required(),
    address: Joi.object().keys({
	    line1: Joi.string().required(),
	    country: Joi.string().required(),
	  }),
  }),
};

const createSubscription = {
  body: Joi.object().keys({
    subscriptionType: Joi.string().required(),
  }),
};

const completeSubscription = {
  body: Joi.object().keys({
    subscriptionId: Joi.string().required(),
    productId: Joi.string().required(),
  }),
}

const deleteSubscription = {
  body: Joi.object().keys({
    subscriptionId: Joi.string().required(),
  }),
};

module.exports = {
  getStripeProducts,
  updatePaymentMethod,
  createSubscription,
  completeSubscription,
  deleteSubscription,
};
