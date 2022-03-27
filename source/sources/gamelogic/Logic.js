var Ball = require('./Ball');
var Particle = require('./Particle');
var Player = require('./Player');
var particleLength = 30;


function Logic(isSingleplayer) {
    this.particles = new Array();
    this.enemySpeed = 11;
    this.canvasHeight = 500;
    this.canvasWidth = 853;
    this.ballStartSpeed = 9;
    this.counter = 0;
    this.player1 = null;
    this.player2 = null;
    this.isSingleplayer = isSingleplayer;
    this.isPause = false;
    this.maxScore = 11;
    this.collided = false;
    this.stone = null;
    this.username_won = null;
}

Logic.prototype.init = function (player1,player2) {
    if (this.player1 == null) {
        this.player1 = new Player(0, 150,player1);
        this.player2 = new Player((this.canvasWidth - 10), 150,player2);
        this.ball = new Ball(10, 30, 150, this.getBallStartSpeed(), 0, this.canvasWidth, this.canvasHeight);
    } else {
        this.player1.setY(150);
        this.player2.setY(150);
        this.ball.setX(30);
        this.ball.setY(150);
        this.ball.setVy(0);
        this.ball.setVx(this.getBallStartSpeed());
    }

    this.increaseBallSpeed();
    this.increaseBallSpeed();
    this.increaseBallSpeed();
    this.increaseBallSpeed();
    this.increaseBallSpeed();
};

Logic.prototype.pause = function () {
    this.isPause = true;
};

Logic.prototype.unpause = function () {
    this.isPause = false;
};

Logic.prototype.isOnPause = function () {
    return this.isPause;
}

Logic.prototype.isCollided = function () {
    return this.collided;
}

Logic.prototype.increaseBallSpeed = function () {
    if (this.ball.getVx() < 0) {
        this.ball.setVx(this.ball.getVx() - 1);
    } else {
        this.ball.setVx(this.ball.getVx() + 1);
    }
};

Logic.prototype.setStone = function (stone) {
    this.stone = stone;
};

Logic.prototype.setPlayer1Y = function (y) {
    this.player1.setY(y);
};

Logic.prototype.setPlayer2Y = function (y) {
    this.player2.setY(y);
};

Logic.prototype.getParticles = function () {
    return this.particles;
};

Logic.prototype.getEnemySpeed = function () {
    return this.enemySpeed;
};

Logic.prototype.getBall = function () {
    return this.ball;
};

Logic.prototype.getPlayer1 = function () {
    return this.player1;
};

Logic.prototype.getPlayer2 = function () {
    return this.player2;
};

Logic.prototype.getCanvasHeight = function () {
    return this.canvasHeight;
};

Logic.prototype.getCanvasWidth = function () {
    return this.canvasWidth;
};

Logic.prototype.getBallStartSpeed = function () {
    return this.ballStartSpeed;
};

Logic.prototype.calculate = function () {
    this.counter++;
    this.collided=false;
    if (this.ball.isMovingRight()) {
        if (this.ball.collidesWith(this.player2)) {
            for (var i = 0; i < particleLength; i++) {
                this.getParticles()[i] = new Particle(this.ball, this.player2);
            }
            this.collided=true;
            this.ball.alternateXSpeed();
            this.ball.calculateYSpeed(this.player2);
            this.setStoneEffect(this.stone, this.player2);
        } else if (this.ball.getX() >= this.canvasWidth) {
            this.player1.addScore();
            this.resetState();
            return false;
        }
    } else {
        if (this.ball.collidesWith(this.player1)) {
            this.collided=true;
            for (var i = 0; i < particleLength; i++) {
                this.getParticles()[i] = new Particle(this.ball, this.player1);
            }
            this.ball.alternateXSpeed();
            this.ball.calculateYSpeed(this.player2);
            this.setStoneEffect(this.stone, this.player1);
        } else if (this.ball.getX() <= 0) {
            this.player2.addScore();
            this.resetState();
            return false;
        }
    }

    if (this.ball.isTouchingTop() || this.ball.isTouchingBottom()) {  //touching top or down?
        this.ball.alternateYSpeed();
    }

    this.ball.setX(this.ball.getX() + this.ball.getVx());
    this.ball.setY(this.ball.getY() + this.ball.getVy());

    if (this.isSingleplayer) {
        this.calculateAIMovement();
    }
    //particles
    if (this.counter >= 3) {
        for (i = 0; i < particleLength; i++) {
            if (this.getParticles()[i] != null) {
                var p = this.getParticles()[i];
                p.decreaseRadius();
                p.move();
                if (p.getRadius() == 0) {
                    this.getParticles()[i] = null;
                }
            }
        }
        this.counter = 0;
    }

    return true;
};

Logic.prototype.resetState = function () {
    this.player1.resetHeigh();
    this.player2.resetHeigh();
    this.ball.resetRadius();
};

Logic.prototype.calculateAIMovement = function () {
    var real_y_pos = this.player2.getY() + (this.player2.getHeight() / 2);
    var y_pos = this.player2.getY();

    if (this.ball.getVx() < 0) {
        if (real_y_pos < ((this.canvasHeight / 2) - 10)) {
            y_pos += this.getEnemySpeed();
        }
        else if (real_y_pos > ((this.canvasHeight / 2) + 10)) {
            y_pos -= this.getEnemySpeed();
        }
    } else if (this.ball.getVx() > 0) {
        if (real_y_pos != this.ball.getY()) {
            if (this.ball.getY() < (real_y_pos - 10)) {
                y_pos -= this.getEnemySpeed();
            }
            else if (this.ball.getY() > (real_y_pos + 10)) {
                y_pos += this.getEnemySpeed();
            }
        }
    }
    this.player2.setY(y_pos);
};

Logic.prototype.hasWonMatch = function () {
    this.username_won = this.player1.gameWon() >= 2 ? this.player1.username : (this.player2.gameWon() >= 2 ? this.player2.username : null);
    return this.player1.gameWon() >= 2 || this.player2.gameWon() >= 2;
};

Logic.prototype.hasWonGame = function () {
    if (this.player1.getScore() >= this.maxScore) {
        this.player1.win();
        this.player1.setScore(0);
        this.player2.setScore(0);
        return true;
    } else if (this.player2.getScore() >= this.maxScore) {
        this.player2.win();
        this.player1.setScore(0);
        this.player2.setScore(0);
        return true;
    }

    return false;
};

Logic.prototype.setStoneEffect = function (stone, player) {
    switch (stone) {
        case 'space':
            break;
        case 'mind':
            this.ball.setRadius(Math.floor(Math.random() * (15 - 5 + 1) + 5));
            break;
        case 'time':
            this.increaseBallSpeed();
            this.increaseBallSpeed();
            this.increaseBallSpeed();
            break;
        case 'reality':
            break;
        case 'power':
            if (player.getHeight() >= 50) {
                player.setHeight(player.getHeight() - 5);
            }
            break;
        case 'soul':
            break;
        default:
            break;
    }
};

module.exports = Logic;
