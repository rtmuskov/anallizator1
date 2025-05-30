// src/passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Users, UserInfo } = require('./models/models');
const bcrypt = require('bcrypt');

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.API_URL}/api/user/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            const email = profile.emails[0].value;
            let user = await Users.findOne({ where: { email } });

            if (!user) {
                user = await Users.create({
                    email,
                    password: await bcrypt.hash(email + 'google_secret', 5),
                    role: 'user'
                });
                await UserInfo.create({
                    userId: user.id,
                    firstName: profile.name.givenName || '',
                    lastName: profile.name.familyName || ''
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }
));

module.exports = passport;
