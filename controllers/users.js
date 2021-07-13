const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('user/register');
}


module.exports.register = async (req, res, next) => {
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
};


module.exports.renderLogin = (req, res) => {
    res.render('user/login');
}

module.exports.login = (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/campgrounds';
    console.log(redirectUrl);
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
};


module.exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}