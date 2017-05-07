/* global log */

define(['jquery'], function($) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.renderer = self.game.renderer;
            self.supportsWorker = self.game.app.hasWorker();

            self.data = [];
            self.tilesets = [];
            self.grid = null;

            self.tilesetsLoaded = false;
            self.mapLoaded = false;

            self.load();
            self.loadTilesets();

            self.ready();
        },

        ready: function() {
            var self = this,
                rC = function() {
                    if (self.readyCallback)
                        self.readyCallback();
                };

            if (self.mapLoaded && self.tilesetsLoaded)
                rC();
            else
                setTimeout(function() { self.ready(); }, 50);

        },

        load: function() {
            var self = this;

            if (self.supportsWorker) {
                log.info('Parsing map with Web Workers...');

                var worker = new Worker('./js/map/mapworker.js');
                worker.postMessage(1);

                worker.onmessage = function(event) {
                    var map = event.data;

                    self.parseMap(map);
                    self.grid = map.grid;
                    self.mapLoaded = true;
                }
            } else {
                log.info('Parsing map with Ajax...');

                $.get('data/maps/world_client.json', function(data) {
                    self.parseMap(data);
                    self.loadCollisions();
                    self.mapLoaded = true;
                }, 'json');
            }
        },

        loadTilesets: function() {
            var self = this;

            /**
             * The tile-sheet of scale one is never used because
             * of its wrong proportions. Interesting enough, this would mean
             * that neither the entities would be necessary.
             */

            self.tilesets.push(self.loadTileset('img/2/tilesheet.png'));

            if (!self.renderer.mobile && !self.renderer.tablet)
                self.tilesets.push(self.loadTileset('img/3/tilesheet.png'));

            self.tilesetsLoaded = true;
        },

        loadTileset: function(path) {
            var self = this,
                tileset = new Image();

            tileset.crossOrigin = 'Anonymous';
            tileset.src = path;

            tileset.onload = function() {
                if (tileset.width % self.tileSize > 0)
                    throw Error('The tile size is malformed in the tile set: ' + path);
            };

            return tileset;
        },

        parseMap: function(map) {
            var self = this;

            self.width = map.width;
            self.height = map.height;
            self.tileSize = map.tilesize;
            self.data = map.data;
            self.blocking = map.blocking || [];
            self.collisions = map.collisions;
            self.high = map.high;
            self.animated = map.animated;
        },

        loadCollisions: function() {
            var self = this;

            self.grid = [];

            for (var i = 0; i < self.height; i++) {
                self.grid[i] = [];
                for (var j = 0; j < self.width; j++)
                    self.grid[i][j] = 0;
            }

            for (var c = 0; c < self.collisions.length; c++) {
                var cPosition = self.indexToGridPosition(self.collisions[c] + 1);
                self.grid[cPosition.x][cPosition.y] = 1;
            }

            for (var b = 0; b < self.blocking.length; b++) {
                var bPosition = self.indexToGridPosition(self.blocking[b] + 1);
                if (self.grid[bPosition.y] !== undefined)
                    self.grid[bPosition.y][bPosition.x] = 1;
            }
        },

        indexToGridPosition: function(index) {
            var self = this;

            index -= 1;

            var x = self.getX(index + 1, self.width),
                y = Math.floor(index / self.width);

            return {
                x: x,
                y: y
            }
        },

        gridPositionToIndex: function(x, y) {
            return y * this.width + x + 1;
        },

        isColliding: function(x, y) {
            var self = this;

            if (self.isOutOfBounds(x, y) || !self.grid)
                return false;

            return self.grid[y][x] === true;
        },

        isHighTile: function(id) {
            return _.indexOf(this.high, id + 1) >= 0;
        },

        isAnimatedTile: function(id) {
            return id + 1 in this.animated;
        },

        isOutOfBounds: function(x, y) {
            return isInt(x) && isInt(y) && (x < 0 || x >= this.width || y < 0 || y >= this.height);
        },

        getX: function(index, width) {
            if (index === 0)
                return 0;

            return (index % width === 0) ? width - 1 : (index % width) - 1;
        },

        getTileAnimationLength: function(id) {
            return this.animated[id + 1].l;
        },

        getTileAnimationDelay: function(id) {
            var properties = this.animated[id + 1];

            return properties.d ? properties.d : 100;
        },

        onReady: function(callback) {
            this.readyCallback = callback;
        }

    });

});