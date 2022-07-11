const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, stripeService } = require('../services');

const getStripeProducts = catchAsync(async (req, res) => {
	const stripeProducts = await stripeService.getStripeProducts();
	const stripePrices = await stripeService.getStripePrices();

	const products = [];
	stripePrices.forEach(stripePrice => {
		const stripeProduct = stripeProducts.find(stripeProduct => stripeProduct.id === stripePrice.product);
		if(!stripeProduct) {
			return;
		}
		let product = {};
		product.product = {};
		product.product.name = stripeProduct.name;
		product.product.description = stripeProduct.description;
		product.product.active = stripeProduct.active;
		product.product.metadata = stripeProduct.metadata;
		product.price = {};
		product.price.unit_amount = stripePrice.unit_amount;
		product.price.currency = stripePrice.currency;
		product.price.recurring = {};
		product.price.recurring.interval = stripePrice.recurring.interval;
		product.price.metadata = stripePrice.metadata;
		a = 0;
		product.price.currency_symbol = a.toLocaleString("en", {style:"currency", currency:stripePrice.currency}).replace(/\d+([,.]\d+)?/g, "");
		if(!product.price.currency_symbol) {
			product.price.currency_symbol = product.price.currency;
		}

		products.push(product);
	});

	const sortedProducts = products.sort((p1,p2) => p1.price.unit_amount - p2.price.unit_amount);

  res.send({products: sortedProducts});
});

const updatePaymentMethod = catchAsync(async (req, res) => {
	const paymentMethod = await stripeService.getPaymentMethod(req.body.paymentMethodId);
	if(req.user.stripePaymentMethod) {
		await stripeService.detachPaymentMethod(req.user.stripeId, req.user.stripePaymentMethod.id);
		const user = await userService.updateUserById(req.user._id, {
	  	stripePaymentMethod: null,
	  });
	}
	let user;
	try {
		await stripeService.attachPaymentMethod(req.user.stripeId, req.body.paymentMethodId, req.body.address);
	  user = await userService.updateUserById(req.user._id, {
	  	stripePaymentMethod: {
	      id: req.body.paymentMethodId,
	      last4: paymentMethod.card.last4,
	    },
	  });	
	} catch (err) {
		const message = err.raw ? err.raw.message : 'Some error occured';
		throw new ApiError(httpStatus.BAD_REQUEST, message);;
	}
  
  res.send({user});
});

const createSubscription = catchAsync(async (req, res) => {
	if(req.user.subscription.subscriptionType === req.body.subscriptionType) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Subscription plan is already active');
	}
	if(req.body.subscriptionType === 'free') {
		await stripeService.deleteSubscription(req.user.subscription.id);
		await userService.updateUserById(req.user.id, {
	  	subscription: {
	      subscriptionType: 'free',
	    },
	  });
		res.status(httpStatus.NO_CONTENT).send();
	} else {
		if(!req.user.stripePaymentMethod) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Billing details not found');
		}
		let subscription;
		if(req.user.subscription.subscriptionType === 'free') {
			subscription = await stripeService.createSubscription(req.user.stripeId, req.body.subscriptionType);
		} else {
			subscription = await stripeService.updateSubscription(req.user.subscription.id, req.body.subscriptionType);
			await userService.updateUserById(req.user.id, {
		  	subscription: {
		  		id: subscription.id,
		      subscriptionType: req.body.subscriptionType,
		    },
		  });
		}
	  res.send({subscription});
	}
});

const completeSubscription = catchAsync(async (req, res) => {
	const product = await stripeService.getProductFromProductId(req.body.productId);
	const user = await userService.updateUserById(req.user.id, {
  	subscription: {
  		id: req.body.subscriptionId,
      subscriptionType: product.metadata.type,
    },
  });
	res.send({user});
});

const deleteSubscription = catchAsync(async (req, res) => {
	await stripeService.deleteSubscription(req.body.subscriptionId);
  res.status(httpStatus.NO_CONTENT).send();
});

const webhook = catchAsync(async (req, res) => {
  const event = req.body;
  let invoice;
  let user;
  let subscription;

  switch (event.type) {
    case 'invoice.paid':
      invoice = event.data.object;
      user = await userService.getUserByStripeId(invoice.customer);
    	if(!user) break;
  	  await userService.updateUserById(user.id, {
		  	subscription: {
		      id: invoice.subscription,
		      subscriptionType: invoice.lines.data[0].price.metadata.type,
		    },
		  });
      break;
    case 'invoice.payment_failed':
    	invoice = event.data.object;
      user = await userService.getUserByStripeId(invoice.customer);
    	await stripeService.deleteSubscription(invoice.subscription);
      await userService.updateUserById(user.id, {
		  	subscription: {
		      subscriptionType: 'free',
		    },
		  });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({received: true});
});

module.exports = {
	getStripeProducts,
  updatePaymentMethod,
  createSubscription,
  completeSubscription,
  deleteSubscription,
  webhook,
};
