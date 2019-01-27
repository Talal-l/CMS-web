$(document).ready(main);
function main() {

document.getElementById("upload_btn").onclick = function (){
    location.href = "upload.html";
}

document.getElementById("message_btn").onclick = function (){
    location.href = "index.html";
}

document.getElementById("report_btn").onclick = function (){
    location.href = "report.html";
}







//reject button modal javaScript in home page (index.html)
/*
$('#exampleModal').on('show.bs.modal', function (event) {
    var button = $(event.relatedTarget) // Button that triggered the modal
    var recipient = button.data('whatever') // Extract info from data-* attributes
    // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
    // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
    var modal = $(this)
    modal.find('.modal-title').text('New message to ' + recipient)
    modal.find('.modal-body input').val(recipient)
  })
  */

// date picker  js
{

    var date_input=$('input[name="requestedDate"]'); //our date input has the name "date"
    var container=$('.bootstrap-iso1 form').length>0 ? $('.bootstrap-iso1 form').parent() : "body";
    var options={
      format: 'mm/dd/yyyy',
      container: container,
      todayHighlight: true,
      autoclose: true,
      
    };
    date_input.datepicker(options);
    
  }
  //get the value of the date picker
  $modalSubmitBtn=$("#modalSubmitBtn");
  $modalSubmitBtn.click( function(){
    $requestDateInput =$("#requestedDate");
    
    
  });
  



  

}
