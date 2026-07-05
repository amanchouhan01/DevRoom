import 'dotenv/config'
import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import aiRoutes from './routes/ai.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import configurePassport from './config/passport.js'
import session from 'express-session'
import authRoutes from './routes/auth.routes.js'


connect();


const app = express();
const passport = configurePassport()

app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    next();
});

app.use(cors());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);

app.use('/newsletter', newsletterRoutes)


app.use(session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use('/auth', authRoutes)


app.get('/', (req, res) => { res.send('Hello World!') });



export default app;