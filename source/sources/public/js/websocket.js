function connect(kindOfPlay) {
    websocket = io.connect({'sync disconnect on unload': true});

    websocket.on('gametick', function (data) {
        gameTick(data)
    });
    websocket.on('startgame', function (data) {
        startGame(data)
    });
}