var cls = require('../lib/class'),
    Packets = require('../network/packets'),
    Request = require('request'),
    config = require('../../config.json'),
    Creator = require('../database/creator'),
    _ = require('underscore'),
    Messages = require('../network/messages');

module.exports = Incoming = cls.Class.extend({

    init: function(player) {
        var self = this;

        self.player = player;
        self.connection = self.player.connection;
        self.world = self.player.world;
        self.mysql = self.player.mysql;

        self.connection.listen(function(data) {

            var packet = data.shift(),
                message = data[0];

            switch(packet) {

                case Packets.Intro:
                    self.handleIntro(message);
                    break;

                case Packets.Ready:
                    self.handleReady(message);
                    break;

                case Packets.Step:
                    self.handleStep(message);
                    break;

                case Packets.Who:
                    self.handleWho(message);
                    break;

            }

        });
    },

    handleIntro: function(message) {
        var self = this,
            loginType = message.shift(),
            username = message.shift().toLowerCase(),
            password = message.shift(),
            isRegistering = loginType === Packets.IntroOpcode.Register,
            email = isRegistering ? message.shift() : '',
            formattedUsername = username.charAt(0).toUpperCase() + username.slice(1);

        self.player.username = formattedUsername.substr(0, 32).trim();
        self.player.password = password.substr(0, 32);
        self.player.email = email.substr(0, 128);

        if (config.offlineMode) {
            var creator = new Creator(null);

            self.player.isNew = true;
            self.player.load(creator.getPlayerData(self.player));
            self.player.isNew = false;
            self.player.intro();

            return;
        }

        if (isRegistering) {
            var registerOptions = {
                method: 'POST',
                uri: 'https://forum.taptapadventure.com/api/v1/users',
                form: {
                    'username': self.player.username.toLowerCase(),
                    'password': self.player.password,
                    'email': self.player.email,
                    '_uid': '9a4c5ddb-5ce6-4a01-a14f-3ae49d8c6507'
                }
            };

            Request(registerOptions, function(error, reponse, body) {
                log.info(body);
                //TODO - Redo registration API on the website
            });

            /*var registerOptions = {
                method: 'GET',
                uri: 'https://taptapadventure.com/api/register.php?a=9a4c5ddb-5ce6-4a01-a14f-3ae49d8c6507&u=' + self.player.username.toLowerCase() + '&p=' + self.player.password + '&e=' + self.player.email
            };

            Request(registerOptions, function(error, response, body) {
                log.info(body);
                
                switch(JSON.parse(JSON.parse(body).data).code) {
                    case 'ok':
                        self.mysql.register(self.player);
                        break;

                    default:
                        self.connection.sendUTF8('userexists');
                        self.connection.close('Username: ' + username + ' not available.');
                        break;
                }
            });*/
        } else {
            var loginOptions = {
                method: 'POST',
                uri: 'https://forum.taptapadventure.com/api/ns/login',
                form: {
                    'username': self.player.username.toLowerCase(),
                    'password': self.player.password
                }
            };

            Request(loginOptions, function(error, response, body) {
                var data;

                /**
                 * The website may respond with HTML message if
                 * the forums are down. In this case we catch any
                 * exception and ensure it does not proceed any
                 * further. We tell players that the server doesn't
                 * allow connections.
                 */

                try {
                    data = JSON.parse(body);
                } catch (e) {
                    log.info('Could not decipher API message');
                    self.connection.sendUTF8('disallowed');
                    self.connection.close('API response is malformed!')
                }

                if (data && data.message) {
                    self.connection.sendUTF8('invalidlogin');
                    self.connection.close('Wrong password entered for: ' + self.player.username);
                } else {
                    if (self.world.playerInWorld(self.player.username)) {
                        self.connection.sendUTF8('disallowed');
                        self.connection.close('Player already logged in..');
                        return;
                    }

                    self.mysql.login(self.player);
                }
            });
        }
    },

    handleReady: function(message) {
        var self = this,
            isReady = message.shift();

        if (!isReady)
            return;

        self.player.ready = true;
        self.player.sendEquipment();
        self.world.handleEntityGroup(self.player);
        self.world.pushEntities(self.player);
    },

    handleStep: function(message) {
        var self = this,
            x = message.shift(),
            y = message.shift();

        log.info('[Incoming] Position: ' + x + ' ' + y);
    },

    handleWho: function(message) {
        var self = this;

        _.each(message.shift(), function(id) {
            var entity = self.world.getEntityById(id);

            if (entity && entity.id)
                self.player.send(new Messages.Spawn(entity));

        });
    }

});