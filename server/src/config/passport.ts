import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy, type Profile } from 'passport-google-oauth20';
import bcrypt from 'bcryptjs';
import { User } from '../models/user';
import { config } from './env';

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user || !user.passwordHash) {
        return done(null, false);
      }

      const passwordOk = await bcrypt.compare(password, user.passwordHash);
      if (!passwordOk) {
        return done(null, false);
      }

      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  })
);

passport.use(
  new GoogleStrategy(
    {
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl
    },
    async (_accessToken: string, _refreshToken: string, profile: Profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        const displayName = profile.displayName || 'google-user';

        let user = await User.findOne({ googleId: profile.id });

        if (!user && email) {
          user = await User.findOne({ email });

          if (user) {
            user.googleId = profile.id;
            await user.save();
          }
        }

        if (!user) {
          user = await User.create({
            username: displayName,
            email,
            googleId: profile.id
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export { passport };
