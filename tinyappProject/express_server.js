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
    password: "1234"
  },
};

function urlRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

function userRandomString() {
  return Math.random().toString(36).substr(2, 4);
}

function findUsername(email) {
  return Object.keys(users)
  .filter((key) => {return users[key]["email"] === email}).length > 0;

}


function validateUser(email, password) {
  return Object.keys(users)
  .find((key) => users[key]["email"] == email && users[key]["password"] == password);
}

// CONFIGURATION (should be located before middlewares)
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
  if(req.cookies["user_id"] === 'user1'){
    console.log('I am logged in');
  }
  res.render('urls_index', {urls: urlDatabase, username: req.cookies["username"], user_id: req.cookies["user_id"], users: users[req.cookies["user_id"]]});
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

  res.render("urls_show", {shortURL: req.params.id, urls: urlDatabase, user_id: req.cookies["user_id"], users: users[req.cookies["user_id"]]});

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


app.get("/toLogin", (req, res) => {
  res.render("urls_login");

});


app.post("/login", (req, res) => {
  const {email, password} = req.body
  if (!validateUser(email, password)) {
    res.sendStatus(403);
  } else {
    console.log('i am before ' + validateUser(email, password));
    res.cookie("user_id", validateUser(email, password));
    res.redirect("/");
  }

});


app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");

})


app.get("/register", (req, res) => {
  res.render("urls_register");

});


app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const foundUser = findUsername(email);

  if (email.length === 0 || password.length === 0 || foundUser === true) {
    res.sendStatus(400);
    return;
  } else {
    const userID = userRandomString();
    users[userID] = {
      id:       userID,
      email:    email,
      password: password
    };

    res.cookie("user_id", userID);
    res.redirect("/urls");
  };

  //console.log(users);


});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

