'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai').expect;
const cors = require('cors');
const myDB = require('./connection');
const apiRoutes = require('./routes/api.js');
const createIssueSchema = require('./models/issue')
const app = express();
//const session = require('express-session');
//const http = require('http').createServer(app);

const MongoStore = require('connect-mongo');
const URI = process.env.MONGO_URI;
//const store = new MongoStore({ url: URI });
const fccTesting = require('./routes/fcctesting.js');
const runner = require('./test-runner');

fccTesting(app); //For FCC testing purposes
app.use('/public', express.static(process.cwd() + '/public'));
app.use(cors({ origin: '*' })); //For FCC testing purposes only
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(express.json());
//app.use(express.urlencoded({ extended: true }));
/** 
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
  key: 'express.sid',
  store: MongoStore.create({ mongoUrl: URI })
}));
*/
myDB(async (client) => {
  await createIssueSchema(client)
  const myDataBase = await client.db('dbissue').collection('issues')
  //console.log("myDataBase >", myDataBase)
  apiRoutes(app, myDataBase);
})

app.route('/:project/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

//Index page (static HTML)
app.route('/')
  .get(function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port ' + process.env.PORT);
  if (process.env.NODE_ENV === 'test') {
    console.log('Running Tests...');
    setTimeout(function() {
      try {
        runner.run();
      } catch (e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app;