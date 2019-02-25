$(document).ready(function(){
  $('.new-page').click(function(){
    $.get("newpage", function(data, status){
      alert("Data: " + data + "\nStatus: " + status);
    });
  });
});