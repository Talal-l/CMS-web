$(document).ready(main);

function main() {

    var acceptedMsgs = JSON.parse(localStorage.getItem('acceptedMsgs')) || [];

    class Request {
        constructor() {
            this.type = '';
            this.count = -1;
            this.requestingParty = '';
            this.requestDate = '';
            this.uploadDate = '';
            this.requestMethod = ''; // via whatsapp, in-person, etc
        }
    }

    requests = []; // all requests, whether they came from eamil or another source




    displayMsgs(acceptedMsgs);


    // set date picker for request and upload date

    setDataPicker("requestDate");
    setDataPicker("uploadDate");

    function setDataPicker(inputFieldName) {

        // make this less awkward

        var date_input=$('input[name="requestedDate"]'); //our date input has the name "date"
        var inputHtml = `input[name="${inputFieldName}"]`;
        console.log(inputHtml);


        var date_input = $(inputHtml); // get the input field related to the picker
        var container = $('.bootstrap-iso1 form').length > 0 ? $('.bootstrap-iso1 form').parent() : "body";
        var options = {
            format: 'mm/dd/yyyy',
            container: container,
            todayHighlight: true,
            autoclose: true,

        };

        date_input.datepicker(options);
    }


    function displayMsgs(msgs) {
        console.log("acceptedmsg");
        console.log(acceptedMsgs);
        var $emailCol = $("#uploadData");
        var $emailCard = $('#uploadCard');
        var $body = $("#baseBody");

        msgs.forEach((msg, i) => {
            var $emailCardClone = $emailCard.clone();
            var emailCardId = 'uploadCard-' + i;
            $emailCardClone.data(msg);
            $emailCardClone.attr('id', emailCardId);
            $emailCardClone.find('#requester').text(msg.subject);
            $emailCardClone.find('#type').text(msg.date);
            $emailCardClone.find('#requestedDate').text(msg.sender);

            // search in accepted msgs for the current msg 
            acceptedMsgs.some((acceptedMsg) => {
                if (msg.id === acceptedMsg.id) {
                    $emailCardClone.addClass('card-accepted');
                    return true;
                }
                return false;
            });


            $emailCol.append($emailCardClone);

            // card click
            $emailCardClone.click(function () {
                if (selectedEmailCardId !== $(this).attr('id') || selectedEmailCardId === null) {

                    var $ifram = $('#bodyIfram');
                    $ifram.attr('srcdoc', msg.body);
                    $body.append($ifram);

                    $(this).toggleClass("card-active");
                    $("#" + selectedEmailCardId).toggleClass("card-active");

                    selectedEmailCardId = $(this).attr('id');
                }
            });
        });
        $emailCard.hide();
    };





    // event handlers 
    {


        // on modal submit
        $('#modalSubmitBtn').click(function () {

            var newRequest = new Request();
            newRequest.type = $('#requestType').val();
            newRequest.count = $('#requestCount').val();
            newRequest.requestingParty = $('#requestParty').val();
            newRequest.requestDate = $('#requestDate').val();
            newRequest.uploadDate= $('#uploadDate').val();
            newRequest.requestMethod = $('#requestMethod').val();

            console.log("request");
            console.log(newRequest);


        });


    }









}