(function main() {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update});

  var socket;
  var players = {};

  function preload() {
    game.load.image('player', 'assets/player.png');
  }

  var movementKeys;

  function create() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 0;

    socket = new SocketLayer({
      url: 'ws://localhost:3000',
      newClientCallback: createPlayer,
      removeClientCallback: removePlayer,
      clientStartMovementCallback: playerStartMovement,
      clientStopMovementCallback: playerStopMovement
    });

    socket.init();

    socket.peers.forEach(function each(client) {
      createPlayer(client);
    });

    movementKeys = game.input.keyboard.createCursorKeys();
    createKeyEvents();
  }

  function createKeyEvents() {
    movementKeys.left.onDown.add(function() {
      var movementData = {
        type: 'movementData',
        payload: {
          id: socket.socket.id,
          type: 'start',
          x: players[socket.socket.id].x,
          y: players[socket.socket.id].y,
          velocityX: -100,
          velocityY: 0
        }
      }

      socket.socket.send(JSON.stringify(movementData));
    });

    movementKeys.left.onUp.add(function() {
      var movementData = {
        type: 'movementData',
        payload: {
          id: socket.socket.id,
          type: 'stop',
          x: players[socket.socket.id].x,
          y: players[socket.socket.id].y,
          velocityX: 0,
          velocityY: 0
        }
      }

      socket.socket.send(JSON.stringify(movementData));
    });

    movementKeys.right.onDown.add(function() {
      var movementData = {
        type: 'movementData',
        payload: {
          id: socket.socket.id,
          type: 'start',
          x: players[socket.socket.id].x,
          y: players[socket.socket.id].y,
          velocityX: 100,
          velocityY: 0
        }
      }

      socket.socket.send(JSON.stringify(movementData));
    });

    movementKeys.right.onUp.add(function() {
      var movementData = {
        type: 'movementData',
        payload: {
          id: socket.socket.id,
          type: 'stop',
          x: players[socket.socket.id].x,
          y: players[socket.socket.id].y,
          velocityX: 0,
          velocityY: 0
        }
      }

      socket.socket.send(JSON.stringify(movementData));
    });
  }

  function update() {}

  function createPlayer(client) {
    var randX = game.rnd.integerInRange(100, 700);
    var randY = game.rnd.integerInRange(100, 500);
    var sprite = game.add.sprite(randX, randY, 'player');
    sprite.id = client.id;
    sprite.anchor.setTo(0.5);
    game.physics.enable(sprite, Phaser.Physics.ARCADE);
    players[sprite.id] = sprite;
  }

  function removePlayer(client) {
    players[client.id].destroy();
    delete players[client.id];
  }

  function playerStartMovement(movementData) {
    console.log(players);
    console.log(movementData);
    var data = movementData.payload;
    var player = players[data.id];
    player.body.velocity.x = data.velocityX;
    player.body.velocity.y = data.velocityY;
  }

  function playerStopMovement(movementData) {
    var data = movementData.payload;
    var player = players[data.id];
    player.body.velocity.x = data.velocityX;
    player.body.velocity.y = data.velocityY;
  }
})();
