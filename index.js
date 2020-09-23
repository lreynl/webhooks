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
const ws = require('express-ws');
ws(app);

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://ler:mypw123@cluster0.jjlsi.mongodb.net/cluster0?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


let events = require('events');
let eventEmitter = new events.EventEmitter();
let webhook = { val: "empty" };
//const wss = new ws.Server({ server: server, path: '/wspath' });
/**
 *  App Configuration
 */
//app.set("views", path.join(__dirname, "views"));
//app.set("view engine", "pug");
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));


app.ws('/', (ws, req) => {
  ws.send("Does this work?");
  ws.on('message', msg => {
    ws.send(msg);
  });
  ws.on('close', () => {
    console.log('WebSocket was closed');
  });
  eventEmitter.on('received', (body) => {
    //let str = webhook.val;
  	ws.send(body);
  });
});

/**
 * Routes Definitions
 */
 /*
wss.on('connection', function connection(ws) {
  console.log("Somebody just connected");
  ws.send('Who are you?');
  ws.on('message', function incoming(message) {
    console.log(`received ${message}`);
  });
});
*/

app.get('/', (req, res) => {
  //res.status(200).send("Does this work?");	
  //res.render("index", {title: "Home"});
  res.sendFile('index.html');
});

app.post('/', jsonParser, (req, res) => {
  //console.log(req.body);
  console.log(req.body);
  //console.log(req.text());
  //res.status(200).send("Does this work?");	
  //res.status(200).send(req.body);
  //res.send("testing testing");
  let str = JSON.stringify(req.body);
  eventEmitter.emit('received', str);
  //webhook.val = req.body;
  res.redirect(302,"index", {posts: req.body});
  //res.sendStatus(302);
});
/**
 * Server Activation
 */

app.listen(port, () => {
  console.log(`Listening to requests on http://${port}`);	
});