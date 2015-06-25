/*jslint todo: true, regexp: true */
/*global $, localStorage, document, Bread, location, DirInfo, window */

/*
  pagination on dir page:
  should check if local storage contains key dir_id_[ID] - if not -
  send ajax request populate the photo array - mod 30, build chunks
  of pages
  Check if dir_id_[id]_page key is initialized, if not set to 1
  if yes, try to display n'th chunk.
  
  probably makes sense to delete all other dir_id*_page keys when
  entering new dir.
*/

(function () {
    'use strict';

    var pageObj,
        customBindingsDone = false;

    // the complete shabang as js object:
    function Page(folder_id) {
        this.folder_id = folder_id;
        // object for keeping paginated chunks of directory:
        this.paged = {};
        // pagination size. let's start with 30 thumbnails per page:
        this.paginationSize = 30;
        // current page to display: read value from localStorage,
        // initialize with 1 if missing.
        this.currentPage = localStorage.getItem("dir_id_" + this.folder_id + "page");
        if (!this.currentPage) {
            this.currentPage = 1;
            localStorage.setItem("dir_id_" + this.folder_id + "page", 1);
        }
        this.dirObj = '';
    }

    Page.prototype = {
        // get and set current page:
        getCurrentPage : function () {
            return this.currentPage;
        },
        setCurrentPage : function (n) {
            this.currentPage = n;
            localStorage.setItem("dir_id_" + this.folder_id + "page", n);
        },
        // save folder info to local storage (if it's not initialized yet!)
        saveToLocalStorage : function () {
            var storageKey = "dir_id_" + this.folder_id;
            if (!localStorage.getItem(storageKey)) {
                localStorage.setItem(
                    storageKey,
                    JSON.stringify(this.paged)
                );
            }
        },

        // display gallery for current page.
        // for now just delete all the content currently in the div and
        // start all over again:
        displayGallery : function () {
            $('#dirGallery').hide();
            $('#dirGallery').empty();

            // set counter button
            $('#btn_counter').text(this.getCurrentPage() + "/" + Object.keys(this.dirObj.paged).length);
            $.each(this.dirObj.paged[this.currentPage - 1], function (index, value) {
                $('<a/>', {
                    html: "<img alt=\"" + value.name + "\" src=\"" +
                        value.url.replace(/(http:\/\/.*\/)(.*)/, '$1thumbs/$2') + "\">",
                    href: "/slide/show/" + this.folder_id + "/" + value.id //value.url
                }).appendTo('#dirGallery');
            });
            $('#dirGallery').justifiedGallery({
                rowHeight: 120,
                margins: 3
            }).on('jg.complete', function (e) {
                $('#dirGallery').show();
            });
        },
        // TODO: add error checking!
        // show next page:
        nextPage : function () {
            if ($(document).find('#dirGallery').length > 0) {
                if (this.getCurrentPage() < Object.keys(this.dirObj.paged).length) {
                    var page = parseInt(this.getCurrentPage(), 10) + 1;
                    this.setCurrentPage(page);
                    this.displayGallery();
                }
            }
        },
        // show prev page:
        prevPage : function () {
            if ($(document).find('#dirGallery').length > 0) {
                if (this.getCurrentPage() > 1) {
                    var page = this.getCurrentPage() - 1;
                    this.setCurrentPage(page);
                    this.displayGallery();
                }
            }
        },
        // goto first page:
        firstPage : function () {
            this.setCurrentPage(1);
            this.displayGallery();
        },
        // goto last page:
        lastPage : function () {
            this.setCurrentPage(Object.keys(this.dirObj.paged).length);
            this.displayGallery();
        },
        modifyBreadcrumb : function () {
            var bread = new Bread('#bread'),
                dirName = $('#dirGallery').attr('data-foldername'),
                li = $('<li/>');
            $('<a/>', {
                html: dirName,
                href: $(location).attr('href')
            }).appendTo(li);
            bread.clear();
            bread.add(li);
        },

        getDirInfo : function (callback) {
            var that = this;
            this.dirObj = new DirInfo(this.folder_id);
            this.dirObj.getInfo(function () {that.modifyBreadcrumb(); callback();});
        }
        
    };

    // reset dir_id_[ID]page pointers in localStorage:
    function resetCurrentPages() {
        var i;
        for (i = 0; i < localStorage.length; i += 1) {
            if (localStorage.key(i).match(/dir_id.*page/)) {
                localStorage.removeItem(localStorage.key(i));
            }
        }
    }

    // Event handlers
    function customEventHandlers() {
        // next button:
        $('#btn_next').unbind();
        $('#btn_next').on('click', function () { pageObj.nextPage(); });
        // prev button:
        $('#btn_prev').unbind();
        $('#btn_prev').on('click', function () { pageObj.prevPage(); });
        // first button:
        $('#btn_first').unbind();
        $('#btn_first').on('click', function () { pageObj.firstPage(); });
        // last button:
        $('#btn_last').unbind();
        $('#btn_last').on('click', function () { pageObj.lastPage(); });
        // the same with arrow buttons:
        $(document).unbind('keydown');
        $(document).keydown(function (e) {
            if ($(document).find('#dirGallery').length > 0) {
                switch (e.which) {
                case 37:
                    e.preventDefault();
                    pageObj.prevPage();
                    break;
                case 39:
                    e.preventDefault();
                    pageObj.nextPage();
                    break;
                default:
                    return;
                }
                e.preventDefault();
            }
            customBindingsDone = true;
        });
    }
    
    // populate justified gallery for directory view
    // no need to execute anything for other pages.
    $(document).ready(function () {
        // index page:
        if ($(document).find('#folderGallery').length > 0) {
            resetCurrentPages();
            $("#folderGallery").justifiedGallery({
                rowHeight: 160,
                margins: 3
            });
        }

        // dir page:
        if ($(document).find('#dirGallery').length > 0) {
            console.log('on dir page');
            var dirId = $('#dirGallery').attr('data-folderid');
            pageObj = new Page(dirId);
            pageObj.getDirInfo(function () { pageObj.displayGallery(); });
            console.log('attempting bind keyboard events');
            if(!customBindingsDone) {
                customEventHandlers();
            }
        }
    });
}());

