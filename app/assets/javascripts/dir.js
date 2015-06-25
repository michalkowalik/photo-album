/*jslint todo: true, regexp: true */
/*global $, localStorage, location, DirInfo, window, Bread, document */

function DirInfo(id) {
    "use strict";

    this.id = id;
    this.paginationSize = 30;
    this.photos = [];
    this.paged = {};
    this.updated_at = '';
}

DirInfo.prototype = {
    saveToLocalStorage : function () {
        "use strict";
        var storageKey = "dir_id_" + this.id;
        if (!localStorage.getItem(storageKey)) {
            localStorage.setItem(
                storageKey,
                JSON.stringify(this.paged)
            );
        }
    },
    getPaged : function (photos) {
        "use strict";
        var p = {},
            i;
        if (photos.length <= this.paginationSize) {
            p[0] = photos;
            return p;
        }
        for (i = 0; i < Math.round(photos.length / this.paginationSize); i += 1) {
            p[i] = photos.slice(i * this.paginationSize, (i + 1) * this.paginationSize);
        }
        return p;
    },

    getLastUpdated : function () {
        $.ajax({
            url: '/img/last_updated/' + this.id,
            type: 'GET',
            success: function (json) {
                JSON.stringyfy(json);
            }
        });
    },
    
    // that's ajax call -- rest should be done in callback.
    getInfo : function (callback) {
        "use strict";
        var storageKey = "dir_id_" + this.id,
            that = this,
            storedPaged;
        // folder timestamp should be always checked:
        $.ajax({
            url: '/img/last_updated/' + this.id,
            type: 'GET',
            success: function (json) {
                // check the result against the local storage.
                // if updatedKey doesn't eixst or not equal to value
                // returned by ajax call, update the key, call
                // dir_index.
                var lastUpdated = localStorage.getItem("dir_id_" + that.id + "_updated");
                if (!lastUpdated || lastUpdated !== json) {
                    localStorage.setItem(
                        "dir_id_" + that.id + "_updated",
                        JSON.stringify(json)
                    );
                    localStorage.removeItem(storageKey);
                    $.ajax({
                        url: '/dir_index/' + that.id,
                        type: 'GET',
                        success: function (json) {
                            that.photos = json.photo;
                            that.updated_at = json.updated_at;
                            that.paged = that.getPaged(json.photo);
                            that.saveToLocalStorage();
                            callback();
                        }
                    });
                } else {
                    // 2 options:
                    // 1: if localstorage contains the key -- serve
                    // the paged
                    // 2: populate paged.
                    storedPaged = localStorage.getItem(storageKey);
                    if (storedPaged) {
                        that.paged = JSON.parse(localStorage.getItem(storageKey));
                    } else {
                        $.ajax({
                            url: '/dir_index/' + that.id,
                            type: 'GET',
                            success: function (json) {
                                that.photos = json.photo;
                                that.paged = that.getPaged(json.photo);
                                that.saveToLocalStorage();
                                callback();
                            }
                        }); 
                    }
                }
            }
        });
    }
};
