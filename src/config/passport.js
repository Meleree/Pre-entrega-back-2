import passport from 'passport';
import local from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const LocalStrategy = local.Strategy;

passport.use(
  'login',
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user) return done(null, false, { message: 'Usuario no encontrado' });

        const isValid = user.isValidPassword(password);
        if (!isValid) return done(null, false, { message: 'Contraseña incorrecta' });

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  'jwt',
  new JwtStrategy(
    {
      secretOrKey: process.env.JWT_SECRET,
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.jwt || null,
      ]),
    },
    async (payload, done) => {
      try {
        return done(null, payload.user); 
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
