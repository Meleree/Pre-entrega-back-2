// src/config/passport.js
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';
import User from '../dao/models/user.model.js'; // <-- cambio aquí

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const cookieExtractor = (req) => {
  let token = null;
  if (req && req.signedCookies) token = req.signedCookies.currentUser;
  return token;
};

const options = {
  jwtFromRequest: cookieExtractor,
  secretOrKey: JWT_SECRET,
};

passport.use(
  'jwt',
  new JwtStrategy(options, async (payload, done) => {
    try {
      const user = await User.findById(payload.user.id);
      if (!user) return done(null, false);
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  })
);

export default passport;
