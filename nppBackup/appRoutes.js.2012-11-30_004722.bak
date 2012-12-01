var User = require('./User');

module.exports = function (app) {

    app.post('/db/root/users', function(req, res){
        if (!(req.user && req.user.superuser)){
            res.status(401);
        }
        else {
            User.find({}, 'username superuser msg registeredTimestamp lastLoginTimestamp ' +
                           'lastIp lastHost lastUserAgent lastMsgTimestamp', 
                function(err, users){
                    if (err)
                        res.send(err);
                    else
                        res.send(users);
            });
        }
    });

    app.post('/db/users', function(req, res){
        if (!req.user){
            res.status(401);
        }
        else {
            User.find({}, 'username msg', 
                {   sort:[['lastMsgTimestamp',-1]],
                    limit: 10
                },
                function(err, users){
                    if (err)
                        res.send(err);
                    else
                        res.send(users);
            });
        }
    });

    app.post('/db/me/setMsg', function(req, res){
        req.user.msg = req.body.msg;
        req.user.lastMsgTimestamp = new Date();
        req.user.save();
        res.send();
    });
}
