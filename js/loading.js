$(document).ready(fetchEmails);

function displayMsgs(msgs) {
    console.log("done displaying");
    loaderDiv.innerHTML = `<h1> </h1>`;
    
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
    loaderDiv.innerHTML = `<h1> </h1>`;
}

function fetchEmails() {
   

    var msgs = [];
    // var dataStatus = document.readyState; //for the status of the data did it fully load or else.
    // console.log(dataStatus);
    var loaderDiv = document.getElementById("loaderDiv");

    loaderDiv.innerHTML = `<div class="spinner-border text-primary m-5" style="width: 10rem; height: 10rem;" role="status">
            <span class="sr-only">Loading...</span>
            </div>`;
    

    // get emails ids  
    console.log("msgs length in loading");
    console.log(msgs.length);
    gapi.client.gmail.users.messages.list({
        'userId': 'me',
        'maxResults': 5
    }).then(function (response) {
        // loaderDiv.innerHTML = `<div class="spinner-border text-primary m-5" style="width: 10rem; height: 10rem;" role="status">
        // <span class="sr-only">Loading...</span>
        // </div>`;
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
            console.log("hello1");
           
            console.log("hello2");
            console.log(rawMsgs);

            // iterate over each element in the rawMsgs object
            $.each(rawMsgs, (key, rawMsg) => {
              
                // loaderDiv.innerHTML = `<div class="spinner-border text-primary m-5" style="width: 10rem; height: 10rem;" role="status">
                // <span class="sr-only">Loading...</span>
                // </div>`;

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

                // loaderDiv.innerHTML = `<h1> </h1>`;
            });
            // loaderDiv.innerHTML = `<h1> </h1>`;
            displayMsgs(msgs);
            // console.log("done displaying");
            // loaderDiv.innerHTML = `<h1> </h1>`;
        })
        // loaderDiv.innerHTML = `<h1> </h1>`;
    });
    // loaderDiv.innerHTML = `<h1> </h1>`;
    

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
    loaderDiv.innerHTML = `<h1> </h1>`;

    function getHeader(headers, headerStr) {
        var header = '';
        $.each(headers, function () {
            if (this.name === headerStr) {
                header = this.value;
            }
        });
        return header;
    }
    loaderDiv.innerHTML = `<h1> </h1>`;

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
    console.log("done displaying");
            loaderDiv.innerHTML = `<h1> </h1>`;
}