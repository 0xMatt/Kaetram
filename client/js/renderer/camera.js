/* global Modules, log */

define(function() {

    return Class.extend({

        init: function(renderer) {
            var self = this;

            self.renderer = renderer;

            self.offset = 0.5;
            self.x = 0;
            self.y = 0;
            self.gridX = 0;
            self.gridY = 0;

            self.prevGridX = 0;
            self.prevGridY = 0;

            self.speed = 1;
            self.panning = false;

            self.player = null;

            self.update();
        },

        update: function() {
            var self = this,
                factor = self.renderer.getScale();

            self.gridWidth = 15 * factor;
            self.gridHeight = 8 * factor;
        },

        setPosition: function(x, y) {
            var self = this;

            self.x = x;
            self.y = y;

            self.prevGridX = self.gridX;
            self.prevGridY = self.gridY;

            self.gridX = Math.floor(x / 16);
            self.gridY = Math.floor(y / 16);

            if (self.gridCallback && (self.prevGridX !== self.gridX || self.prevGridY !== self.gridY))
                self.gridCallback();
        },

        setGridPosition: function(x, y) {
            var self = this;

            self.prevGridX = self.gridX;
            self.prevGridY = self.gridY;

            self.gridX = x;
            self.gridY = y;

            self.x = self.gridX * 16;
            self.y = self.gridY * 16;

            if (self.gridCallback && (self.prevGridX !== self.gridX || self.prevGridY !== self.gridY))
                self.gridCallback();
        },

        loadCallbacks: function() {
            var self = this;

            self.player.onMove(function(x, y) {
                if (!self.panning)
                    self.setPosition(x, y);
            });
        },

        setPlayer: function(player) {
            var self = this;

            self.player = player;

            self.setPosition(self.player.x, self.player.y);

            self.loadCallbacks();
        },

        handlePanning: function(direction) {
            var self = this;

            switch (direction) {
                case Modules.Keys.Up:
                    self.setPosition(self.x, self.y - 1);
                    break;

                case Modules.Keys.Down:
                    self.setPosition(self.x, self.y + 1);
                    break;

                case Modules.Keys.Left:
                    self.setPosition(self.x - 1, self.y);
                    break;

                case Modules.Keys.Right:
                    self.setPosition(self.x + 1, self.y);
                    break;
            }
        },

        forEachVisiblePosition: function(callback) {
            var self = this;

            for(var y = self.gridY - 1, maxY = y + self.gridHeight + 2; y < maxY; y++) {
                for(var x = self.gridX - 1, maxX = x + self.gridWidth + 2; x < maxX; x++)
                    callback(x, y);
            }
        },

        onGridChange: function(callback) {
            this.gridCallback = callback;
        }

    });

});