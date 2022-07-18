//! dotenv must be in the top of the app.js
require('dotenv').config()
const express = require("express");
const app = express();
const ejs = require("ejs");
const mongoose = require("mongoose");
// md5 is a hash function to use it for the password
const md5 = require("md5");
const { Schema } = mongoose;
const { model } = mongoose;
// npm package to encrypt data in DB.
//? const encrypt = require("mongoose-encryption");
const port = 3000;

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/userDB");
const userSchema = new Schema({
    email: String,
    password: String
});

// encryption key => moved into .env file
// const secret = "ThisMyLittleSecret.";

// it must be added before we create our mongoose model
// encryptedFields to encrypt the pw only
// process.env.SECRET to get access to our "environment variables"
// we put in .gitignore file so we don't upload sensitive data to public.
// when deploying the app, platfroms have some ways to handle it like heroku config-vars
//? userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new model("User", userSchema);



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
        const username = req.body.username;
        const password = md5(req.body.password); // hashing password
        // mongo will decrypt the pw to use it here
        User.findOne({ email: username }, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    // rendering secrets only if user is already registred and typed the correct password
                    if (foundUser.password === password) {
                        res.render("secrets");
                    }
                }
            }
        });
    });

app.route("/register")
    .get((req, res) => {
        res.render("register")
    })
    .post((req, res) => {
        const newUser = new User({
            email: req.body.username,
            password: md5(req.body.password) // hashing pw
        });
        // mongo will encrypt the pw when saving it to DB
        newUser.save((err) => {
            if (err) { console.log(err); }
            // rendering secrets only if user is registred or loged in.
            else { res.render("secrets") }
        });
    });




app.listen(port, () => console.log("Server is running on port 3000."));