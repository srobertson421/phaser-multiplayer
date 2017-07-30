var SocketLayer = SocketLayer || {};

SocketLayer = function(options) {
  this.url = options.url || 'ws://localhost:3000';
  this.newClientCallback = options.newClientCallback || null;
  this.removeClientCallback = options.removeClientCallback || null;
  this.clientStartMovementCallback = options.clientStartMovementCallback || null;
  this.clientStopMovementCallback = options.clientStopMovementCallback || null;
  this.socket = null;
  this.peers = [];
}

SocketLayer.prototype.init = function() {
  this.socket = new WebSocket(this.url);
  this.socket.onopen = this.onOpen.bind(this);
  this.socket.onmessage = this.onMessage.bind(this);
}

SocketLayer.prototype.onOpen = function(event) {
  console.log('Connected to Server');
}

SocketLayer.prototype.onMessage = function(event) {
  var data = JSON.parse(event.data);
  switch(data.type) {
    case 'clientId':
      this.socket.id = data.payload.id;
      return;
    case 'clientList':
      this.updateClientList(data);
      return;
    case 'removeClient':
      this.updateClientList(data);
      return;
    case 'movementData':
      if(data.payload.type === 'start') {
        this.clientStartMovementCallback(data);
      } else {
        this.clientStopMovementCallback(data);
      }
      return;
    default:
      console.log(data);
      return;
  }
}

SocketLayer.prototype.updateClientList = function(eventData) {
  var that = this;
  if(that.newClientCallback && that.removeClientCallback) {
    if(that.peers.length < eventData.payload.length) {
      eventData.payload.forEach(function each(client, index) {
        if(!that.peers[index]) {
          that.newClientCallback(client);
        }
      });
    } else {
      that.peers.forEach(function each(client, index) {
        if(!eventData.payload[index]) {
          that.removeClientCallback(client);
        }
      });
    }
  }

  this.peers = eventData.payload;
}
