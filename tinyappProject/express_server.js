const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 8080;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "user1" : {
    id:       "user1",
    email:    "hello@nononon.com",
    password: "supBroski"
  },
};

function urlRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function userRandomString() {
  return Math.random().toString(36).substr(2, 4);
}

// CONFIGURATION (should be before middlewares)
app.set("view engine", "ejs");

// MIDDLEWARES
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


// Defining a HTTP GET request on "/"
// Along with a callback fn that will handle the response
app.get("/", (req, res) => {
  res.end("Hello!");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});


app.get("/urls", (req, res) => {
  res.render('urls_index', {urls: urlDatabase, username: req.cookies["username"]});
});


app.post("/urls", (req, res) => {
  const shortURL = urlRandomString();
  const longURL = req.body.longURL;
  if (!longURL) {
    res.sendStatus(400);
    return;
  }

  urlDatabase[shortURL] = longURL;
  res.redirect("/urls/" + shortURL);

});


app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.sendStatus(404);
    return;
  }

  res.redirect(urlDatabase[shortURL]);

});


app.get("/urls/:id", (req, res) => {
  const iD = req.params.id
  if (!urlDatabase[iD]) {
    res.sendStatus(400);
    return;
  }

  res.render("urls_show", {shortURL: req.params.id, urls: urlDatabase, username: req.cookies["username"]});
});


app.post("/urls/:id/delete", (req, res) => {
  const deleteURL = req.params.id
  if (!urlDatabase[deleteURL]) {
    res.sendStatus(400);
    return;
  }

  delete urlDatabase[deleteURL];
  res.redirect("/urls");
});

app.post("/:id/update", (req, res) => {
  const updateURL = req.params.id
  if (!urlDatabase[updateURL]) {
    res.sendStatus(404);
    return;
  }

  urlDatabase[updateURL] = req.body.editedLongURL;
  res.redirect("/urls");
});


app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});


app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})


app.get("/register", (req, res) => {
  res.render("urls_register");
});


app.post("/register", (req, res) => {
  const userID = userRandomString();
  users[userID] = {
    id:       userID,
    email:    req.body.email,
    password: req.body.password
  }

  console.log(users);

  res.cookie("user_id", userID);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

