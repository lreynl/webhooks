// index.js

/**
 * Required External Modules
 */
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
/**
 * App Variables
 */
const app = express();
const port = process.env.PORT || 8000;
const server = require('http').createServer(app);
const ws = require('ws');
const wss = new WebSocket.Server({ server: server });
/**
 *  App Configuration
 */
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

/**
 * Routes Definitions
 */
wss.on('connection', function connection(ws) {
  console.log("Somebody just connected");
  ws.send('Who are you?');
  ws.on('message', function incoming(message) {
    console.log(`received ${message}`);
  });
});

app.get('/', (req, res) => {
  //res.status(200).send("Does this work?");	
  res.render("index", {title: "Home"});
});

app.post('/', jsonParser, (req, res) => {
  //console.log(req.body);
  console.log(req.body);
  //console.log(req.text());
  //res.status(200).send("Does this work?");	
  //res.status(200).send(req.body);
  res.redirect(302,"index", {posts: req.body});
  //res.sendStatus(302);
});
/**
 * Server Activation
 */

app.listen(port, () => {
  console.log(`Listening to requests on http://${port}`);	
});