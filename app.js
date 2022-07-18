//! dotenv must be in the top of the app.js
require('dotenv').config()
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");

//! to use cookies (saving browsing sessions):
const session = require("express-session");
//! passport hash and salt the pw automatically in the process
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//! md5 is a hash function to use it for the password
// const md5 = require("md5");


const { Schema } = mongoose;
const { model } = mongoose;
// npm package to encrypt data in DB.
// const encrypt = require("mongoose-encryption");
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// must be above mongoose.connect and below this lines (body-parser, static-folder, view-engine)
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new Schema({
    email: String,
    password: String
});
// below mongoose schema
userSchema.plugin(passportLocalMongoose);

// encryption key => moved into .env file
// const secret = "ThisMyLittleSecret.";

// it must be added before we create our mongoose model
// encryptedFields to encrypt the pw only
// process.env.SECRET to get access to our "environment variables"
// we put in .gitignore file so we don't upload sensitive data to public.
// when deploying the app, platfroms have some ways to handle it like heroku config-vars
// userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new model("User", userSchema);

//  below our mongoose model
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser()); // create the cookie and stuff the message
passport.deserializeUser(User.deserializeUser()); // crumble the cookie and discover the message inside

app.route("/")
    .get((req, res) => {
        res.render("home")
    })
    .post((req, res) => {

    });


app.route("/login")
    .get((req, res) => {
        res.render("login")
    })
    .post((req, res) => {
        // const username = req.body.username;
        // const password = req.body.password
        // // mongo will decrypt the pw to use it here
        // User.findOne({ email: username }, (err, foundUser) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         if (foundUser) {
        //             // rendering secrets only if user is already registred and typed the correct password
        //             if (foundUser.password === password) {
        //                 res.render("secrets");
        //             }
        //         }
        //     }
        // });
        //? Using passport:
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });

        req.login(user, (err) => {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets")
                });
            }
        });
    });



app.route("/secrets")
    .get((req, res) => {
        if (req.isAuthenticated()) {
            res.render("secrets");
        } else {
            res.redirect("/login");
        }
    });


app.route("/register")
    .get((req, res) => {
        res.render("register")
    })
    .post((req, res) => {
        // const newUser = new User({
        //     email: req.body.username,
        //     password: md5(req.body.password) //? to hash the pw
        // });
        //?   mongo will encrypt the pw when saving it to DB
        // newUser.save((err) => {
        //     if (err) { console.log(err); }
        //?      rendering secrets only if user is registred or loged in.
        //     else { res.render("secrets") }
        // });
        //? register from passport-local-mongoose package
        User.register({ username: req.body.username }, req.body.password, (err, user) => {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                passport.authenticate("local")(req, res, () => {
                    res.redirect("/secrets")
                });
            }
        });

    });


app.route("/logout")
    .get((req, res) => {
        //passport method:
        req.logout((err) => {
            if (err) {
                console.log(err);
            }
            res.redirect("/");
        });

    });


app.listen(port, () => console.log("Server is running on port 3000."));