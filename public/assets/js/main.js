// Make sure we wait to attach our handlers until the DOM is fully loaded.
$(function() {
  $("#deleteData").on("click",deleteData);
   // When you click the savenote button
  $(document).on("click", ".saveNote", addNote);
   // When you click the save  button without note
  $(document).on("click", "button.unsaved", saveWONote);  
  
  function deleteData(){
    event.preventDefault();
    event.stopPropagation();
    if (confirm("This action will delete all the data. Proceed?")) {    
    $.ajax("/clear", {
        type: "DELETE",
      }).then(function() {          
    });
    location.reload();    
  }};

  function saveWONote() {
    event.stopPropagation();
    event.preventDefault();
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "POST",
      url: "/save/" + thisId,
    })
      // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
    });
      location.reload()                  
  }

  function addNote(event){
    event.preventDefault();    
    event.stopPropagation();
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

     // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/addnote/" + thisId,
      data: {
        // Value taken from note textarea
        body: $("#textarea"+thisId).val()
      }
    })
      // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
    });
      location.reload()    
}; 
    
  
});
