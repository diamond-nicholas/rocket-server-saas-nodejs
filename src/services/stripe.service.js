const config = require('../config/config');
const Stripe = require('stripe');
const stripe = Stripe(config.stripe.secret);
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');

let stripeProducts;
let stripePrices;

/**
 * Get products
 * @returns {List<Object>} stripeProducts
 */
const getProducts = async () => {
	const products = await stripe.products.list();
	const stripeProducts = products.data;
	return stripeProducts;
};

/**
 * Create products
 * @param {List<Object>} products
 * @returns {List<Object>} stripeProducts
 */
const createProducts = async (products) => {
	const stripeProducts = [];
	products.forEach(async (item) => {
    const stripeProduct = await stripe.products.create(item.product);
    stripeProducts.push(stripeProduct);
	});
	return stripeProducts;
};

/**
 * Update products
 * @param {List<Object>} products
 * @returns {List<Object>} stripeProducts
 */
const updateProducts = async (products) => {
	const stripeProducts = [];
	const stripeProductsOld = await getProducts();
	if(!stripeProductsOld || stripeProductsOld.length === 0) {
		return createProducts(products);
	}
	products.forEach(async (item) => {
		const stripeProductOld = stripeProductsOld.find(itemOld => itemOld.metadata.type === item.product.metadata.type);
    if(stripeProductOld) { 
    	const stripeProduct = await stripe.products.update(
	    	stripeProductOld.id,
	    	{...item.products}
	    );
	    stripeProducts.push(stripeProduct);
	  } else {
	  	const stripeProduct = await stripe.products.create(item.product);
    	stripeProducts.push(stripeProduct);	
	  }
	});
	return stripeProducts;
};

/**
 * Get prices
 * @returns {List<Object>} stripePrices
 */
const getPrices = async () => {
	const prices = await stripe.prices.list();
	const stripePrices = prices.data;
	return stripePrices;
};

/**
 * Create prices
 * @param {List<Object>} products
 * @param {List<Object>} stripeProducts
 * @returns {List<Object>} stripePrices
 */
const createPrices = async (products, stripeProducts) => {
	const stripePrices = [];
	products.forEach(async (item) => {
		const stripeProduct = stripeProducts.find(itemOld => itemOld.metadata.type === item.price.metadata.type);
    const stripePrice = await stripe.prices.create({
    	product: stripeProduct.id,
    	...item.price
    });
    stripePrices.push(stripePrice);
	});
	return stripePrices;
};

/**
 * Update prices
 * @param {List<Object>} products
 * @param {List<Object>} stripeProducts
 * @returns {List<Object>} stripePrices
 */
const updatePrices = async (products, stripeProducts) => {
	const stripePricesOld = await getPrices();
	if(!stripePricesOld || stripePricesOld.length === 0) {
		return createPrices(products, stripeProducts);
	}
	return stripePricesOld;
};

/**
 * Setup stripe products
 * NOT RECOMMENDED : Use Stripe Dashboard instead
 * Cannout update/delete prices using api
 * Cannot delete products using api
 * Use only for first time product creation
 */
const setupStripeProducts = async () => {
	stripeProducts = await updateProducts(products);
	stripePrices = await updatePrices(products, stripeProducts);
};

/**
 * Load stripe products
 */
const loadStripeProducts = async () => {
	stripeProducts = await getProducts();
	stripePrices = await getPrices();
};

/**
 * Get stripe products
 * @returns {List<Object>}
 */
const getStripeProducts = async () => {
	return stripeProducts;
};

/**
 * Get stripe prices
 * @returns {List<Object>}
 */
const getStripePrices = async () => {
	return stripePrices;
};

/**
 * Get stripe product from product Id
 * @returns {Object}
 */
const getProductFromProductId = async (productId) => {
	const product = stripeProducts.find(product => product.id === productId);
	return product;
};

/**
 * Create customer
 * @param {String} name
 * @param {String} email
 * @returns {Promise<Object>}
 */
const createCustomer = async (name, email) => {
	const customer = await stripe.customers.create({
		name: name,
		email: email,
	});
	return customer;
};

/**
 * Get customer
 * @param {String} stripeId
 * @returns {Promise<Object>}
 */
const getCustomer = async (stripeId) => {
	const customer = await stripe.customers.retrieve(
		stripeId
	);
	return customer;
};

/**
 * Update customer
 * @param {String} stripeId
 * @param {String} name
 * @param {String} email
 * @returns {Promise<Object>}
 */
const updateCustomer = async (stripeId, name, email) => {
	const customer = await stripe.customers.update(
	  stripeId,
	  {
			name: name,
			email: email,
		}
	);
	return customer;
};

/**
 * Delete customer
 * @param {String} stripeId
 * @returns {Promise<Object>}
 */
const deleteCustomer = async (stripeId) => {
	const deleted = await stripe.customers.del(
	  stripeId
	);
	return deleted;
};

/**
 * Get payment method
 * @param {String} stripeId
 * @returns {Promise<Object>}
 */
const getPaymentMethod = async (paymentMethodId) => {
	const paymentMethod = await stripe.paymentMethods.retrieve(
    paymentMethodId
  );
	return paymentMethod;
};

/**
 * Attach payment method
 * @param {String} stripeId
 * @param {String} paymentMethodId
 * @returns {Promise<Object>}
 */
const attachPaymentMethod = async (stripeId, paymentMethodId, address) => {
	await stripe.paymentMethods.attach(paymentMethodId, {
    customer: stripeId,
  });
	await stripe.customers.update(
    stripeId,
    {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
      address: address,
    }
  );
};

/**
 * Detach payment method
 * @param {String} stripeId
 * @param {String} paymentMethodId
 * @returns {Promise<Object>}
 */
const detachPaymentMethod = async (stripeId, paymentMethodId) => {
	await stripe.paymentMethods.detach(
	  paymentMethodId
	);
	await stripe.customers.update(
    stripeId,
    {
      invoice_settings: {
        default_payment_method: null,
      },
    }
  );
};

/**
 * Create subscription
 * @param {String} stripeId
 * @param {String} subscriptionType
 * @returns {Promise<Object>}
 */
const createSubscription = async (stripeId, subscriptionType) => {
	const price = stripePrices.find(price => price.metadata.type === subscriptionType);
	if(!price) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Subscription type not found');
	}
	const subscription = await stripe.subscriptions.create({
		customer: stripeId,
		items: [{
	    price: price.id,
	  }],
		expand: ['latest_invoice.payment_intent'],
	});
	if(subscription.latest_invoice.payment_intent.status === 'requires_payment_method'){
		await stripe.subscriptions.del(subscription.id);
		throw new ApiError(httpStatus.BAD_REQUEST, subscription.latest_invoice.payment_intent.last_payment_error.message);
	}
	return subscription;
};

/**
 * Update subscription
 * @param {String} subscriptionId
 * @param {String} subscriptionType
 * @returns {Promise<Object>}
 */
const updateSubscription = async (subscriptionId, subscriptionType) => {
	const price = stripePrices.find(price => price.metadata.type === subscriptionType);
	if(!price) {
		throw new ApiError(httpStatus.NOT_FOUND, 'Subscription type not found');
	}
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const updatedSubscription = await stripe.subscriptions.update(
    subscriptionId,
    {
      cancel_at_period_end: false,
      items: [
        {
          id: subscription.items.data[0].id,
          price: price.id,
        },
      ],
      expand: ['latest_invoice.payment_intent'],
    }
  );
	return updatedSubscription;
};

/**
 * Delete subscription
 * @param {String} subscriptionId
 * @returns {Promise<Object>}
 */
const deleteSubscription = async (subscriptionId) => {
	const subscription = await stripe.subscriptions.retrieve(subscriptionId);
	if(!subscription) {
		throw new ApiError(httpStatus.NOT_FOUND, "subscription not found");	
	}
	await stripe.subscriptions.del(subscriptionId);
};

module.exports = {
  getProducts,
  createProducts,
  updateProducts,
  getPrices,
  createPrices,
  updatePrices,
  setupStripeProducts,
  loadStripeProducts,
  getStripeProducts,
  getStripePrices,
  getProductFromProductId,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getPaymentMethod,
  attachPaymentMethod,
  detachPaymentMethod,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};