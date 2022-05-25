'use strict';

const express     = require('express');
const bodyParser  = require('body-parser');
const expect      = require('chai').expect;
const cors        = require('cors');
const myDB = require('./connection');

require('dotenv').config();

const apiRoutes         = require('./routes/api.js');
const fccTestingRoutes  = require('./routes/fcctesting.js');
const runner            = require('./test-runner');

let app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only

myDB(async (client) => {
  const myDataBase = await client.db('dbissue').collection('issues');
  //console.log(myDataBase)
  console.log('try to connect')
  apiRoutes(app, myDataBase);
  app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });
}).catch((e) => {
  app.route('/:project/')
  .get(function (req, res) {
    console.log('raise e connect')
  });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//Index page (static HTML)
/** 
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//Sample front-end
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });
*/
//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
//apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
const listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        console.log('Tests are not valid:');
        console.error(e);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
