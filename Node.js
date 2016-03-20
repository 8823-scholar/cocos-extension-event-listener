/**
 * node overrides
 */
cc.Node.implement({
    /**
     * on (EventManager wrapper) 
     *
     * node.onTap(function(){
     *     console.log("tapped");
     * });
     *
     * node.onHold(function(){
     *     console.log("tapped");
     * });
     *
     * node.onTouch(began, moved, ended);
     * node.onTouchBegan(callback);
     * node.onTouchMoved(callback);
     * node.onTouchEnded(callback);
     */
    onTap: function(callback) {
        var self = this;

        var listener = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowsTouches: true,
            onTouchBegan: function(touch, event) {
                return self.hitTestByPoint(touch.getLocation());
            },
            onTouchMoved: null,
            onTouchEnded: function(touch, event) {
                if (self.hitTestByPoint(touch.getLocation())) {
                    callback.call(self, touch);
                }
            },
        };

        cc.eventManager.addListener(listener, self);
    },
    onTouch: function(began, moved, ended) {
        var self = this;

        var listener = {
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowsTouches: true,
            onTouchBegan: function(touch, event) {
                return self.hitTestByPoint(touch.getLocation()) && (! began || began(touch, event));
            },
            onTouchMoved: moved,
            onTouchEnded: ended,
        };

        cc.eventManager.addListener(listener, self);
    },


    /**
     * get node content size
     */
    getBoundingBox: function() {
        if (this._contentSize && (this._contentSize.width || this._contentSize.height)) {
            var rect = cc.rect(0, 0, this._contentSize.width, this._contentSize.height);
            return cc._rectApplyAffineTransformIn(rect, this.getNodeToParentTransform());
        }

        var maxX = null;
        var minX = null;
        var maxY = null;
        var minY = null;
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];

            var a = child.getAnchorPoint();
            var s = child.getBoundingBox();
            var r = s.x + (s.width * (1 - a.x));
            var l = s.x - (s.width * a.x);
            var t = s.y + (s.height * (1 - a.y));
            var b = s.y - (s.height * a.y);
            if (maxX === null || maxX < r) maxX = r;
            if (minX === null || minX > l) minX = l;
            if (maxY === null || maxY < t) maxY = t;
            if (minY === null || minY > b) minY = b;
        }

        if (maxX === null) maxX = 0;
        if (minX === null) minX = 0;
        if (maxY === null) maxY = 0;
        if (minY === null) minY = 0;

        var rect = cc.rect(minX, minY, maxX - minX, maxY - minY);
        return cc._rectApplyAffineTransformIn(rect, this.getNodeToParentTransform());
    },


    /**
     * hit test
     */
    hitTestByPoint: function(point) {
        var size = this.getBoundingBox();
        var rect = cc.rect(size.x, size.y, size.width, size.height);
        return cc.rectContainsPoint(rect, this.convertToNodeSpace(point));
    },
});

