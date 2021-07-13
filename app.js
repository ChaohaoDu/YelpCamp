const express = require('express');
const app = express();

const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');

const path = require('path');
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));


// ======================
// database stuff
// ======================
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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

// ======================
// ejs template
// ======================
const ejsMate = require('ejs-mate');
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


// ======================
// session
// ======================
const session = require('express-session');
const sessionConfig = {
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,      // a week later
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));


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


app.get('/fakeuser', async (req, res) => {
    const user = new User({
        email: 'gmail@gmail.com',
        username: 'ryan'
    });

    const newUser = await User.register(user, 'chicken');
    res.send(newUser);
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
    res.render('home')
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

app.listen(3000, () => {
    console.log('Serving on port 3000')
})


