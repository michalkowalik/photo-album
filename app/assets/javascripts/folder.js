/*jslint todo: true, regexp: true */
/*global $, localStorage, location, DirInfo, window, Bread, document, alert */
// Place all the behaviors and hooks related to the Slide controller:

// enable html in popovers:
var bread = new Bread('#bread'),
    li;

$(function () { $('.pop-div').popover({html: true});});


$(document).ready(function () {

    // warning:
    // that's an awful trick - on admin/folders there's no h2 element
    // but there's a #folders_table element
    // -- thats why the breadcrumb works.
    if ($('#folders_table').length > 0) {
        console.log("in folder.js");
        bread.clear();
        li = $('<li/>');
        $('<a/>', {
            html: "Folders",
            href: "/admin/folders"
        }).appendTo(li);
        bread.add(li);

        li = $('<li/>');
        $('<a/>', {
            html: $('h2').text(),
            href:  $(location).attr('href')
        }).appendTo(li);
        bread.add(li);
    }
});
