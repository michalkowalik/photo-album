/*jslint todo: true, regexp: true */
/*global $, localStorage, location, DirInfo, window, Bread, document, alert */
// Place all the behaviors and hooks related to the Slide controller:

(function () {
    "use strict";

    // reindex single folder:
    function reindex(el) {
        var folder_name = el.parentNode.parentNode.getAttribute("data-foldername");
        console.log(folder_name);
        $.ajax({
            url: '/img/reindex_folder/' + folder_name,
            type: 'GET',
            success: function (json) {
                alert('reindexing ' + folder_name + ' finished.');
                console.log(json);
            }
        });
        alert("reindexing " + folder_name);
    }


    $(document).ready(function () {
        if ($('#reindex-div').length > 0 ) {
            $('#reindex-btn').click(function (event) {
                console.log(event);
                $.ajax({
                    url: '/img/index_folders',
                    type: 'GET',
                    success: function (json) {
                        console.log(json);
                        alert('Reindexing finished');
                    }
                });
            });
            $('.btn-reindex-single').click(function (event) {
                console.log(event); 
                reindex(event.target);
            });
        }
    });
}());
