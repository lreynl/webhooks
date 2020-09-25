const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();
const port = process.env.PORT || 8000;
const server = require('http').createServer(app);
const ws = require('express-ws');
ws(app);

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://ler:mypw123@cluster0.jjlsi.mongodb.net/cluster0?retryWrites=true&w=majority";
let gitHubWh;
MongoClient.connect(uri, { useUnifiedTopology: true }, (err, client) => {
  if (err) return console.error(err);
  console.log('Connected to Database!');
  const db = client.db('webhooks');
  gitHubWh = db.collection('github');
});

const pg = require('pg');

const conString = "postgres://spitbtaw:L3SGm7L1H152GeOD5qlK2iBsV6ynltQU@lallah.db.elephantsql.com:5432/spitbtaw" 
const pg_client = new pg.Client(conString);
const pg_add = (str) => {
  pg_client.connect(function(err) {
    if(err) {
      return console.error('could not connect to postgres', err);
    }
    pg_client.query(`insert into mdb_keys (mdb_key) values ('${str}')`, (err, result) => {
      if(err) {
        return console.error('error running query', err);
      }
      console.log('row was added');
      pg_client.end();
    });
  });
}

let events = require('events');
let eventEmitter = new events.EventEmitter();
let webhook = { val: "empty" };

const fetchDb = () => {
  let test = gitHubWh.find().toArray();
  test.then(arr => {
    console.log("HELLO");
    return arr;
  }).then((arr) => {
    console.log(arr);
  	eventEmitter.emit('received', JSON.stringify(arr));
  });
}

app.use(bodyParser.urlencoded({ extended: true }));

app.ws('/', (ws, req) => {
  ws.on('message', msg => {
    fetchDb();
  });
  ws.on('close', () => {
    console.log('WebSocket was closed');
  });
  eventEmitter.on('received', (body) => {
  	ws.send(body);
  });
});

app.get('/', (req, res) => {
  res.sendFile('/public/index.html', { root: __dirname });
});

app.post('/', jsonParser, (req, res) => {
  let body = req.body;
  console.log(body);
  //let d = gitHubWh.deleteMany({});//////////////////////////////////////////////////////////////
  let entry = gitHubWh.insertOne(body);
  var id = 'empty';
  entry.then(db => {
    id = String(db.insertedId);
    pg_add(id);
    return id;
  }).then(id => {
    eventEmitter.emit('received', JSON.stringify(body));
  });
  res.redirect(302,"index", {posts: body});
});

app.listen(port, () => {
  console.log(`Listening to requests on http://${port}`);	
});
