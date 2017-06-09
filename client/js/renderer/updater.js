/* global log, Modules */

define(['../entity/character/character'], function(Character) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.camera = game.getCamera();
            self.renderer = game.renderer;
            self.input = game.input;
            self.sprites = null;
        },

        update: function() {
            this.animateTiles();
            this.updateCharacters();
            this.input.updateCursor();
            this.updateKeyboard();
            this.updateAnimations();
            this.verifyScale();
            this.updateInfos();
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

                var animation = entity.currentAnimation;

                if (animation && animation.update(self.game.time))
                    entity.loadDirty();

                if (entity.movement && entity.movement.inProgress)
                    entity.movement.step(self.game.time);

                if (entity instanceof Character && entity.hasPath() && !entity.movement.inProgress) {
                    var tick = Math.round(16 / Math.round((entity.movementSpeed / (1000 / 60))));

                    switch (entity.orientation) {
                        case Modules.Orientation.Left:

                            entity.movement.start(self.game.time,
                                function(x) {
                                    entity.x = x;
                                    entity.moved();
                                },
                                function() {
                                    entity.x = entity.movement.endValue;
                                    entity.moved();
                                    entity.nextStep();
                                },
                                entity.x - tick,
                                entity.x - 16,
                                entity.movementSpeed);

                            break;

                        case Modules.Orientation.Right:

                            entity.movement.start(self.game.time,
                                function(x) {
                                    entity.x = x;
                                    entity.moved();
                                },
                                function() {
                                    entity.x = entity.movement.endValue;
                                    entity.moved();
                                    entity.nextStep();
                                },
                                entity.x + tick,
                                entity.x + 16,
                                entity.movementSpeed);

                            break;

                        case Modules.Orientation.Up:

                            entity.movement.start(self.game.time,
                                function(y) {
                                    entity.y = y;
                                    entity.moved();
                                },
                                function() {
                                    entity.y = entity.movement.endValue;
                                    entity.moved();
                                    entity.nextStep();
                                },
                                entity.y - tick,
                                entity.y - 16,
                                entity.movementSpeed);

                            break;

                        case Modules.Orientation.Down:

                            entity.movement.start(self.game.time,
                                function(y) {
                                    entity.y = y;
                                    entity.moved();
                                },
                                function() {
                                    entity.y = entity.movement.endValue;
                                    entity.moved();
                                    entity.nextStep();
                                },
                                entity.y + tick,
                                entity.y + 16,
                                entity.movementSpeed);

                            break;
                    }
                }

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
        },

        updateKeyboard: function() {
            var self = this,
                player = self.game.player,
                position = {
                    x: player.gridX,
                    y: player.gridY
                };

            if (player.frozen)
                return;

            if (player.direction === 'up')
                position.y--;
            else if (player.direction === 'down')
                position.y++;
            else if (player.direction === 'right')
                position.x++;
            else if (player.direction === 'left')
                position.x--;

            if (player.direction)
                self.input.keyMove(position);

        },

        updateAnimations: function() {
            var self = this,
                target = self.input.targetAnimation;

            if (target)
                target.update(self.game.time);

            if (!self.sprites)
                return;

            var sparks = self.sprites.sparksAnimation;

            if (sparks)
                sparks.update(self.game.time);
        },

        verifyScale: function() {
            var self = this,
                scale = self.renderer.getDrawingScale();

            if (self.renderer.tileset && self.renderer.tileset.scale !== scale)
                self.game.map.updateTileset();

        },

        updateInfos: function() {
            if (this.game.info)
                this.game.info.update(this.game.time);
        },

        setSprites: function(sprites) {
            this.sprites = sprites;
        }

    });

});