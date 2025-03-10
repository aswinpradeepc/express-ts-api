import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const login = (req: Request, res: Response) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile`;
  // res.redirect(redirectUri);
  res.json({auth_url: redirectUri });
};

export const callback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Authorization code is missing' });
  }

  try {
    const client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    const tokenResponse = await client.getToken({
      code: code as string,
    });

    const tokens = tokenResponse.tokens;

    if (!tokens.id_token) {
      return res.status(400).json({ success: false, message: 'Failed to retrieve ID token' });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      return res.status(400).json({ success: false, message: 'Invalid Google token' });
    }

    let user = await User.findOne({ providerId: payload.sub });
    if (!user) {
      user = new User({
        providerId: payload.sub,
        email: payload.email,
        name: payload.name,
        provider: 'google',
      });

      try {
        await user.save();
      } catch (dbError) {
        console.error('Database save error:', dbError);
        return res.status(500).json({ success: false, message: 'Failed to create user' });
      }
    } 

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server misconfiguration' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Store the token in the user's tokens array
    user.tokens.push({
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    });

    await user.save();

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

export const revokeToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token is required' });
  }

  try {
    const user = await User.findOne({ 'tokens.token': token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    user.tokens = user.tokens.filter(t => t.token !== token);
    await user.save();

    res.json({ message: 'Token revoked successfully' });
  } catch (error) {
    console.error('Revoke token error:', error);
    res.status(500).json({ message: 'Failed to revoke token' });
  }
};