import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import userModel from '../models/user.model.js'

const configurePassport = () => {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findOne({ email: profile.emails[0].value })

            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id
                    user.isVerified = true
                    if (!user.avatar && profile.photos[0]?.value) {
                        user.avatar = profile.photos[0].value
                    }
                    await user.save()
                }
                return done(null, user)
            }

            user = await userModel.create({
                name: profile.displayName,
                email: profile.emails[0].value,
                googleId: profile.id,
                avatar: profile.photos[0]?.value || '',
                isVerified: true,
            })

            return done(null, user)
        } catch (err) {
            return done(err, null)
        }
    }))

    passport.serializeUser((user, done) => done(null, user._id))
    passport.deserializeUser(async (id, done) => {
        const user = await userModel.findById(id)
        done(null, user)
    })

    return passport
}

export default configurePassport