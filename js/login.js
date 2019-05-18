const CLIENT_ID = CRED.client_id;
const API_KEY = CRED.api_key;
var DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"
];
// what permissions to ask from the user
// requested permissions read data send messages handle labels 
const SCOPES =
    'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.labels';


console.log("checkLogin");

function initClient() {
    gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES
    }).then(function () {
        console.log("gapi object initialized correctly");
        console.log(gapi.auth2.getAuthInstance().isSignedIn.get());

    }, function (error) {
        appendPre(JSON.stringify(error, null, 2));
    });
}
// Asynchronously load the API client and auth2 library.
gapi.load('client:auth2', initClient);





function onSuccess(googleUser) {
    console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
    auth2 = gapi.auth2.getAuthInstance();

    console.log(gapi.client);
    sessionStorage.setItem('gapi-client', JSON.stringify(gapi.client));

   window.location.replace("./index.html");


}
function onFailure(error) {
    console.log(error);
}
function renderButton() {
    gapi.signin2.render('my-signin2', {
        'scope': 'profile email',
        'width': 240,
        'height': 50,
        'longtitle': true,
        'theme': 'light',
        'onsuccess': onSuccess,
        'onfailure': onFailure
    });
}

