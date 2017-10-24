const express = require('express');
const path = require('path');
const http = require('http');
const app = express();
const bodyParser = require('body-parser');

app.set('port', 61440);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.post('/', (req, res) => {
  var authorizedIps = [
    '127.0.0.1',
    'localhost'
  ];
  var githubIps = [
    '207.97.227.253',
    '50.57.128.197',
    '204.232.175.75',
    '108.171.174.178'
  ];
  var payload = req.body;

  if (!payload) {
    console.log('No payload');
    res.writeHead(400);
    res.end();
    return;
  }

  var ipv4 = req.ip.replace('::ffff:', '')
  if (!(inAuthorizedSubnet(ipv4) || authorizedIps.indexOf(ipv4) >= 0 || githubIps.indexOf(ipv4) >= 0)) {
    console.log('Unauthorized IP:', req.ip, '(', ipv4, ')');
    res.writeHead(403);
    res.end();
    return;
  }

  if (payload.ref === 'master' ||
    payload.ref === 'refs/heads/master' ||
    payload.ref === 'refs/heads/develop') {
    myExec('./github.sh');
  }

  res.writeHead(200);
  res.end();
});

http.createServer(app).listen(app.get('port'), function () {
  console.log('CI Ninja server listening on port ' + app.get('port'));
});

function myExec(line) {
  var exec = require('child_process').exec;
  var execCallback = (error) => {
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  }
  exec(line, execCallback);
}