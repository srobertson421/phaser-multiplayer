const express = require('express');
const http = require('http');
const uuid = require('uuid');
const mapClients = require('./helpers/map-clients.js');
const WebSocket = require('ws');

const app = express();

app.use(express.static(`${__dirname}/public`));

app.get('/', function(req, res) {
  res.sendFile(`${__dirname}/public/index.html`);
});

const server = http.createServer(app);
const wss = new WebSocket.Server({
  server,
  clientTracking: true
});

wss.on('connection', function(ws, req) {
  function broadcast(data) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  ws._id = uuid.v4();

  const clientIdMessage = {
    type: 'clientId',
    payload: {
      id: ws._id
    }
  }

  ws.send(JSON.stringify(clientIdMessage));

  console.log('Client connected', ws._id);

  ws.on('message', function incomingMessage(message) {
    broadcast(message);
  });

  ws.on('close', function closeSocket(code, reason) {
    console.log(`Client disconnected with code ${code} because of ${reason}`);
    const removeClientMessage = {
      type: 'removeClient',
      payload: mapClients(wss.clients)
    }

    broadcast(JSON.stringify(removeClientMessage));
  });

  const clientListMessage = {
    type: 'clientList',
    payload: mapClients(wss.clients)
  }

  broadcast(JSON.stringify(clientListMessage));
});

server.listen(3000, function listening() {
  console.log(`listening on ${server.address().port}`);
});
