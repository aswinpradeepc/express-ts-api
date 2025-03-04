import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

export const login = (req: Request, res: Response) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&scope=openid%20email%20profile`;
  // res.json({ auth_url: redirectUri });
};

export const callback = async (req: Request, res: Response) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ success: false, message: 'Authorization code is missing' });
  }

  try {
    const { tokens } = await client.getToken({
      code: code as string,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    });

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


