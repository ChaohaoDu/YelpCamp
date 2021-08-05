if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();

const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');

const path = require('path');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// database + session
// ======================
const mongoose = require('mongoose');
const session = require('express-session');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require("connect-mongo");
const secret = process.env.SECRET || 'secret';
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

app.use(mongoSanitize({replaceWith: '_'}));

const store =  MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 3600,
    crypto: {
        secret: secret,

    }
});

app.use(session({
    secret: secret,
    store: store,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,      // a week later
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}));

store.on('error', function (e) {
    console.log("session store err", e);
})
// const sessionConfig = {
//     store,
//     secret: secret,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//         httpOnly: true,
//         expires: Date.now() + 1000 * 60 * 60 * 24 * 7,      // a week later
//         maxAge: 1000 * 60 * 60 * 24 * 7
//     }
// }

// app.use(session(sessionConfig));

// ======================
// ejs template
// ======================
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


// ======================
// passport
// ======================
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ======================
// flash
// ======================
const flash = require('connect-flash');

app.use(flash());
app.use((req, res, next) => {
    if (!['/login', '/'].includes(req.originalUrl)) {
        req.session.returnTo = req.originalUrl;
    }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// ======================
// router
// ======================
const campgroundsRoutes = require('./routes/campgrounds');
app.use('/campgrounds', campgroundsRoutes);

const reviewsRoutes = require('./routes/reviews');
app.use('/campgrounds/:id/reviews', reviewsRoutes);

const usersRoutes = require('./routes/users');
app.use('/', usersRoutes);

app.get('/', (req, res) => {
    res.render('./home')
});


app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})


// ======================
// error handler
// ======================
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', {err})
})


const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})


