const express = require('express');
const app = express();
const path = require('path');
const { Pool } = require('pg');

// Postgres Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});


// If an incoming request uses a protocol other than HTTPS,
// redirect that request to the same url but with HTTPS
const forceSSL = function() {
    return function (req, res, next) {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(
         ['https://', req.get('Host'), req.url].join('')
        );
      }
      next();
    }
}

// Run the app by serving the static files in the dist directory
app.use(express.static(__dirname + '/dist/play-node'));
// Instruct the app to use the forceSSL middleware
// app.use(forceSSL());

showTimes = () => {
  let result = '';
  const times = process.env.TIMES || 5;
  for (i = 0; i < times; i++) {
    result += i + ' ';
  }
  return result;
}
app.get('/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM test_table');
    const results = { 'results': (result) ? result.rows : null};
    res.render('pages/db', results );
    client.release();
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});
app.get('/env', (req, res) => res.send(console.log(process.env)));
// For all GET requests, send back index.html so that PathLocationStrategy can be used
app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname + '/dist/play-node/index.html'));
});


// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 5000);