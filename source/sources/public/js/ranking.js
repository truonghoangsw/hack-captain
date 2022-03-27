function getRanking() {
  $.get("/ranking", function(data){
    if (data && data.data) {
      var r = data.data[0];
      var template = '';
      if (Array.isArray(r)) {
        for (let u of r) {
          template += '<li><span class="username">' + u.username_won + '</span><span class="score">' + u.score + '</span></li>'
        }
      }
      $('#ranking').html('<ul class="ranking">' + template + '</ul>');
    }
  });
}

$('document').ready(function () {
  getRanking();
});

