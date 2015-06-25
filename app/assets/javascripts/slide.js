/*jslint todo: true, regexp: true */
/*global $, localStorage, location, DirInfo, window, Bread, document, alert, Microsoft*/
// Place all the behaviors and hooks related to the Slide controller:

(function () {
    "use strict";

    var slide;

    // Slide constructor -- to keep all the slide logic
    function Slide() {
        this.imgId = null;
        this.allImg = []; 
        this.allImgIds = [];
    } 

    // Slide prototype:
    Slide.prototype = {
        init : function (callback) {
            var res = [],
                dirId = $(location).attr('href').replace(/.*\/(\d+)\/.*/, "$1"),
                dir,
                that = this;

            if (localStorage.getItem('dirId_' + dirId) === null) {
                dir = new DirInfo(dirId);
                dir.getInfo(function () {
                    res = [];
                    $.each(JSON.parse(localStorage.getItem('dir_id_' + dirId)),
                           function (index, value) {
                            res = res.concat(value);
                        });
                    that.allImg = res;
                    that.allImgIds = res.map(function (o) {
                        return o.id;
                    });
                    callback();
                });
            } else {
                $.each(JSON.parse(localStorage.getItem('dir_id_' + dirId)),
                       function (index, value) {
                        res = res.concat(value);
                    });
                this.allImg = res;
                this.allImgIds = res.map(function (o) {
                    return o.id;
                });
                callback();
            }
        },
        insertMap : function (exifInfo) {
            var lat,
                lng,
                tmp,
                val,
                map, pin, mapDiv;

            //eval is evil, val is vil
            val = function (s) {
                var t = s.split("/");
                return parseInt(t[0], 10) / parseInt(t[1], 10);
            };
            
            tmp = JSON.parse(exifInfo.gps_latitude.replace(/[()]/g, "\""));
            lat = val(tmp[0]) + val(tmp[1]) / 60 + val(tmp[2]) / 3600;
            tmp = JSON.parse(exifInfo.gps_longitude.replace(/[()]/g, "\""));
            lng = val(tmp[0]) + val(tmp[1]) / 60 + val(tmp[2]) / 3600;
            if ($('#mapDiv').length < 1) {
                mapDiv = $('<div id="mapDiv"></div>').addClass('mapDiv');
                $('#side_col').append(mapDiv);
            }
            map = new Microsoft.Maps.Map(document.getElementById("mapDiv"), {
                credentials: "AgrMpO99q2K7hS1m4w0obsvttOrrIW5MD72UzBJVVgVqucqnbXl_T99ZzLFpG5yl",
                center: new Microsoft.Maps.Location(lat, lng),
                showScalebar: false,
                showDashboard: false,
                showMapTypeSelector: false,
                zoom: 11
                });

            pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(lat, lng)); 
            map.entities.push(pin);
        },
        renderTable : function (exifInfo) {
            var info = {},
                item,
                row,
                table;
            info["File Name"] = $('#img_col').attr('alt');
            if (exifInfo.description !== undefined) {
                info.Description = exifInfo.description;
            }
            info.Date =  (exifInfo.date_time_original === undefined) ?
                    exifInfo.date_time : exifInfo.date_time_original;
            info.Camera = (exifInfo.make === undefined) ?
                    undefined :
                    exifInfo.make + ' ' + exifInfo.model;
            info["Exposure Time"] = exifInfo.exposure_time;
            info.ISO = exifInfo.iso_speed_ratings;
            info.Aperture = exifInfo.aperture_value;
            info["Focal Lenght"] = exifInfo.focal_length;

            // remove empty rows:
            for (item in info) {
                if (info[item] === undefined) {
                    delete info[item];
                }
            }
            
            table = $('<table></table>')
                .addClass('table table-hover');
            $.each(info, function (index, value) {
                row = $('<tr></tr>');
                row.append('<td>' + index + '</td><td>' + value);
                table.append(row);
            });
            return table;
        },
        imgCounter : function () {
            if ($('#img_counter').length < 1) {
                $('#slide_info').append('<h2 id="img_counter"/>');
            }
            $('#img_counter').append((this.allImgIds.indexOf(parseInt(this.imgId, 10)) + 1) +
                                  '/' + this.allImgIds.length); 
       },
        
        // TODO: change name to reflect new functionality!
        info : function () {
            this.imgId = this.imgId || $(location).attr('pathname').replace(/.*\/(.*)/, "$1");
            var that = this;
            $.ajax({
                url: '/img/exif/' + this.imgId,
                type: 'GET',
                success: function (json) {
                    var table = that.renderTable(json.contents);
                    $('#slide_info').empty();
                    that.imgCounter();
                    $('#slide_info').append(table);
                    // add map if image contains gps info:
                    if (json.contents.hasOwnProperty("gps_latitude_ref")) {
                        that.insertMap(json.contents);
                    } else {
                        // remove the map div if exists in the DOM
                        if ($('#mapDiv')) {
                            $('#mapDiv').remove();
                        }
                    }
                    // set nav arrows: (stupid place, just for try)
                    that.navArrows();
                    that.resizeAndShowImg();
                }
            });
        },
        resizeAndShowImg : function () {
            var winHeight = $(window).height(),
                docHeight = $(document).height();

            if (docHeight > winHeight) {
                $('#img_col').css({'max-height' : (winHeight - 65) + 'px'});
            }
            $('img_col').show();
        },
        // folder name for ID:
        folderName : function () {
            return $('#img_col').attr('src').replace(/.*\/(.+)\/.+/, "$1");
        },
        updateBread : function () {
            var bread = new Bread('#bread'),
                li;

            if (bread.length() > 2) {
                bread.removeLast();
            }
            li = $('<li/>');
            $('<a/>', {
                html: $('#img_col').attr('alt'),
                href: $(location).attr('href')
            }).appendTo(li);
            bread.add(li);
        },
        navArrows : function () {
            var divWidth =  $('div.foo').width(),
                arrowTop = Math.round($('div.foo').height() / 2),
                imgWidth = $('#img_col').width(),
                arrowRightXPos = Math.round(divWidth / 2 + imgWidth / 2 + 30),
                arrowLeftXPos = Math.round(divWidth / 2 - imgWidth / 2 - 50);

            if (arrowLeftXPos < 0) {
                arrowLeftXPos = 0;
            }

            if (arrowRightXPos > divWidth) {
                arrowRightXPos = divWidth - 30;
            }

            $('#arrow_left').css({"top" : arrowTop + "px", "left" : arrowLeftXPos + "px"});
            $('#arrow_right').css({"top" : arrowTop + "px", "left" : arrowRightXPos + "px"});
            $('#arrow_left').show();
            $('#arrow_right').show();
        },
        // load image with AJAX, replace current one, update address
        // line and breadcrumb.
        loadImage : function (id) {
            var image = this.allImg[this.allImgIds.indexOf(id)],
                url = $(location).attr('href').replace(/(.*\/\d+)\/(.*)/, "$1/" + id),
                that = this;

            this.imgId = id;

            // change displayed image:
            $('#img_col').fadeOut(200, function () {
                $('#arrow_left').hide();
                $('#arrow_right').hide();
                
                $('#img_col').attr('src', image.url);
                $('#img_col').attr('alt', image.name);
                $('#img_col').fadeIn(200, function () {
                    that.navArrows();
                });
                console.log("image.name in loadImage: " + image.name);
                // update info:
                that.info();
                // update url and breadcrumb:
                window.history.pushState("", "", url);
                that.updateBread();

            });
        },
        // change slide:
        // +1 next
        // -1 previous
        changeSlide: function (i) {
            var next_id;

            if (this.allImgIds.indexOf(parseInt(this.imgId, 10)) + i >= this.allImgIds.length) {
                next_id = this.allImgIds[0];
            } else if (this.allImgIds.indexOf(parseInt(this.imgId, 10)) + i < 0) {
                next_id = this.allImgIds[this.allImgIds.length - 1];
            } else {
                next_id = this.allImgIds[this.allImgIds.indexOf(parseInt(this.imgId, 10)) + i];
            }
            this.loadImage(next_id);
        },        
    };

    // event handlers:
    function customHandlers() {
        if ($('#rev_nav').length < 1) {
            console.log("didn't find anything to bind click to");
        }
        $('#rev_nav').unbind();
        $('#rev_nav').click(function (event) {
            slide.changeSlide(-1);
            event.preventDefault();
        });
        $('#ffd_nav').unbind();
        $('#ffd_nav').click(function (event) {
            slide.changeSlide(1);
            event.preventDefault();
        });

        // arrow keys:
        $(document).unbind('keydown');
        $(document).keydown(function (e) {
            if ($(document).find('#img_col').length > 0) {
                switch (e.which) {
                case 37: // left
                    slide.changeSlide(-1);
                    e.preventDefault();
                    break;
                case 39: //right
                    slide.changeSlide(1);
                    e.preventDefault();
                    break;
                default:
                    return;
                }
            }
        });
    }

    $(document).ready(function () {
        if ($(document).find('#img_col').length > 0) {
            slide = new Slide();
            slide.init(function () {slide.info(); });
            slide.updateBread();
            customHandlers();
        }
    });
}());
