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
            $emailCardClone.click(function() {
                if (selectedEmailCardId !== $(this).attr('id') ||
                    selectedEmailCardId === null) {

                    var $ifram = $('#bodyIfram');
                    $ifram.attr('srcdoc', msg.body);
                    $body.append($ifram);

                    $(this).toggleClass("card-active");
                    $("#" + selectedEmailCardId).toggleClass(
                        "card-active");

                    selectedEmailCardId = $(this).attr('id');
                }
            });
        });
        $emailCard.hide();
    };





    // event handlers 
    {


        // on modal submit
        $('#modalSubmitBtn').click(function() {

            var newRequest = new Request();
            newRequest.type = $('#requestTypeBtn').text();
            newRequest.count = $('#requestCount').val();
            newRequest.requestingParty = $('#requestParty').val();
            newRequest.requestDate = $('#requestedDate').val();
            newRequest.requestMethod = $('#requestMethod').val();

            console.log("request");
            console.log(newRequest);


        });


    }









}
