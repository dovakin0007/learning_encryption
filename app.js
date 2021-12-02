require("dotenv").config()
const express = require('express');
const mongoose = require('mongoose');
const bodyparser = require('body-parser');
const ejs = require('ejs');
const md5 = require('md5');
const encryption = require('mongoose-encryption');
const bcrypt = require('bcrypt');
const saltrounds = 10
app = new express();
app.use(bodyparser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/usersDB");

NewSchema = mongoose.Schema;

Schema = new NewSchema({
    emailid: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});



const User = mongoose.model("User", Schema)

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get("/register", (req, res) => {
    res.render('register');
})

app.post("/register", (req, res) => {
    bcrypt.hash(req.body.password, saltrounds, function(err, hash) {
        const NewUser = new User({
            emailid: req.body.username,
            password: hash
        })
        NewUser.save((err) => {
            try {
                res.render("secrets");
            } catch {
                console.log(err)
            }
        });
    });
});

app.post('/login', (req, res) => {
    const email = req.body.username;
    const password = req.body.password;


    User.findOne({ email: email }, function(err, user) {

        try {
            bcrypt.compare(password, user.password, function(err, result) {
                if (result === true) {
                    res.render("secrets")
                } else {
                    console.log("password mismatch")
                }
            });
        } catch {
            console.log(err);
        }
    });
});

app.listen("3000", () => {
    console.log("Server running on port 3000");
});