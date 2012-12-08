// log into google
var CLIENT_ID = '125403324444.apps.googleusercontent.com';
var SCOPES = 'https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/userinfo.profile';

/**
 * Called when the client library is loaded to start the auth flow.
 */
function handleClientLoad() {
  window.setTimeout(checkAuth, 1);
}

/**
 * Check if the current user has authorized the application.
 */
function checkAuth() {
  gapi.auth.authorize(
      {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': true, 'response_type': 'token'},
      handleAuthResult);
}

function getId(authResult) {
  $.ajax( {
    url: 'https://www.googleapis.com/oauth2/v1/userinfo' ,
    data: {
      access_token: authResult.access_token
    },
    type: 'GET'
  }).done(function(res) {
    window.userId = res.id;
    console.log(window.userId);
    getNotes();
  });
  
}

/**
 * Called when authorization server replies.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authButton = $('#authorizeButton');
  console.log(authResult);
  if (authResult && !authResult.error) {
    // Access token has been successfully retrieved, requests can be sent to the API.
    authButton.css("display","none");
    $("#logOutButton").css("display","inline-block");
    console.log(gapi);
    getId(authResult);

  } else {
    // No access token could be retrieved, show the button to start the authorization flow.
    authButton.css('inline-block');
    authButton.click(function() {
        gapi.auth.authorize(
            {'client_id': CLIENT_ID, 'scope': SCOPES, 'immediate': false},
            handleAuthResult);
    });
    
  }
}

/**
 * Start the file upload.
 *
 * @param {Object} evt Arguments from the file selector.
 */
function uploadFile(evt) {
  gapi.client.load('drive', 'v2', function() {
    var file = evt.target.files[0];
    insertFile(file);
  });
}

/**
 * Insert new file.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
function insertFile(fileData, callback) {
  const boundary = '-------314159265358979323846';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";

  var reader = new FileReader();
  reader.readAsBinaryString(fileData);
  reader.onload = function(e) {
    var contentType = fileData.type || 'application/octet-stream';
    var metadata = {
      'title': fileData.name,
      'mimeType': contentType
    };

    var base64Data = btoa(reader.result);
    var multipartRequestBody =
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n' +
        '\r\n' +
        base64Data +
        close_delim;

    var request = gapi.client.request({
        'path': '/upload/drive/v2/files',
        'method': 'POST',
        'params': {'uploadType': 'multipart'},
        'headers': {
          'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
        },
        'body': multipartRequestBody});
    if (!callback) {
      callback = function(file) {
        console.log(file)
      };
    }
    request.execute(callback);
  }
}

// calls to our server
// calls server
function saveNote() {
  $.ajax({
    url: '/add',
    data: {
      title: $("#note-title").val(),
      user: window.userId,
      content: $("#note-text").val()
    }
  });
}

function populateNotesFolder(array) {

  var list = $("<ul data-role='listview' id='notesList'></ul>");


  for(var i=0; i<array.length; i++) {

    var note = array[i];

    

    var listElement = $("<li style='height:60px'></li>");
    // listElement.attr("data-corners","false");
    // listElement.attr("data-shadows","false");
    // listElement.attr("data-iconshadow","true");
    // listElement.attr("data-wrapperels","div");
    // listElement.attr("data-icon","arrow-r");
    // listElement.attr("data-iconpos","right");
    // listElement.attr("class","ui-btn ui-btn-icon-right ui-li-has-arrow ui-li");
    // listElement.attr("data-theme","d");

    // var divOuterElement = $("<div></div>");
    // // divOuterElement.attr("class","ui-btn-inner ui-li");

    // var divInnerElement = $("<div></div>");
    // divInnerElement.attr("class","ui-btn-text");
    // divInnerElement.appendTo(divOuterElement);

    var linkElement = $("<a></a>");
    // linkElement.attr("class","ui-link-inherit");
    linkElement.click(function(note) {
                                          return function() {
                                              populateEditor(note);
                                          }
                                        }(note));
    linkElement.bind("touch",function(note) {
                                                  return function() {
                                                    populateEditor(note);
                                                  }
                                                }(note));
    linkElement.text(note.title);
    // linkElement.appendTo(divInnerElement);
    linkElement.appendTo(listElement);

    // var spanElement = $("<span></span>");
    // spanElement.attr("class","ui-icon ui-icon-arrow-r ui-icon-shadow");
    // spanElement.val('&nbsp;');
    // spanElement.appendTo(divOuterElement);

    // divOuterElement.appendTo(listElement);

    listElement.appendTo(list);
  }

  $("#list_container").append(list);
}

$("#notesList:visible").listview('refresh');

function refresh() {
  console.log("hi");
  $("#notesList").listview('refresh');
}

function populateEditor(note) {
  $("#note-text").val(note.content);
  $.mobile.changePage("#editor");
}

function getNotes() {
  $.ajax({
    url: '/getFiles',
    data: {
      user: window.userId
    }
  }).done(function(res) {
    console.log(res);
    populateNotesFolder(res);
  });

}

handleAuthResult();
