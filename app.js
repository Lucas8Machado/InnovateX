const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongooose = require("passport-local-mongoose");

const homeStartingContent = "Welcome to Lucas Machado's Startup Blog, your ultimate destination for all things startup-related! Whether you're an aspiring entrepreneur or a seasoned founder, our blog is a treasure trove of valuable insights, inspirational stories, and industry trends. Join our vibrant community and dive into a world of startup spotlights, idea showcases, and growth strategies. Stay up-to-date with the latest happenings in the startup ecosystem and connect with like-minded individuals. Let's embark on this exciting journey together, as we empower each other to bring our innovative visions to life and make a lasting impact on the world. Welcome aboard!";
const aboutContent = "Welcome to Lucas Machado's Startup Blog, your ultimate destination for all things startup-related! Whether you're an aspiring entrepreneur or a seasoned founder, our blog is a treasure trove of valuable insights, inspirational stories, and industry trends.Join our vibrant community and dive into a world of startup spotlights, idea showcases, and growth strategies.Stay up - to - date with the latest happenings in the startup ecosystem and connect with like - minded individuals.Let's embark on this exciting journey together, as we empower each other to bring our innovative visions to life and make a lasting impact on the world. Welcome aboard.";
const contactContent = "If you have any questions, feedback, or would like to collaborate, don't hesitate to reach out to us. We value your input and look forward to hearing from you! You can contact us via email at lucasm@gmail.com. Whether you want to share your startup story, suggest a topic, or simply say hello, we're here and eager to connect with fellow entrepreneurs and startup enthusiasts.Let's stay connected and continue to build a thriving community together!";

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "This is our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// Mongoose connection and schema setup
(async () => {
  try {
    await mongoose.connect("mongodb+srv://LucasM:c1knbRPEa0eRwLcx@cluster0.eorhtdd.mongodb.net/InnovateXDB?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    app.listen(3000, function () {
      console.log("Server started on port 3000");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB Server", err);
  }
})();

// Mongoose schema
const userSchema = new mongoose.Schema({
  name: String,
  body: String,
  email: String,
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongooose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", async (req, res) => {
  try {
    const fetchedItems = await User.find({});
    res.render("home.ejs", { StartingContent: homeStartingContent, posts: fetchedItems })
  } catch (error) {
    console.log("Error fetching items:", error);
    res.status(500).send("Error fetching items from the database");
  }
});

app.get("/about", (req, res) => {
  res.render("about.ejs", { aboutContent: aboutContent })
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs", { contactContent: contactContent })
});

app.get("/compose", (req, res) => {
  res.render("compose.ejs")
});

app.post("/compose", async (req, res) => {
  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  try {
    const newPost = new User({
      name: postTitle,
      body: postBody
    });

    await newPost.save();
    res.redirect("/");
  } catch (err) {
    console.log("Failed to add new post to the database (Post) (compose) method");
  }
});

app.get("/posts/:postId", async (req, res) => {
  const requestedPostId = req.params.postId;

  try {
    const post = await User.findOne({ _id: requestedPostId });
    if (post) {
      const title = post.name;
      const content = post.body;
      res.render("post.ejs", { title: title, content: content });
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    console.log("Error fetching the post:", error);
    res.status(500).send("Error fetching the post from the database");
  }
});


app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/successfullyRegisterd", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("successfullyRegisterd.ejs")
  } else {
    res.redirect("/login")
  }
});

app.get("/successfullyLoggedIn", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("successfulLogin.ejs")
  } else {
    res.redirect("/login")
  }
});

app.post("/register", (req, res) => {
  console.log(`Username: ${req.body.username}`);
  console.log(`Password: ${req.body.password}`);
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/successfullyRegisterd")
      });
    }
  })
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function (err) {
    if (err) {
      // Handle login error
      res.redirect("/login");
    } else {
      // Authentication succeeded
      passport.authenticate("local", function (err, user, info) {
        if (err || !user) {
          // Failed authentication
          res.redirect("/login"); // Redirect to login page if authentication fails
        } else {
          // Successful authentication
          res.redirect("/successfullyLoggedIn");
        }
      })(req, res);
    }
  });
});


app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      res.redirect("/login")
    }
    res.redirect("/");
  });
});////
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongooose = require("passport-local-mongoose");

const homeStartingContent = "Welcome to Lucas Machado's Startup Blog, your ultimate destination for all things startup-related! Whether you're an aspiring entrepreneur or a seasoned founder, our blog is a treasure trove of valuable insights, inspirational stories, and industry trends. Join our vibrant community and dive into a world of startup spotlights, idea showcases, and growth strategies. Stay up-to-date with the latest happenings in the startup ecosystem and connect with like-minded individuals. Let's embark on this exciting journey together, as we empower each other to bring our innovative visions to life and make a lasting impact on the world. Welcome aboard!";
const aboutContent = "Welcome to Lucas Machado's Startup Blog, your ultimate destination for all things startup-related! Whether you're an aspiring entrepreneur or a seasoned founder, our blog is a treasure trove of valuable insights, inspirational stories, and industry trends.Join our vibrant community and dive into a world of startup spotlights, idea showcases, and growth strategies.Stay up - to - date with the latest happenings in the startup ecosystem and connect with like - minded individuals.Let's embark on this exciting journey together, as we empower each other to bring our innovative visions to life and make a lasting impact on the world. Welcome aboard.";
const contactContent = "If you have any questions, feedback, or would like to collaborate, don't hesitate to reach out to us. We value your input and look forward to hearing from you! You can contact us via email at lucasm@gmail.com. Whether you want to share your startup story, suggest a topic, or simply say hello, we're here and eager to connect with fellow entrepreneurs and startup enthusiasts.Let's stay connected and continue to build a thriving community together!";

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: "This is our little secret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


// Mongoose connection and schema setup
(async () => {
  try {
    await mongoose.connect("mongodb+srv://LucasM:c1knbRPEa0eRwLcx@cluster0.eorhtdd.mongodb.net/InnovateXDB?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
    app.listen(3000, function () {
      console.log("Server started on port 3000");
    });
  } catch (err) {
    console.error("Error connecting to MongoDB Server", err);
  }
})();

// Mongoose schema
const userSchema = new mongoose.Schema({
  name: String,
  body: String,
  email: String,
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongooose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get("/", async (req, res) => {
  try {
    const fetchedItems = await User.find({});
    res.render("home.ejs", { StartingContent: homeStartingContent, posts: fetchedItems })
  } catch (error) {
    console.log("Error fetching items:", error);
    res.status(500).send("Error fetching items from the database");
  }
});

app.get("/about", (req, res) => {
  res.render("about.ejs", { aboutContent: aboutContent })
});

app.get("/contact", (req, res) => {
  res.render("contact.ejs", { contactContent: contactContent })
});

app.get("/compose", (req, res) => {
  res.render("compose.ejs")
});

app.post("/compose", async (req, res) => {
  const postTitle = req.body.postTitle;
  const postBody = req.body.postBody;

  try {
    const newPost = new User({
      name: postTitle,
      body: postBody
    });

    await newPost.save();
    res.redirect("/");
  } catch (err) {
    console.log("Failed to add new post to the database (Post) (compose) method");
  }
});

app.get("/posts/:postId", async (req, res) => {
  const requestedPostId = req.params.postId;

  try {
    const post = await User.findOne({ _id: requestedPostId });
    if (post) {
      const title = post.name;
      const content = post.body;
      res.render("post.ejs", { title: title, content: content });
    } else {
      res.status(404).send("Post not found");
    }
  } catch (error) {
    console.log("Error fetching the post:", error);
    res.status(500).send("Error fetching the post from the database");
  }
});


app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/successfullyRegisterd", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("successfullyRegisterd.ejs")
  } else {
    res.redirect("/login")
  }
});

app.get("/successfullyLoggedIn", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("successfulLogin.ejs")
  } else {
    res.redirect("/login")
  }
});

app.post("/register", (req, res) => {
  console.log(`Username: ${req.body.username}`);
  console.log(`Password: ${req.body.password}`);
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/successfullyRegisterd")
      });
    }
  })
});

app.post("/login", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function (err) {
    if (err) {
      // Handle login error
      res.redirect("/login");
    } else {
      // Authentication succeeded
      passport.authenticate("local", function (err, user, info) {
        if (err || !user) {
          // Failed authentication
          res.redirect("/login"); // Redirect to login page if authentication fails
        } else {
          // Successful authentication
          res.redirect("/successfullyLoggedIn");
        }
      })(req, res);
    }
  });
});


app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      res.redirect("/login")
    }
    res.redirect("/");
  });
});
