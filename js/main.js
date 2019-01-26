$(document).ready(main);


function main() {
    var msgs = [];
    // array of msg that have been accepted
    var acceptedMsgs = JSON.parse(localStorage.getItem('acceptedMsgs')) || [];
    const CLIENT_ID = CRED.client_id;
    const API_KEY = CRED.api_key;
    // Array of API discovery doc URLs for APIs used by the quickstart
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

    var authorizeButton = document.getElementById('authorize_button');
    var signoutButton = document.getElementById('signout_button');

    // keep track of selected msg
    var selectedEmailCardId = null;



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

            acceptedMsgs.some((acceptedMsg) => {
                if (msg.id === acceptedMsg.id){
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
        $("#acceptBtn").click(function () {

            // get the msg object of the currently selected msg
            var originalMsg = $('#' + selectedEmailCardId).data();
            console.log(originalMsg);

            // mark as accepted the msg is defined and has not been accepted yey
            if (originalMsg !== undefined && !($('#' + selectedEmailCardId).hasClass('card-accepted'))) {

                originalMsg.labels.push("didReceive");
                console.log(originalMsg.labels);
                $("#" + selectedEmailCardId).addClass('card-accepted');
                $("#" + selectedEmailCardId).removeClass('card-rejected');

                // add msg to accepted msgs array
                acceptedMsgs.push(originalMsg);
                localStorage.setItem('acceptedMsgs', JSON.stringify(acceptedMsgs));
            }

        });
        $("#rejectBtn").click(function () {
            // show bootstrap modal with text box confirming 

            var originalMsg = $('#' + selectedEmailCardId).data();

            if (originalMsg !== undefined && !($('#' + selectedEmailCardId).hasClass('card-rejected'))) {

                originalMsg.labels.push("rejected");
                console.log(originalMsg.labels);
                $("#" + selectedEmailCardId).addClass('card-rejected');
                $("#" + selectedEmailCardId).removeClass('card-accepted');

            }
        });

    }




    { // api code

        // Asynchronously load the API client and auth2 library.
        gapi.load('client:auth2', initClient);





        // what permissions to ask from the user
        // requested permissions read data send messages handle labels 
        var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.labels';



        var authorizeButton = document.getElementById('authorize_button');
        var signoutButton = document.getElementById('signout_button');

        /**
         *  Initializes the API client library and sets up sign-in state
         *  listeners.
         */
        function initClient() {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: DISCOVERY_DOCS,
                scope: SCOPES
            }).then(function () {
                // Listen for sign-in state changes.
                gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

                // Handle the initial sign-in state.
                updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                authorizeButton.onclick = handleAuthClick;
                signoutButton.onclick = handleSignoutClick;
            }, function (error) {
                appendPre(JSON.stringify(error, null, 2));
            });
        }

        /**
         *  Called when the signed in status changes, to update the UI
         *  appropriately. After a sign-in, the API is called.
         */
        function updateSigninStatus(isSignedIn) {
            if (isSignedIn) {
                authorizeButton.style.display = 'none';
                signoutButton.style.display = 'inline';

                fetchEmails();
            } else {
                authorizeButton.style.display = 'inline';
                signoutButton.style.display = 'none';
            }
        }

        /**
         *  Sign in the user upon button click.
         */
        function handleAuthClick(event) {
            gapi.auth2.getAuthInstance().signIn();
        }

        /**
         *  Sign out the user upon button click.
         */
        function handleSignoutClick(event) {
            gapi.auth2.getAuthInstance().signOut();
        }

        /**
         * Append a pre element to the body containing the given message
         * as its text node. Used to display the results of the API call.
         *
         * @param {string} message Text to be placed in pre element.
         */
        function appendPre(message) {
            var pre = document.getElementById('content');
            var textContent = document.createTextNode(message + '\n');
            pre.appendChild(textContent);
        }

        /**
         * Print all Labels in the authorized user's inbox. If no labels
         * are found an appropriate message is printed.
         */
        function fetchEmails() {

            // get emails ids  
            gapi.client.gmail.users.messages.list({
                'userId': 'me',
                'maxResults': 5
            }).then(function (response) {
                let msgIds = response.result.messages;


                var batch = gapi.client.newBatch();

                // add multiple requests for each email using its id
                msgIds.forEach(msgId => {
                    var req = gapi.client.gmail.users.messages.get({
                        'userId': 'me',
                        'id': msgId.id
                    });

                    batch.add(req);
                });

                batch.then(function (response) {
                    // process the messages 

                    var rawMsgs = response.result;

                    console.log(rawMsgs);

                    // iterate over each element in the rawMsgs object
                    $.each(rawMsgs, (key, rawMsg) => {

                        var payload = rawMsg.result.payload;
                        // what info to extract
                        var msg = {
                            id: rawMsg.result.id,
                            labels: rawMsg.result.labelIds,
                            subject: getHeader(payload.headers, 'Subject'),
                            body: getBody(payload),
                            sender: getHeader(payload.headers, 'From'),
                            receiver: getHeader(payload.headers, 'To'),
                            date: getHeader(payload.headers, 'Date'),
                            rejectedReason: ''
                        };
                        console.log(msg);
                        msgs.push(msg);
                    });
                    displayMsgs(msgs);

                })

            });

            function getBody(payload) {
                var encodedBody = '';
                // if we have one part (just the body)
                if (typeof payload.parts === 'undefined') {
                    encodedBody = payload.body.data;
                }
                else {
                    encodedBody = getHTMLPart(payload.parts);
                }
                encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
                return decodeURIComponent(escape(window.atob(encodedBody)));
            }

            function getHeader(headers, headerStr) {
                var header = '';
                $.each(headers, function () {
                    if (this.name === headerStr) {
                        header = this.value;
                    }
                });
                return header;
            }


            // recursive parser that can handle multiple nested parts
            function getHTMLPart(parts) {

                console.log(parts);
                for (let i = 0; i < parts.length; i++) {
                    const part = parts[i];

                    // check if we don't have nested parts
                    if (typeof part.parts === 'undefined') {
                        // return the html part only
                        if (part.mimeType === 'text/html') {
                            return part.body.data;
                        }
                    } else {
                        // apply the function again on the other parts
                        getHTMLPart(part.parts);
                    }

                }

            }
        }

    }

    $sendEmailBtn = $("#sendEmailBtn");
    $rejectionMessageText = $("#message-text");


    $sendEmailBtn.click(function () {
        var originalMsg = $('#' + selectedEmailCardId).data();
        if (originalMsg !== undefined) {
            //var x = document.getElementById("message-text").value;
            //msgs.rejectedReason= x;
            //console.log(msgs.rejectedReason);
            originalMsg.rejectedReason = $rejectionMessageText.val();
            console.log(originalMsg.rejectedReason);
            console.log(originalMsg);
            $rejectionMessageText.value = "";
        }

    });

    $addUpload = $("#addUpload");
    $addRequestForm = $("#addRequestForm");
    $addUpload.click(function () {
        $addRequestForm.show();
    })


}
