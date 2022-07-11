const basic = {
	product: {
		name: 'Basic Subscription',
		active: true,
		description: 'Basic Sass subscription',
		metadata: {type: 'basic'},
	},
	price: {
		unit_amount: 1000,
	  currency: 'usd',
	  active: true,
	  recurring: {
	    interval: 'month',
	  },
	  metadata: {type: 'basic'},
	}
};

const advanced = {
	product: {
		name: 'Advanced Subscription',
		active: true,
		description: 'Advanced Sass subscription',
		metadata: {type: 'advanced'},
	},
	price: {
		unit_amount: 5000,
	  currency: 'usd',
	  active: true,
	  recurring: {
	    interval: 'month',
	  },
	  metadata: {type: 'advanced'},
	}
};

const products = [basic, advanced];

module.exports = products;