const CLIENT_ID = CRED.client_id;
const API_KEY = CRED.api_key;
var DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"
];

// keep track of selected msg
var selectedEmailCardId = null;


// what permissions to ask from the user
// requested permissions read data send messages handle labels 
const SCOPES =
    'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.labels';


// Asynchronously load the API client and auth2 library.
gapi.load('client:auth2', function () {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        console.log("gapi object initialized correctly");
        console.log(gapi.auth2.getAuthInstance().isSignedIn.get());

        // array of msg that have been accepted

        console.log(gapi);
        fetchEmails();


        // inside the call back to make sure we are using the initialized gapi object
        var signoutButton = document.getElementById('signout_button');
        signoutButton.onclick = function (event) {
            gapi.auth2.getAuthInstance().signOut().then(() => {
                console.log('User signed out');
                window.location.replace("./login.html");
            });

        };



    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
    });
});




function displayMsgs(msgs,acceptedMsgs) {
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
                // inside the call back to make sure we are using the initialized gapi object
                $emailCardClone.addClass('card-accepted');
                return true;
            }
            return false;
        });


        $emailCol.append($emailCardClone);

        // card click
        $emailCardClone.click(function () {
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
    $("#acceptBtn").click(function () {

        // get the msg object of the currently selected msg
        var originalMsg = $('#' + selectedEmailCardId).data();
        console.log(originalMsg);

        // mark as accepted the msg is defined and has not been accepted yey
        if (originalMsg !== undefined && !($('#' +
            selectedEmailCardId).hasClass('card-accepted'))) {

            originalMsg.labels.push("didReceive");
            console.log(originalMsg.labels);
            $("#" + selectedEmailCardId).addClass('card-accepted');
            $("#" + selectedEmailCardId).removeClass(
                'card-rejected');

            // add msg to accepted msgs array
            acceptedMsgs.push(originalMsg);
            localStorage.setItem('acceptedMsgs', JSON.stringify(
                acceptedMsgs));
        }

    });
    $("#rejectBtn").click(function () {
        // show bootstrap modal with text box confirming 

        var originalMsg = $('#' + selectedEmailCardId).data();

        if (originalMsg !== undefined && !($('#' +
            selectedEmailCardId).hasClass('card-rejected'))) {

            originalMsg.labels.push("rejected");
            console.log(originalMsg.labels);
            $("#" + selectedEmailCardId).addClass('card-rejected');
            $("#" + selectedEmailCardId).removeClass(
                'card-accepted');

        }
    });

}





function fetchEmails() {


    var msgs = [];
    var acceptedMsgs = JSON.parse(localStorage.getItem('acceptedMsgs')) || [];
    // get emails ids  
    gapi.client.gmail.users.messages.list({
        'userId': 'me',
        'maxResults': 5
    }).then(function (response) {
        let msgIds = response.result.messages;


        var batch = gapi.client.newBatch();

        // add multiple requests for each email using its id
        msgIds.forEach(msgId => {
            var req = gapi.client.gmail.users.messages
                .get({
                    'userId': 'me',
                    'id': msgId.id
                });
            console.log(req);

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
                    subject: getHeader(
                        payload.headers,
                        'Subject'),
                    body: getBody(payload),
                    sender: getHeader(
                        payload.headers,
                        'From'),
                    receiver: getHeader(
                        payload.headers,
                        'To'),
                    date: getHeader(
                        payload.headers,
                        'Date'),
                    rejectedReason: ''
                };
                console.log(msg);
                msgs.push(msg);
            });
            displayMsgs(msgs,acceptedMsgs);

        })

    });

    function getBody(payload) {
        var encodedBody = '';
        // if we have one part (just the body)
        if (typeof payload.parts === 'undefined') {
            encodedBody = payload.body.data;
        } else {
            encodedBody = getHTMLPart(payload.parts);
        }
        encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/')
            .replace(/\s/g, '');
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


$sendEmailBtn = $("#sendEmailBtn");
$rejectionMessageText = $("#message-text");


$sendEmailBtn.click(function () {
    var originalMsg = $('#' + selectedEmailCardId).data();
    if (originalMsg !== undefined) {
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

