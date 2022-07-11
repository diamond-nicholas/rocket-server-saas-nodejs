const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const stripeValidation = require('../../validations/stripe.validation');
const stripeController = require('../../controllers/stripe.controller');

const router = express.Router();

router.post('/get-products', validate(stripeValidation.getStripeProducts), stripeController.getStripeProducts);
router.post('/updatePaymentMethod', auth(), validate(stripeValidation.updatePaymentMethod), stripeController.updatePaymentMethod);
router.post('/create-subscription', auth(), validate(stripeValidation.createSubscription), stripeController.createSubscription);
router.post('/complete-subscription', auth(), validate(stripeValidation.completeSubscription), stripeController.completeSubscription);
router.post('/delete-subscription', auth(), validate(stripeValidation.deleteSubscription), stripeController.deleteSubscription);

router.post('/stripe-webhook', stripeController.webhook);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Stripe
 *   description: Stripe billing management
 */

/**
 * @swagger
 * path:
 *  /stripe/get-products:
 *    post:
 *      summary: Get all stripe products
 *      tags: [Stripe]
 *      security:
 *        - bearerAuth: []
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  prodcuts:
 *                    type: array
 *                    items:
 *                      $ref: '#/components/schemas/Product'
 */


/**
 * @swagger
 * path:
 *  /stripe/updatePaymentMethod:
 *    post:
 *      summary: Update payment method
 *      description: Update payment method of active user
 *      tags: [Stripe]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - paymentMethodId
 *                - address
 *              properties:
 *                paymentMethodId:
 *                  type: string
 *                address:
 *                  type: object
 *                  properties:
 *                    line1:
 *                      type: string
 *                    country:
 *                      type: string
 *              example:
 *                paymentMethodId: "pm_1IU5TLA47ywM2VWffgScxDOT"
 *                address:
 *                  line1: temporary address
 *                  country: US
 *      responses:
 *        "201":
 *          description: Completed Subscription
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    $ref: '#/components/schemas/User'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "400":
 *          $ref: '#/components/responses/StripeError'
 *
 */

 /**
 * @swagger
 * path:
 *  /stripe/create-subscription:
 *    post:
 *      summary: Create Subscription
 *      description: Create a subscription of active user
 *      tags: [Stripe]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - subscriptionType
 *              properties:
 *                subscriptionType:
 *                  type: string
 *              example:
 *                subscriptionType: "basic"
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  subscription:
 *                    type: object
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *        "400":
 *          $ref: '#/components/responses/SubcriptionAlreadyActive'
 */

/**
 * @swagger
 * path:
 *  /stripe/complete-subscription:
 *    post:
 *      summary: Complete Subscription
 *      description: Complete a subscription of active user
 *      tags: [Stripe]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - subscriptionId
 *              properties:
 *                subscriptionId:
 *                  type: string
 *                productdId:
 *                  type: string
 *              example:
 *                subscriptionId: "sub_J8YWeGOTxiuuz3"
 *                productId: "prod_J8YWeGOTxiuuz3"
 *      responses:
 *        "201":
 *          description: Completed Subscription
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    $ref: '#/components/schemas/User'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * path:
 *  /stripe/delete-subscription:
 *    post:
 *      summary: Delete Subscription
 *      description: Delete a subscription of active user
 *      tags: [Stripe]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - subscriptionId
 *              properties:
 *                subscriptionId:
 *                  type: string
 *              example:
 *                subscriptionId: "sub_J8YWeGOTxiuuz3"
 *      responses:
 *        "204":
 *          description: NO_CONTENT
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */