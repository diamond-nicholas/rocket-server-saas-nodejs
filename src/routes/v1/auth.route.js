const express = require('express');
const oauth = require('../../middlewares/oauth');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const authController = require('../../controllers/auth.controller');

const router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.get('/github', oauth('github'));
router.get('/github/callback', oauth('github'), authController.oauth);
router.get('/google', oauth('google'));
router.get('/google/callback', oauth('google'), authController.oauth);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/forgot-password', validate(authValidation.forgotPassword), authController.forgotPassword);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/verify-email', validate(authValidation.emailVerification), authController.emailVerification);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication
 */

/**
 * @swagger
 * path:
 *  /auth/register:
 *    post:
 *      summary: Register as user
 *      tags: [Auth]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - email
 *                - password
 *              properties:
 *                name:
 *                  type: string
 *                email:
 *                  type: string
 *                  format: email
 *                  description: must be unique
 *                password:
 *                  type: string
 *                  format: password
 *                  minLength: 8
 *                  description: At least one number and one letter
 *              example:
 *                name: fake name
 *                email: fake@example.com
 *                password: password1
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    $ref: '#/components/schemas/User'
 *                  tokens:
 *                    $ref: '#/components/schemas/AuthTokens'
 *          headers: 
 *            Set-Cookie:
 *              description: Refresh Token
 *              schema:
 *                type: object
 *                properties:
 *                  refreshToken:
 *                    $ref: '#/components/schemas/Token'
 *        "400":
 *          $ref: '#/components/responses/DuplicateEmail'
 */

/**
 * @swagger
 * path:
 *  /auth/login:
 *    post:
 *      summary: Login
 *      tags: [Auth]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *                - password
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                password:
 *                  type: string
 *                  format: password
 *              example:
 *                email: fake@example.com
 *                password: password1
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    $ref: '#/components/schemas/User'
 *                  tokens:
 *                    $ref: '#/components/schemas/AuthTokens'
 *          headers: 
 *            Set-Cookie:
 *              description: Refresh Token
 *              schema:
 *                type: object
 *                properties:
 *                  refreshToken:
 *                    $ref: '#/components/schemas/Token'
 *        "401":
 *          description: Invalid email or password
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *              example:
 *                code: 401
 *                message: Invalid email or password
 */

 /**
 * @swagger
 * path:
 *  /auth/github:
 *    get:
 *      summary: Github Authentication
 *      tags: [Auth]
 *      responses:
 *        "302":
 *          description: Found
 *          headers:
 *            Location:
 *              description: Github Oauth URL.
 *              schema:
 *                type: string
 *                format: uri 
 *
 */

  /**
 * @swagger
 * path:
 *  /auth/github/callback:
 *    get:
 *      summary: Github Authentication Callback
 *      tags: [Auth]
 *      responses:
 *        "302":
 *          description: Found
 *          headers:
 *            Location:
 *              description: Client URL.
 *              schema:
 *                type: string
 *                format: uri
 *            Set-Cookie:
 *              description: Refresh Token
 *              schema:
 *                type: object
 *                properties:
 *                  refreshToken:
 *                    $ref: '#/components/schemas/Token'
 *
 */

/**
 * @swagger
 * path:
 *  /auth/google:
 *    get:
 *      summary: Google Authentication
 *      tags: [Auth]
 *      responses:
 *        "302":
 *          description: Found
 *          headers:
 *            Location:
 *              description: Google Oauth URL.
 *              schema:
 *                type: string
 *                format: uri 
 *
 */

  /**
 * @swagger
 * path:
 *  /auth/google/callback:
 *    get:
 *      summary: Google Authentication Callback
 *      tags: [Auth]
 *      responses:
 *        "302":
 *          description: Found
 *          headers:
 *            Location:
 *              description: Client URL.
 *              schema:
 *                type: string
 *                format: uri
 *            Set-Cookie:
 *              description: Refresh Token
 *              schema:
 *                type: object
 *                properties:
 *                  refreshToken:
 *                    $ref: '#/components/schemas/Token'
 *
 */

/**
 * @swagger
 * path:
 *  /auth/logout:
 *    post:
 *      summary: Logout
 *      tags: [Auth]
 *      responses:
 *        "204":
 *          description: No content
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * path:
 *  /auth/refresh-tokens:
 *    post:
 *      summary: Refresh auth tokens
 *      tags: [Auth]
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    $ref: '#/components/schemas/User'
 *                  tokens:
 *                    $ref: '#/components/schemas/AuthTokens'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * path:
 *  /auth/forgot-password:
 *    post:
 *      summary: Forgot password
 *      description: An email will be sent to reset password.
 *      tags: [Auth]
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - email
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *              example:
 *                email: fake@example.com
 *      responses:
 *        "204":
 *          description: No content
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * path:
 *  /auth/reset-password:
 *    post:
 *      summary: Reset password
 *      tags: [Auth]
 *      parameters:
 *        - in: query
 *          name: token
 *          required: true
 *          schema:
 *            type: string
 *          description: The reset password token
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *              properties:
 *                password:
 *                  type: string
 *                  format: password
 *                  minLength: 8
 *                  description: At least one number and one letter
 *              example:
 *                password: password1
 *      responses:
 *        "204":
 *          description: No content
 *        "401":
 *          description: Password reset failed
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *              example:
 *                code: 401
 *                message: Password reset failed
 */
