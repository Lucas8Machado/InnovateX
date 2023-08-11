require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const findOrCreate = require("mongoose-findorcreate");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: true
    //cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

(async () => {
    try {
        await mongoose.connect("mongodb+srv://LucasM:c1knbRPEa0eRwLcx@cluster0.eorhtdd.mongodb.net/Secrets_DB?retryWrites=true&w=majority", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log("Connected to MongoDB Server ");
    } catch (error) {
        console.log("Error connecting to MongoDB Server", error);
    }
})();


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id).exec();
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    passReqToCallback: true
},
    function (request, accessToken, refreshToken, profile, done) {
        console.log(profile)
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return done(err, user);
        });
    }
));


app.get("/", (req, res) => {
    res.render("home.ejs");
});

app.get("/auth/google", passport.authenticate("google", {
    scope: ['profile']
}));


app.get('/auth/google/secrets',
    passport.authenticate('google', {
        successRedirect: '/secrets',
        failureRedirect: '/login'
    }));

app.get("/login", (req, res) => {
    res.render("login.ejs");
});

app.get("/register", (req, res) => {
    res.render("register.ejs")
});

app.get("/secrets", async (req, res) => {
    const foundUsers = await User.find({ "secret": { $ne: null } })
    res.render("secrets.ejs", { usersWithSecrets: foundUsers })
});

app.get("/submit", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("submit.ejs")
    } else {
        res.redirect("/login")
    }
});

app.post("/submit", async (req, res) => {
    const submittedSecret = req.body.secret;
    try {
        const foundUser = await User.findById(req.user.id);
        if (foundUser) {
            foundUser.secret = submittedSecret;
            await foundUser.save();
            res.redirect('/secrets');
        }
    } catch (err) {
        console.log(err);
    }
});

app.post("/register", async (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            });
        }
    });
});



app.post("/login", passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/register"
}));

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
});


app.listen(port, () => {
    console.log(`Server started on port ${port}.`);
});


