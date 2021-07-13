const express = require('express');
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const passport = require('passport');


router.get('/register', (req, res) => {
    res.render('user/register');
})


router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const {username, email, password} = req.body;
        const user = new User({username, email});
        const registeredUser = await User.register(user, password);
        req.logIn(registeredUser, err => {
            if (err) {
                return next(err);
            } else {
                req.flash('success', 'welcome to yelp camp');
                res.redirect('/campgrounds');
            }
        });

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}))

router.get('/login', (req, res) => {
    res.render('user/login');
})

router.post('/login', passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    console.log(redirectUrl);
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
})

module.exports = router;