// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function() {
  $("#deleteData").on("click",deleteData);
  
  function deleteData(){
    event.preventDefault();
    event.stopPropagation();
    if (confirm("This action will reset all employee time and turns. Proceed?")) {    
    $.ajax("/clear", {
        type: "DELETE",
      }).then(function() {          
    });
    location.reload();    
  }};
    
  
});
