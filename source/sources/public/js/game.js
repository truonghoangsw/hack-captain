var canvas = document.getElementById("mycanvas");
var context2D = canvas.getContext("2d");
var ball = null;
var player1 = null;
var player2 = null;
var particles = [];
var player = null;
var headerheight = 0;


$(function () {
    $('#mycanvas').on('mousemove', function (e) {
        websocket.emit('move', {ypos: e.pageY - headerheight - 194});
    });
    headerheight = $('#header').height();
});

// $(function () {
//     $('#site_content').on('keypress', function(e) {
//         if (e.which == '13') {
//             websocket.emit('move', {ypos: e.pageY - headerheight - 94});
//         }
//     });
//     headerheight = $('#header').height();
// })

function gameTick(data) {
    player1 = data.player1;
    player2 = data.player2;
    ball = data.ball;
    particles = data.particles;
    $('#sp_p1score').text(player1.score);
    $('#sp_p2score').text(player2.score);


    for (let i = 1; i <= player1.gameWonCount ; i += 1) {
        $('#sp_p2_match').append('<span class="sp_p2_match"></span>');
    }


    // $('.sp_p2_match').each((index, element) => {
    //     if (index === 1) {
    //         $(this).css('backgroundColor', 'green');
    //     }
    // });
    // $('.sp_p2_match').css("backgroundColor", "green");


    if(data.collided){
	var audio = new Audio('audio_file.mp3');
        audio.play();
    }
    draw();
}

function draw() {
    const imageBall = new Image();
    const imageParticelLeft = new Image();
    const imageParticelRight = new Image();
    imageBall.src = '../images/image_8.png';
    imageParticelLeft.src = '../images/image_1.png';
    imageParticelRight.src = '../images/image_2.png';
    context2D.clearRect(0, 0, canvas.width, canvas.height);

    var padding = 10;
    context2D.lineWidth = 1;
    context2D.strokeStyle = 'white';

    context2D.beginPath();
    context2D.moveTo(player1.width + padding, padding);
    context2D.lineTo(canvas.width - player2.width - padding, padding);
    context2D.lineTo(canvas.width - player2.width - padding, canvas.height - padding);
    context2D.lineTo(player1.width + padding, canvas.height - padding);
    context2D.lineTo(player1.width + padding, padding);
    context2D.stroke();

    context2D.beginPath();
    context2D.lineWidth = 2;
    context2D.moveTo((canvas.width / 2) + (padding / 2), padding);
    context2D.lineTo((canvas.width / 2) + (padding / 2), canvas.height - padding);
    context2D.stroke();

    var quarter_left = player1.width + padding + Math.round((canvas.width - (player1.width + player2.width + padding + padding)) / 4);
    var quarter_right = canvas.width - player2.width - padding - Math.round((canvas.width - (player1.width + player2.width + padding + padding)) / 4);
    var eigth = Math.round((canvas.height - (padding * 2)) / 8);  //used for horizontal side-out lines
    context2D.lineWidth = 1;

    context2D.beginPath();
    context2D.moveTo(quarter_left, (canvas.height / 2) + (padding / 2));
    context2D.lineTo(quarter_right, (canvas.height / 2) + (padding / 2));
    context2D.stroke();

    context2D.beginPath();
    context2D.moveTo(quarter_left, canvas.height - (padding + eigth));
    context2D.lineTo(quarter_left, padding + eigth);
    context2D.stroke();

    context2D.beginPath();
    context2D.moveTo(quarter_right, canvas.height - (padding + eigth));
    context2D.lineTo(quarter_right, padding + eigth);
    context2D.stroke();

    context2D.beginPath();
    context2D.moveTo(player1.width + padding, canvas.height - (eigth + padding));
    context2D.lineTo(canvas.width - player2.width - padding, canvas.height - (eigth + padding));
    context2D.stroke();

    context2D.beginPath();
    context2D.moveTo(player1.width + padding, padding + eigth);
    context2D.lineTo(canvas.width - player2.width - padding, padding + eigth);
    context2D.stroke();

    //ball
    context2D.beginPath();
    context2D.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI, false);
    context2D.fillStyle = '#fff';
    context2D.fill();
    context2D.lineWidth = 1;
    context2D.strokeStyle = '#003300';
    context2D.stroke();

    //player
    context2D.fillStyle = 'white';
    context2D.fillRect(player1.x, player1.y, player1.width, player1.height);
    context2D.drawImage(imageParticelLeft, player1.x, player1.y, player1.width, player1.height);

    context2D.fillRect(player2.x, player2.y, player2.width, player2.height);
    context2D.drawImage(imageParticelRight, player2.x, player2.y, player2.width, player2.height);

    //particles
    for (var i = 0; i < particles.length; i++) {
        var particle = particles[i];
        if (particle != null) {
            context2D.fillRect(particle.x, particle.y, particle.radius, particle.radius);
        }
    }
}
