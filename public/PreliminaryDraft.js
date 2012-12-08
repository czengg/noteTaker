// stole this code from stackoverflow
// http://stackoverflow.com/questions/946534/insert-text-into-textarea-with-jquery
$.fn.extend({
  insertAtCaret: function(myValue){
  var obj;
  if( typeof this[0].name !='undefined' ) obj = this[0];
  else obj = this;

  if ($.browser.msie) {
    obj.focus();
    sel = document.selection.createRange();
    sel.text = myValue;
    obj.focus();
    }
  else if ($.browser.mozilla || $.browser.webkit) {
    var startPos = obj.selectionStart;
    var endPos = obj.selectionEnd;
    var scrollTop = obj.scrollTop;
    obj.value = obj.value.substring(0, startPos)+myValue+obj.value.substring(endPos,obj.value.length);
    obj.focus();
    obj.selectionStart = startPos + myValue.length;
    obj.selectionEnd = startPos + myValue.length;
    obj.scrollTop = scrollTop;
  } else {
    obj.value += myValue;
    obj.focus();
   }
 }
})

// function setDimensions() {
//   var windowHeight = $(window).height();
//   var windowWidth = $(window).width();
//   var footerHeight = $(".footer").outerHeight();
//   var headerHeight = $(".header").outerHeight();
//   console.log($(".footer").height());
//   console.log($(".header"));

//   $(".content").each(function() {$(this).height(windowHeight-footerHeight-headerHeight);});
//   $(".content").each(function() {$(this).width(windowWidth);});
// }

// $("body").load(setDimensions());


// notes-content page: insert locally stored pages
function insertNote(noteName) {
  var numOfElements = $("#notes-list li").length - 3;

  // outer li div
  var listDiv = $("<li></li>");
  listDiv.attr("data-corners","false");
  listDiv.attr("data-shadow","false");
  listDiv.attr("data-iconshadow","true");
  listDiv.attr("data-wrapperels","div");
  listDiv.attr("data-icon","arrow-r");
  listDiv.attr("data-iconpos","right");
  listDiv.attr("class","ui-btn ui-btn-icon-right ui-li-has-arrow ui-li");
  listDiv.attr("data-theme", "d");

  // div containing text and button icon
  var textBtnDiv = $("<div></div>");
  textBtnDiv.attr("class","ui-btn-inner ui-li");
  textBtnDiv.appendTo(listDiv);

  // text div
  var textDiv = $("<div></div>");
  textDiv.attr("class", "ui-btn-text");
  textDiv.appendTo(textBtnDiv);

  // <a> element
  var hrefDiv = $("<a></a>");
  hrefDiv.attr("onclick","loadNotes(noteName)");
  hrefDiv.attr("ontap","loadNote(noteName)");
  hrefDiv.attr("class","ui-link-inherit");
  hrefDiv.val(noteName);
  hrefDiv.appendTo(textDiv);

  // right button
  var btnDiv = $("<span></span>");
  btnDiv.attr("class","ui-icon ui-icon-arrow-r ui-icon-shadow");
  btnDiv.val("&nbsp;")
  btnDiv.appendTo(textBtnDiv);
}

function insertTitle() {
  var title = $("#note-title").val();
  $("#editor-note-title").html(title);
}

//create-notes page: insert tags
function insertTag(tagName) {
	var tag = "<" + tagName +"></" + tagName + ">";

	$("#note-text").insertAtCaret(tag);
}

function insertHref(tag) {
  var html = "<" + tag + " href='insert url here'" + "></" + tag + ">";
  $("#note-text").insertAtCaret(html);
}

function insertType(tag, type) {
	var html = "<" + tag + " type='" + type + "'></" + tag + ">";

	$("#note-text").insertAtCaret(html);
}



// save notes functions
function storeLocally() {
  if(typeof(Storage) !== "undefined") {
    var title = $("#note-title").val();
    var notes = $("#note-text").val();
    localStorage.title = notes;
  }
  else {
    $("#save-button").addClass("ui-disabled");
  }
}

// calls server
// function saveNote() {
//   $.ajax({
//     url: '/add',
//     data: {
//       title: $("#note-title").val(),
//       user: "",
//       content: $("note-text").val()
//     }

//   }
//     )
// }

