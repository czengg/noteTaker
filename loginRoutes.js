var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy
  , util = require("util");

passport.use(new GoogleStrategy( {
    consumerSecret: "cCA5UQ1Az2veuQrWpAE6cEsa",
    consumerKey: "125403324444.apps.googleusercontent.com",
    callbackURL: "http://localhost:8080/auth/google/callback",
    returnURL: "http://localhost:8080/index.html",
    realm: "http://localhost:8080/"
  },
  function(identifier, profile, done) {

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));

var User = require('./User');

module.exports = function (app) {
    
	app.get('/auth/google', passport.authenticate('google'));
	
	app.get('/auth/google/return', 
	passport.authenticate('google', { successRedirect: '/',
                                      failureRedirect: '/login' }));
									  
	app.get('/auth/google/return', function(req, res, next) {
	passport.authenticate('google', function(err, user, info) {
		if (err) { return next(err); }
		if (!user) { return res.redirect('/login'); }
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			var username = user.username;
			
			//google sends back unique identifiers so no two usernames will be the same
			User.findOne({username : username }, function(err, existingUser) {
            if (err){
                return res.send({'err': err});
            }
			
            if (existingUser) {
                existingUser.lastUserAgent = req.headers['user-agent'];
				existingUser.lastIp = req.ip;
				existingUser.lastHost = req.host;
				existingUser.lastLoginTimestamp = new Date();
				existingUser.save();
				return res.send('success');
            }

            else {
			user.lastUserAgent = req.headers['user-agent'];
			user.lastIp = req.ip;
			user.lastHost = req.host;
			user.lastLoginTimestamp = new Date();
            user.registeredTimestamp = new Date();
            user.save(); 
			}
        });
		});
		})(req, res, next);
	});

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
}
