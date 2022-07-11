const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const teamValidation = require('../../validations/team.validation');
const teamController = require('../../controllers/team.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(teamValidation.createTeam), teamController.createTeam);

router
  .route('/set-active-team')
  .post(auth(), validate(teamValidation.setActiveTeam), teamController.setActiveTeam);

router
  .route('/:teamId')
  .get(auth('getTeam'), validate(teamValidation.getTeam), teamController.getTeam)
  .post(auth('getTeam'), validate(teamValidation.leaveTeam), teamController.leaveTeam)
  .patch(auth('manageTeam'), validate(teamValidation.updateTeam), teamController.updateTeam)
  .delete(auth('deleteTeam'), validate(teamValidation.deleteTeam), teamController.deleteTeam);

router
  .route('/:teamId/invitation')
  .post(auth('manageTeam'), validate(teamValidation.createInvitation), teamController.createInvitation)

router
  .route('/:teamId/invitation/:invitationId')
  .get(auth(), validate(teamValidation.getInvitation), teamController.getInvitation)
  .post(auth(), validate(teamValidation.handleInvitation), teamController.handleInvitation)
  .delete(auth('manageTeam'), validate(teamValidation.deleteInvitation), teamController.deleteInvitation);

router
  .route('/:teamId/user/:userId')
  .patch(auth('manageTeam'), validate(teamValidation.updateUser), teamController.updateUser)
  .delete(auth('manageTeam'), validate(teamValidation.deleteUser), teamController.deleteUser);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Team
 *   description: Team management and retrieval
 */

/**
 * @swagger
 * path:
 *  /team:
 *    post:
 *      summary: Create a team
 *      description: Only logged in users can create a team.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *              properties:
 *                name:
 *                  type: string
 *              example:
 *                name: fake team
 *      responses:
 *        "201":
 *          description: Created
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/User'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * path:
 *  /team/set-active-team:
 *    post:
 *      summary: Set active team
 *      description: Only logged in users can set a team active whch they are a part of.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - teamId
 *              properties:
 *                teamId:
 *                  type: string
 *              example:
 *                teamId: hbGciOiJIUzI1NiIsInR5cCI
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/User'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * path:
 *  /team/{id}:
 *    get:
 *      summary: Get a team
 *      description: Logged in users can only fetch teams they are a part of.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Team'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    post:
 *      summary: Leave a team
 *      description: Logged in users can only leave teams they are a part of. Team owners cannot leve their teams.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
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
 *                  team:
 *                    $ref: '#/components/schemas/Team'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    patch:
 *      summary: Update a team
 *      description: Logged in users can only update teams they are a part of as an Admin or an Owner.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
 *                  type: string
 *              example:
 *                name: fake team
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
 *                  team:
 *                    $ref: '#/components/schemas/Team'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *
 *    delete:
 *      summary: Delete a team
 *      description: Logged in users can delete teams they are a part of as an Owner.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/User'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * path:
 *  /team/{id}/invitation:
 *    post:
 *      summary: Create an invitation
 *      description: Logged in users can only create invitations for teams they are a part of as an Admin or an Owner.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *                  format: email
 *                role:
 *                   type: string
 *                   enum: [teamUser, teamAdmin]
 *              example:
 *                email: fake@example.com
 *                password: teamAdmin
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Team'
 *        "400":
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/Error'
 *              examples:
 *                EmailServerFailure:
 *                  value:
 *                    code: 400
 *                    message: Unable to send invitation email
 *                DuplicateTeamEmail:
 *                  value:
 *                    code: 400
 *                    message: Email is already a part of the team
 *                DuplicateInvitationEmail:
 *                  value:
 *                    code: 400
 *                    message: Invitation has already been sent to this email 
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

 /**
 * @swagger
 * path:
 *  /team/{id}/invitation/{invitationId}:
 *    get:
 *      summary: Get an invitation
 *      description: Logged in users can only get invitations meant for them.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
 *        - in: path
 *          name: invitationId
 *          required: true
 *          schema:
 *            type: string
 *          description: Invitation id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  teamName:
 *                    type: string
 *                  invitation:
 *                    $ref: '#/components/schemas/Invitation'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *    post:
 *      summary: Hanlde an invitation
 *      description: Logged in users can only handle invitations meant for them.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
 *        - in: path
 *          name: invitationId
 *          required: true
 *          schema:
 *            type: string
 *          description: Invitation id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                accepted:
 *                  type: boolean
 *              example:
 *                accepted: true
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/User'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *    delete:
 *      summary: Delete an invitation
 *      description: Logged in users can only delete invitations for teams they are a part of as an Admin or an Owner.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
 *        - in: path
 *          name: invitationId
 *          required: true
 *          schema:
 *            type: string
 *          description: Invitation id
 *      responses:
 *        "200":
 *          description: OK
 *          content:
 *            application/json:
 *              schema:
 *                 $ref: '#/components/schemas/Team'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */

  /**
 * @swagger
 * path:
 *  /team/{id}/invitation/{userId}:
 *    patch:
 *      summary: Update a team user
 *      description: Logged in users can only update users for teams they are a part of as an Admin or an Owner. Team Owner cannot be updated.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
 *        - in: path
 *          name: userId
 *          required: true
 *          schema:
 *            type: string
 *          description: User id
 *      requestBody:
 *        required: true
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                role:
 *                  type: string
 *                  enum: [teamUser, teamAdmin]
 *              example:
 *                role: teamUser
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
 *                  team:
 *                    $ref: '#/components/schemas/Team'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 *    delete:
 *      summary: Delete a team user
 *      description: Logged in users can only delete users for teams they are a part of as an Admin or an Owner. Team owner cannot be deleted.
 *      tags: [Team]
 *      security:
 *        - bearerAuth: []
 *      parameters:
 *        - in: path
 *          name: id
 *          required: true
 *          schema:
 *            type: string
 *          description: Team id
 *        - in: path
 *          name: userId
 *          required: true
 *          schema:
 *            type: string
 *          description: User id
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
 *                  team:
 *                    $ref: '#/components/schemas/Team'
 *        "401":
 *          $ref: '#/components/responses/Unauthorized'
 *        "403":
 *          $ref: '#/components/responses/Forbidden'
 *        "404":
 *          $ref: '#/components/responses/NotFound'
 */