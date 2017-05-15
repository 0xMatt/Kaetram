/* global Modules, log, _ */

define(function() {

    return Class.extend({

        init: function(id, kind) {
            var self = this;

            self.id = id;
            self.kind = kind;

            self.x = 0;
            self.y = 0;
            self.gridX = 0;
            self.gridY = 0;

            self.name = '';

            self.sprite = null;
            self.spriteFlipX = false;
            self.spriteFlipY = false;

            self.animations = null;
            self.currentAnimation = null;

            self.shadowOffsetY = 0;

            self.spriteLoaded = false;
            self.visible = true;
            self.fading = false;

            self.loadDirty();
        },

        /**
         * This is important for when the client is
         * on a mobile screen. So the sprite has to be
         * handled differently.
         */

        loadDirty: function() {
            var self = this;

            self.dirty = true;

            if (self.dirtyCallback)
                self.dirtyCallback();
        },

        fadeIn: function(time) {
            var self = this;

            self.fading = true;
            self.fadingTime = time;
        },

        blink: function(speed) {
            var self = this;

            self.blinking = setInterval(function() {
                self.toggleVisibility();
            }, speed);
        },

        stopBlinking: function() {
            var self = this;

            if (self.blinking)
                clearInterval(self.blinking);

            self.setVisible(true);
        },

        setSprite: function(sprite) {
            var self = this;

            if (!sprite || (self.sprite && self.sprite.name === sprite.name))
                return;

            if (!sprite.loaded)
                sprite.load();

            self.sprite = sprite;

            self.normalSprite = self.sprite;
            self.hurtSprite = sprite.getHurtSprite();
            self.animations = sprite.createAnimations();

            self.spriteLoaded = true;

            if (self.readyCallback)
                self.readyCallback();
        },

        setPosition: function(x, y) {
            this.x = x;
            this.y = y;
        },

        setGridPosition: function(x, y) {
            var self = this;

            self.gridX = x;
            self.gridY = y;

            self.setPosition(x * 16, y * 16);
        },

        setAnimation: function(name, speed, count, onEndCount) {
            var self = this;

            if (!self.spriteLoaded || (self.currentAnimation && self.currentAnimation.name === name))
                return;

            var anim = self.getAnimationByName(name);

            if (!anim)
                return;

            if (name.substr(0, 3) === 'atk')
                self.currentAnimation.reset();

            self.currentAnimation.setSpeed(speed);

            self.currentAnimation.setCount(count ? count : 0, onEndCount || function() {
                self.idle();
            });
        },

        setVisible: function(visible) {
            this.visible = visible
        },

        getAnimationByName: function(name) {
            if (name in this.animations)
                return this.animations[name];

            return null;
        },

        getSprite: function() {
            return this.sprite.name;
        },

        toggleVisibility: function() {
            this.setVisible(!this.visible);
        },

        isPlayer: function() {
            return this.kind === Modules.Types.Player;
        },

        isVisible: function() {
            return this.visible;
        },

        hasShadow: function() {
            return false;
        },

        onReady: function(callback) {
            this.readyCallback = callback;
        },

        onDirty: function(callback) {
            this.dirtyCallback = callback;
        }

    });

});