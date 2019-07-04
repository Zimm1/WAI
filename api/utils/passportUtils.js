const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const model = require('../model');

function initPassport() {
    passport.use(new LocalStrategy(
        function (username, password, done) {
            model.user.findOne({ username }).then((user) => {
                if (!user) {
                    return done(null, false, {
                        message: 'User not found'
                    });
                }

                if (!user.checkPassword(password)) {
                    return done(null, false, {
                        message: 'Password is wrong'
                    });
                }

                done(null, user);
            }).catch((e) => {
                done(e);
            });
        }
    ));

    return passport.initialize();
}

module.exports = {
    initPassport
};