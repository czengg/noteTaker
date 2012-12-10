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
        enableButtons();
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
function uploadFile(file) {
  console.log("uploadFile");
  gapi.client.load('drive', 'v2', function() {
    // var pdfBlob = new Blob([file], { "type" : "application/pdf"})
    // insertFile(pdfBlob);
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


          var contentType = 'application/pdf';
          var metadata = {
            'title': $("#editor-note-title").text(),
            'mimeType': contentType
          }

          var base64Data = btoa(fileData);
          console.log(base64Data);
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
      

// calls to our server
// calls server
function addNote() {
  $.ajax({
    url: '/add',
    data: {
      title: $("#note-title").val(),
      user: window.userId,
      content: "<note></note>"
    }
  }).done(function(note) {
      console.log(note);
      window.titleSet[note.title] = note._id;

      var listElement = $("<li style='height:60px;' id="+note._id+"></li>");
      var linkElement = $("<a></a>");
      listElement.attr('onclick', 'populateEditor("'+note.title+'")');
      linkElement.html(note.title);
      linkElement.appendTo(listElement);

      $("#notesList").append(listElement).listview('refresh');
  });
}

function saveNote() {
  $.ajax({
    url: '/editContent',
    data: {
      id: titleSet[$('#editor-note-title').text()],
      content: $("#note-text").val()
    },
    type: 'POST'
  }).done(function(res) {
    console.log(res);
  });
}

function populateNotesFolder(array) {

  var list = $("<ul data-role='listview' id='notesList'></ul>");
  window.titleSet = {};


  for(var i=0; i<array.length; i++) {

    var note = array[i];

    window.titleSet[note.title] = note._id;

    var listElement = $("<li style='height:60px' id="+note._id+"></li>");

    var linkElement = $("<a></a>");
    listElement.attr('onclick', 'populateEditor("'+note.title+'")');
    linkElement.html(note.title);
    linkElement.appendTo(listElement);

    listElement.appendTo(list);
  }

  $("#list_container").append(list);

  $("#notesList:visible").listview('refresh');

  
}

function insertTitle() {
  var title = $("#note-title").val();
  $("#note-text").empty();
  $("#note-text").val("<note></note>")


  if(title in window.titleSet) {
    alert("This note title already exists!");
  }
  else {
    $("#editor-note-title").html(title);
    addNote();
    $.mobile.changePage("#editor");
  }
}

function getContentById(noteId) {
  $.ajax( {
    url: '/getContent',
    data: {
      id: noteId
    },
    type: 'POST'
  }).done(function(res) {
    console.log("getContent: " , res);
    console.log(res.content);
    $("#note-text").val(res.content);
    return;
  });
}

function populateEditor(title) {
  getContentById(window.titleSet[title]);
  $("#editor-note-title").text(title);
  $.mobile.changePage("#editor");
}

function getNotes() {
  $.ajax({
    url: '/getFiles',
    data: {
      user: window.userId
    }
  }).done(function(res) {
    populateNotesFolder(res);
  });
}

function deleteNote() {
  $.ajax({
    url: '/delete',
    data: {
      id: window.titleSet[$("#editor-note-title").text()]
    }
  }).done(function(res) {
    deleteFromList($("#editor-note-title").text());
    $.mobile.changePage("#notes");
  });
}

function deleteFromList(title) {
  $("#"+window.titleSet[title]).remove();
  delete window.titleSet[title];
}

function convertToHTML() {
  $.ajax({
    type: 'POST' ,
    url: '/preview',
    data: {
      content: $('#note-text').val(),
      id: $("#editor-note-title").text()
    }
  }).done(function(res) {
    var frame = $("<iframe id='preview-frame'></iframe>");
    $('#preview_content').append(frame);
    setTimeout( function() {
      var doc = frame[0].contentWindow.document;
      var body = $('body',doc);
      body.html(res);
      console.log(res);
    }, 1);

    $.mobile.changePage("#preview");
  });
}

function convertAndSave() {
  var doc = $('#preview-frame')[0].contentWindow.document;
  var body = $('body', doc);
  var html = "<html><body>" + body.html() + "</body></html>";
  console.log("convertAndSave");
  console.log(html);
  $.ajax({
    type: 'POST',
    url: '/createPDF',
    data: {
      html: html,
      id: window.titleSet[$("#editor-note-title").text()]
    }
  }).done(function(binaryStr) {
    uploadFile(binaryStr);
  });
}

function redirect(path) {
  // console.log(this);
  window.location.href = path;
  // console.log(this);
}

function enableButtons() {
  $(".button-home-notes").removeClass("ui-disabled");
}

handleAuthResult();
