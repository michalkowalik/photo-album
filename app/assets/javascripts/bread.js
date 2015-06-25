/*jslint todo: true, regexp: true */
/*global $ */

// breadcrumb operations 
function Bread(id) {
    this.breadId = id;
    this.breadItems = $("ul.breadcrumb > li").toArray();
}

Bread.prototype = {
    removeLast : function() {
        var last = this.breadItems.pop();
        $(last).remove();
        return this.breadItems.pop();
    },
    
    add : function(html) {
        $(this.breadId).append(html);
    },
    
    length : function() {
        return this.breadItems.length;
    },

    // remove everything but root:
    clear : function() {
        while(this.length > 1) {
            this.removeLast();
        }
    }
};
