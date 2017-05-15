/* global log */

define(function() {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.camera = game.getCamera();
            self.renderer = game.renderer;
        },

        update: function() {
            this.animateTiles();
            this.updateCharacters();
        },

        animateTiles: function() {
            var self = this,
                time = self.game.time;

            self.renderer.forEachAnimatedTile(function(tile) {
                if (tile.animate(time)) {
                    tile.isDirty = true;
                    tile.dirtyRect = self.renderer.getTileBounds(tile);
                }
            });
        },

        updateCharacters: function() {
            var self = this;

            self.game.entities.forEachEntity(function(entity) {
                if (entity.spriteLoaded)
                    self.updateFading(entity);
            });
        },

        updateFading: function(entity) {
            var self = this;

            if (!entity || !entity.fading)
                return;

            var duration = 1000,
                time = self.game.time,
                dt = time - entity.fadingTime;

            if (dt > duration) {
                entity.isFading = false;
                entity.fadingAlpha = 1;
            } else
                entity.fadingAlpha = dt / duration;
        }

    });

});