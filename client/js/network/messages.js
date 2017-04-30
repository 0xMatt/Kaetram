define(function() {

    return Class.extend({

        /**
         * Do not clutter up the Socket class with callbacks,
         * have this class here until a better method arises in my head.
         *
         * This class should not have any complex functionality, its main
         * role is to provide organization for packets and increase readability
         */

        init: function(app) {
            var self = this;

            self.app = app;

            self.messages = [];

            self.messages[Packets.Handshake] = self.receiveHandshake;
            self.messages[Packets.Welcome] = self.receiveWelcome;
            self.messages[Packets.Spawn] = self.receiveSpawn;
            self.messages[Packets.Error] = self.receiveError;
        },

        handleData: function(data) {
            var self = this,
                packet = data.shift();

            if (self.messages[packet] && _.isFunction(self.messages[packet]))
                self.messages[packet].call(self, data);
        },

        handleUTF8: function(message) {
            var self = this;

            if (message === 'ready') {
                self.app.updateLoader('Client ready for data!');
                return;
            }

            self.app.toggleLogin(false);

            switch (message) {
                case 'updated':
                    self.app.sendError(null, 'The client has been updated, please refresh using CTRL!');
                    break;

                case 'full':
                    self.app.sendError(null, 'The servers are currently full!');
                    break;

                case 'disallowed':
                    self.app.sendError(null, 'The server is currently not accepting connections!');
                    break;
            }
        },

        /**
         * Data Receivers
         */

        receiveHandshake: function(data) {
            var self = this,
                serverVersion = data.shift(),
                clientId = data.shift(),
                canProceed = data.shift();

            if (self.handshakeCallback)
                self.handshakeCallback(serverVersion, clientId, canProceed);
        },

        receiveWelcome: function(data) {
            var self = this,
                playerData = data.shift();

            if (self.welcomeCallback)
                self.welcomeCallback(playerData);
        },

        receiveSpawn: function(data) {
            var self = this,
                id = data.shift(),
                type = data.shift(),
                x = data.shift(),
                y = data.shift(),
                count = data.shift(); //For items

            if (self.spawnCallback)
                self.spawnCallback(id, type, x, y, count);
        },

        receiveError: function(data) {
            var self = this,
                type = data.shift(),
                message = data.shift();

            if (self.errorCallback)
                self.errorCallback(type, message);
        },

        /**
         * Universal Callbacks
         */

        onHandshake: function(callback) {
            this.handshakeCallback = callback;
        },

        onWelcome: function(callback) {
            this.welcomeCallback = callback;
        },

        onSpawn: function(callback) {
            this.spawnCallback = callback;
        },

        onError: function(callback) {
            this.errorCallback = callback;
        }

    });

});