$(document).ready(main);

function main() {

    var acceptedMsgs = JSON.parse(localStorage.getItem('acceptedMsgs')) || [];


    function displayMsgs(msgs) {
        console.log("acceptedmsg");
        console.log(acceptedMsgs);
        var $emailCol = $("#emailData");
        var $emailCard = $('#emailCard');
        var $body = $("#baseBody");

        msgs.forEach((msg, i) => {
            var $emailCardClone = $emailCard.clone();
            var emailCardId = 'emailCard-' + i;
            $emailCardClone.data(msg);
            $emailCardClone.attr('id', emailCardId);
            $emailCardClone.find('#subject').text(msg.subject);
            $emailCardClone.find('#date').text(msg.date);
            $emailCardClone.find('#sender').text(msg.sender);

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












}