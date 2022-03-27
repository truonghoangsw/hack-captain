function getRanking() {
  $.get("/ranking", function(data){
    if (data && data.data) {
      var r = data.data[0];
      var template = '';
      template += '<tr><thead><td>Username</td><td>Score</td></thead></tr>';
      if (Array.isArray(r)) {
        for (let u of r) {
          template += '<tr><td class="username">' + u.username_won + '</td><td class="score">' + u.score + '</td></tr>'
        }
      }
      $('#ranking').html('<table class="ranking-table">' + template + '</table>');
    }
  });
}

$('document').ready(function () {
  getRanking();
});

function logout(event) {
  event.preventDefault();
  sessionStorage.clear();
  window.location.href = '/login.html';
}
