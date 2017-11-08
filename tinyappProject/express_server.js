const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080;
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

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
  res.render('urls_index', {urls: urlDatabase});
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
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
    return
  }

  res.render("urls_show", {shortURL: req.params.id, urls: urlDatabase});
});


app.post("/urls/:id/delete", (req, res) => {
  const deleteURL = req.params.id
  if (!urlDatabase[deleteURL]) {
    res.sendStatus(400);
    return
  }

  delete urlDatabase[deleteURL];
  console.log(urlDatabase);
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

