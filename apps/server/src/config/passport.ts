import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { UserService } from '../services/UserService.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
      callbackURL: '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const userService = new UserService();
        
        // Check if user exists by oauthId
        let user = await userService.findByOAuthId('google', profile.id);
        
        if (!user) {
          // Check if user exists by email
          const email = profile.emails?.[0]?.value;
          if (email) {
            user = await userService.findByEmail(email);
            if (user) {
              // Link account
              user = await userService.update(user._id as string, { 
                oauthProvider: 'google', 
                oauthId: profile.id 
              });
            }
          }
          
          if (!user) {
            // Create placeholder user
            user = await userService.createFromOAuth(profile);
          }
        }
        
        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
