import { Router } from 'express';
import { login, callback, revokeToken } from '../controllers/authController';
import asyncHandler from '../utils/asyncHandler';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiates Google OAuth authentication
 *     description: Redirects the user to Google OAuth for authentication.
 *     tags:
 *       - Authentication
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth
 */
router.get('/google', login);

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google OAuth callback
 *     description: Handles the callback from Google OAuth and generates a JWT token.
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successful authentication
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: JWT token
 *       401:
 *         description: Unauthorized
 */
router.get('/google/callback', asyncHandler(callback));

/**
 * @swagger
 * /auth/revoke:
 *   post:
 *     summary: Revoke a token
 *     description: Revokes a JWT token.
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The JWT token to revoke
 *     responses:
 *       200:
 *         description: Token revoked successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post('/revoke', authMiddleware, asyncHandler(revokeToken));

export default router;