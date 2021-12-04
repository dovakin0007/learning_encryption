require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session')
const passport = require('passport');
const passportlocalmongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');
app = new express();
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));
app.use(session({
    secret: 'lifesuck',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
mongoose.connect("mongodb://localhost:27017/usersDB");

NewSchema = mongoose.Schema;

Schema = new NewSchema({
    username: String,
    password: String,
    googleId: String
});
Schema.plugin(passportlocalmongoose);
Schema.plugin(findOrCreate);


const User = mongoose.model("User", Schema);
passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});
passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function(err, user) {
            return cb(err, user);
        });
    }
));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get("/register", (req, res) => {
    res.render('register');
});

app.get("/secrets", (req, res) => {
    if (req.isAuthenticated()) {
        res.render('secrets');
    } else {
        res.redirect("/login")
    }

});
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {

        res.redirect('/secrets');
    });


app.post("/register", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err)
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function() {
                res.redirect("/secrets")
            })
        }
    });


});

app.post('/login', (req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password

    });
    req.login(user, function(err) {
        try {
            passport.authenticate("local")(req, res, function(err) {
                res.redirect("/secrets");

            })

        } catch {
            console.log(err);
        }
    });

});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect("/login");
});


app.listen("3000", () => {
    console.log("Server running on port 3000");
});