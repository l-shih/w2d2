const express = require("express");
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const app = express();

const PORT = process.env.PORT || 8080;


const urlDatabase = {
  "b2xVn2": {
    user_id:  "user1",
    url: "http://www.lighthouselabs.ca",
    shortURL: "b2xVn2"
  },
  "9sm5xK": {
    user_id:  "user1",
    url: "http://www.google.com",
    shortURL: "9sm5xK"
  }
};


const users = {
  "user1" : {
    id:       "user1",
    email:    "hello@nononon.com",
    password: bcrypt.hashSync("1234", 10)
  },
};


const statusLookup = {
  400 : {
    txt:  "Bad Request",
    img:  "https://httpstatusdogs.com/img/400.jpg",
  },
  404 : {
    txt:  "Not Found",
    img:  "https://httpstatusdogs.com/img/404.jpg",
  },
  403 : {
    txt:  "Forbidden",
    img:  "https://httpstatusdogs.com/img/403.jpg",
  }
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
  .find((key) => users[key]["email"] == email && bcrypt.compareSync(password, users[key]["password"]));
}


function urlsForUser(user_id) {
  var userSpecificData = [];

  for(var t in urlDatabase){
    if(urlDatabase[t].user_id===user_id){
      userSpecificData.push(urlDatabase[t]);
    }
  }
  return userSpecificData;

}


// CONFIGURATION (should be located before middlewares)
app.set("view engine", "ejs");
app.set('trust proxy', 1) // trust first proxy


// MIDDLEWARES
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))


// Defining a HTTP GET request on "/"
// Along with a callback fn that will handle the response
app.get("/", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_login");
  }

  var result = urlsForUser(req.session.user_id);
  res.render('urls_index', {urls: result, user_id: req.session.user_id, users: users[req.session.user_id]});

});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_login");
  }

  res.render('urls_new', {urls: urlDatabase, user_id: req.session.user_id, users: users[req.session.user_id]});

});


app.get("/urls", (req, res) => {
  var result = urlsForUser(req.session.user_id);
  res.render('urls_index', {urls: result, user_id: req.session.user_id, users: users[req.session.user_id]});

});


app.post("/urls", (req, res) => {

  const shortURL = urlRandomString();
  const longURL = req.body.longURL;
  const user_id = req.session.user_id;
  if (!longURL) {
    res.status(400);
    res.render("urls_error", {statNum: 400, status: statusLookup, statInfo: statusLookup[400]});
    return;
  } else {
    urlDatabase[shortURL] = {
      user_id:  user_id,
      url:      longURL,
      shortURL: shortURL
    };
    res.redirect("/urls/" + shortURL);
  };
});


// redirects to the actual webpage of the shortened URL, if it exists
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(404);
    res.render("urls_error", {statNum: 404, status: statusLookup, statInfo: statusLookup[404]});
    return;
  }

  res.redirect(urlDatabase[shortURL]["url"]);

});


// the edit page of the URL
app.get("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  const shortURL = req.params.id;

  if (!urlDatabase[shortURL]["shortURL"] || user !== urlDatabase[shortURL]["user_id"]) {
    res.status(400);
    res.render("urls_error", {statNum: 400, status: statusLookup, statInfo: statusLookup[400]});
    return;
  }

  res.render("urls_show", {shortURL: req.params.id, urls: urlDatabase, user_id: req.session.user_id, users: users[req.session.user_id]});

});


app.post("/urls/:id/delete", (req, res) => {
  const user = req.session.user_id;
  const deleteURL = req.params.id

  if (!urlDatabase[deleteURL]["url"] || user !== urlDatabase[deleteURL]["user_id"]) {
    res.status(400);
    res.render("urls_error", {statNum: 400, status: statusLookup, statInfo: statusLookup[400]});
    return;
  }

  delete urlDatabase[deleteURL];
  res.redirect("/urls");

});

app.post("/:id/update", (req, res) => {
  const updateShortURL = req.params.id
  if (!urlDatabase[updateShortURL]) {
    res.status(404);
    res.render("urls_error", {statNum: 404, status: statusLookup, statInfo: statusLookup[404]});
    return;
  }

  urlDatabase[updateShortURL]["url"] = req.body.editedLongURL;

  res.redirect("/urls");

});


app.get("/login", (req, res) => {
  res.render("urls_login");

});


app.post("/login", (req, res) => {
  const {email, password} = req.body
  if (!validateUser(email, password)) {
    res.status(403);
    res.render("urls_error", {statNum: 403, status: statusLookup, statInfo: statusLookup[403]});
  } else {
    req.session.user_id = validateUser(email, password);
    res.redirect("/");
  }

});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");

})


app.get("/register", (req, res) => {
  if (!req.session.user_id) {
    res.render("urls_register");
    return;
  }

  res.redirect("/urls");

});


app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const foundUser = findUsername(email);

  if (email.length === 0 || password.length === 0 || foundUser === true) {
    res.status(400);
    res.render("urls_error", {statNum: 400, status: statusLookup, statInfo: statusLookup[400]});

  } else {
    const userID = userRandomString();
    users[userID] = {
      id:       userID,
      email:    email,
      password: bcrypt.hashSync(password, 10)
    };

    req.session.user_id = userID;
    res.redirect("/urls");
  };


});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});