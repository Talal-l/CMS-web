const CLIENT_ID = CRED.client_id;
const API_KEY = CRED.api_key;
var DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"
];


console.log("checkLogin");

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function() {
        console.log("user is: ");
        console.log(gapi.auth2.getAuthInstance().isSignedIn.get());

    }, function(error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}





// what permissions to ask from the user
// requested permissions read data send messages handle labels 
var SCOPES =
    'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.labels';

// Asynchronously load the API client and auth2 library.
gapi.load('client:auth2', initClient);


