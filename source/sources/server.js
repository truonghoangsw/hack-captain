var express = require('express');
var uuid = require('uuid');

var app = express();
var cors = require('cors');
var server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});
//var conf = require('./config.json');
var port=process.env.PORT || 8081

var Ball = require('./gamelogic/Ball');
var Particle = require('./gamelogic/Particle');
var Player = require('./gamelogic/Player');
var Logic = require('./gamelogic/Logic');
const dbConfig = require("./model/db.config.js");
const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  operatorsAliases: false,
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.sequelize.sync();
db.users = require('./model/User')(sequelize, Sequelize);
db.userhistories = require('./model/UserHistory')(sequelize, Sequelize);

server.listen(port);

app.use(cors());

// statische Dateien ausliefern
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
    // so wird die Datei index.html ausgegeben
    res.sendFile(__dirname + '/public/index.html');
});


var gameloop, ballloop;
var lobbyUsers = new Array();
var pairs = new Array();
var viewers = new Array();

io.on('connection', function (socket) {

    socket.on('join', function (data) {
        viewers[data.roomId].push(data.userId)
    });

    socket.on('clienthandshake', async function (data) {
        lobbyUsers.forEach(function (user) {
            var sock = getSocketById(user.connectionId);
            sock.emit('servermessage', {datetime: getFormattedDate(), user: 'Captain America', message: data.username + ' has joined the force.', class: 'server'});
        });

        const user = {
            user_name: data.username,
            score: 0,
            display_name: "",
        };

        const userNew = await db.users.create(user);

        lobbyUsers.push({
            user: data.username,
            localId: data.localId,
            connectionId: socket.id,
            ongame: false,
            userDetail: userNew
        });

        socket.emit('servermessage', {datetime: getFormattedDate(), user: 'Captain America', message: 'Welcome to the Lobby', class: 'server'});
        socket.emit('serverhandshake', {
            connectionId: socket.id,
            user: data.username,
            localId: data.localId,
        });
        lobbyUsers.forEach(function (lobbyUser) {
            var sock = getSocketById(lobbyUser.connectionId);
            sock.emit('useradded', {users: lobbyUsers});
        });
    });


    socket.on('move', function (data) {
//        console.log('Move');
        for (var i = 0, max = pairs.length; i < max; i++) {
            var logic = pairs[i].logic;
            if (pairs[i].p1 == socket.id) {
//                console.log('set player1 pos:' + data.ypos);
                logic.setPlayer1Y(data.ypos);
                break;
            } else if (pairs[i].p2 == socket.id) {
                logic.setPlayer2Y(data.ypos);
//                console.log('set player2 pos:' + data.ypos);
                break;
            }
        }
    });

    socket.on('clientmessage', function (data) {
        lobbyUsers.forEach(function (user) {
            var sock = getSocketById(user.connectionId);
            sock.emit('servermessage', {datetime: getFormattedDate(), user: data.user, message: data.message, class: 'client'});
        });
    });

    socket.on('disconnect', function () {
        cancel(socket);
        //        console.log(lobbyUsers);
        for (var i = 0, max = lobbyUsers.length; i < max; i++) {
            if (lobbyUsers[i].connectionId === socket.id) {
                lobbyUsers.splice(i, 1);
                break;
            }
        }
        lobbyUsers.forEach(function (lobbyUser) {
            var sock = getSocketById(lobbyUser.connectionId);
            sock.emit('useradded', {users: lobbyUsers});
            sock.emit('servermessage', {datetime: getFormattedDate(), user: 'Captain America', message: lobbyUser.user + ' has left the lobby', class: 'left'});
        });
    });

    socket.on('cancelgame', function () {
        cancel(socket);
    });

    socket.on('clientinvitation', function (data) {
//        console.log(data.host + ' invites ' + data.guest);
        for (var i = 0, max = lobbyUsers.length; i < max; i++) {
            if (lobbyUsers[i].user === data.guest) {
                var guestSocket = getSocketById(lobbyUsers[i].connectionId);
                guestSocket.emit('serverinvitation', {host: data.host});
                break;
            }
        }
    });

    socket.on('initiatemultiplayer', function (data) {
        var p1Socket = null;
        var p2Socket = null;
        for (var i = 0, max = lobbyUsers.length; i < max; i++) {
            if (lobbyUsers[i].user === data.p1) {
                p1Socket = getSocketById(lobbyUsers[i].connectionId);
                lobbyUsers[i].ongame = true;
                continue;
            } else if (lobbyUsers[i].user === data.p2) {
                p2Socket = getSocketById(lobbyUsers[i].connectionId);
                lobbyUsers[i].ongame = true;
                continue;
            }
            if (p1Socket != null && p2Socket != null) {
                break;
            }
        }
        lobbyUsers.forEach(function (lobbyUser) {
            var sock = getSocketById(lobbyUser.connectionId);
            sock.emit('useradded', {users: lobbyUsers});
        });

        p1Socket.emit('gamestart', {player: 'Player 1'});
        p2Socket.emit('gamestart', {player: 'Player 2'});
        var sockets = new Array();
        sockets.push(p1Socket);
        sockets.push(p2Socket);
        var logic = new Logic(false);
        logic.init(data.p1,data.p2);
        logic.setStone(data.stone);
        var loops = startGameLoop(sockets, logic);
        pairs.push({
            p1: p1Socket.id,
            p2: p2Socket.id,
            logic: logic,
            loops: loops
        });
    });

    socket.on('initiatesingleplayer', function (data) {
        socket.emit('gamestart');
        var sockets = new Array();
        var logic = new Logic(true);
        logic.setStone(data?.stone);
        sockets.push(socket);
        logic.init();
        var loops = startGameLoop(sockets, logic);

        for (var i = 0, max = lobbyUsers.length; i < max; i++) {
            console.log(lobbyUsers[i].connectionId + " " + socket.id);
            if (lobbyUsers[i].connectionId == socket.id) {
                lobbyUsers[i].ongame = true;
                break;
            }
        }
        lobbyUsers.forEach(function (lobbyUser) {
            var sock = getSocketById(lobbyUser.connectionId);
            sock.emit('useradded', {users: lobbyUsers});
        });

        var roomId = uuid.v1();

        pairs.push({
            p1: socket.id,
            p2: null,
            logic: logic,
            loops: loops,
            roomId: roomId
        });

        viewers.push({
            roomId: []
        })
    });
    socket.on('gettop', async function (data) {
        var tops = await sequelize.query("select username_won,count(*) as score from user_histories group by username_won order by score desc",
            {
                type: Sequelize.SELECT
            });
        console.log(tops);
    });
});

function startGameLoop(sockets, logic) {
    var gameloop = setInterval(function () {
        if (!logic.isOnPause()) {
            var ok = logic.calculate();

            if (logic.hasWonMatch()) {
                logic.pause();
                cancel(sockets[0]);
                db.userhistories.create({
                    username_1: logic.player1.username,
                    username_2: logic.player2.username,
                    username_won: logic.username_won
                });
            }

            if (logic.hasWonGame()) {
                logic.pause();
            }

            if (!ok) {
                console.log('Game end');
                logic.pause();

                setTimeout(function () {
                    logic.unpause();
                    logic.init(logic.player1.username, logic.player2.username);
                }, 3000);
            }
            for (var i = 0, max = sockets.length; i < max; i++) {
                console.log(logic)
                sockets[i].emit('gametick', {
                    player1: logic.getPlayer1(),
                    player2: logic.getPlayer2(),
                    ball: logic.getBall(),
		            collided: logic.isCollided(),
                    particles: logic.getParticles()
                });
            }
        }
    }, 33);

    var ballloop = setInterval(function () {
        logic.increaseBallSpeed();
        console.log("Ballspeed: " + logic.getBall().getVx());
    }, 10000);

    return {ballloop: ballloop, gameloop: gameloop};
}

function cancel(socket) {
    for (var i = 0, max = pairs.length; i < max; i++) {
        var p1 = pairs[i].p1;
        var p2 = pairs[i].p2;

        if (p1 == socket.id && p2 == null) { //means singleplayer
//            console.log('Singleplayer cancel ' + pairs[i].loops.ballloop);
            clearInterval(pairs[i].loops.ballloop);
            clearInterval(pairs[i].loops.gameloop);
            pairs.splice(i, 1);
            socket.emit('gameend');
            for (var i = 0, max = lobbyUsers.length; i < max; i++) {
                if (lobbyUsers[i].connectionId == socket.id) {
//                    console.log('Setting ongame');
                    lobbyUsers[i].ongame = false;
                    break;
                }
            }
            break;
        }


        if (p1 == socket.id) {
            console.log('1');
            //find other player and send him a message
            for (var k = 0, max = lobbyUsers.length; k < max; k++) {
                var lobbySocket = getSocketById(lobbyUsers[k].connectionId);

                if (lobbyUsers[k].connectionId == p2) {
                    console.log('1.1');
                    lobbySocket.emit('opponentleft');
                    lobbySocket.emit('gameend');
                    lobbyUsers[k].ongame = false;
                } else if (lobbyUsers[k].connectionId == p1) {
                    console.log('1.2');
                    console.log(lobbySocket);
                    if(lobbySocket != undefined){
                        lobbySocket.emit('gameend');

                    }
                    lobbyUsers[k].ongame = false;
                }
            }
            console.log('Clearing intervals 1');
            console.log(pairs[i].loops.ballloop);
            console.log(pairs[i].loops.gameloop);
            clearInterval(pairs[i].loops.ballloop);
            clearInterval(pairs[i].loops.gameloop);
            pairs.splice(i, 1);
            break;
        } else if (p2 == socket.id) {
            console.log('2');
            for (var k = 0, max = lobbyUsers.length; k < max; k++) {
                var lobbySocket = getSocketById(lobbyUsers[k].connectionId);

                if (lobbyUsers[k].connectionId == p1) {
                    console.log('2.1');
                    lobbySocket.emit('opponentleft');
                    lobbySocket.emit('gameend');
                    lobbyUsers[k].ongame = false;
                } else if (lobbyUsers[k].connectionId == p2) {
                    console.log('2.2');
                    if(lobbySocket != undefined)
                    {
                        lobbySocket.emit('gameend');
                    }
                    lobbyUsers[k].ongame = false;
                }
            }
            console.log('Clearing intervals 2');
            console.log(pairs[i].loops.ballloop);
            console.log(pairs[i].loops.gameloop);
            clearInterval(pairs[i].loops.ballloop);
            clearInterval(pairs[i].loops.gameloop);
            pairs.splice(i, 1);
            break;
        }
    }


    lobbyUsers.forEach(function (lobbyUser) {
        var sock = getSocketById(lobbyUser.connectionId);
        if (typeof sock === 'undefined') {
            return;
        }
        sock.emit('useradded', {users: lobbyUsers});
    });
}

function getSocketById(socketId) {
    return io.of("/").sockets.get(socketId);
}

function getFormattedDate() {
    var d = new Date();
    return d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
}

app.get('/online', function (req, res) {
    res.send({
        users: lobbyUsers,
    });
});

console.log('Server runs on http://127.0.0.1:' + port + '/ now');
