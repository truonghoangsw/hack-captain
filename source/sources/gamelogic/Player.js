
function Player(x, y) {
    this.height = 80;
    this.width = 10;
    this.score = 0;
    this.x = x;
    this.y = y;
    this.gameWonCount = 0;
}

Player.prototype.getX = function () {
    return this.x;
}

Player.prototype.setX = function (x) {
    this.x = x;
}

Player.prototype.getY = function () {
    return this.y;
}

Player.prototype.setY = function (y) {
    this.y = y;
}

Player.prototype.getHeight = function () {
    return this.height;
}

Player.prototype.setHeight = function (height) {
    this.height = height;
}

Player.prototype.getWidth = function () {
    return this.width;
}

Player.prototype.setWidth = function (width) {
    this.width = width;
}


Player.prototype.getScore = function () {
    return this.score;
}


Player.prototype.setScore = function (score) {
    this.score = score;
}


Player.prototype.addScore = function () {
    this.score += 1;
}

Player.prototype.resetHeigh = function () {
    this.setHeight(80);
}

Player.prototype.win = function () {
    this.gameWonCount += 1;
}

Player.prototype.gameWon = function () {
    return this.gameWonCount;
}

module.exports = Player;