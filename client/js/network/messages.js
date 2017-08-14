/* global log, _, Packets */

define(function() {


    return Class.extend({

        /**
         * Do not clutter up the Socket class with callbacks,
         * have this class here until a better method arises in my head.
         *
         * This class should not have any complex functionality, its main
         * role is to provide organization for packets and increase readability
         *
         * Please respect the order of the Packets Enum and arrange functions
         * accordingly.
         */

        init: function(app) {
            var self = this;

            self.app = app;

            self.messages = [];

            self.messages[Packets.Handshake] = self.receiveHandshake;
            self.messages[Packets.Welcome] = self.receiveWelcome;
            self.messages[Packets.Spawn] = self.receiveSpawn;
            self.messages[Packets.Equipment] = self.receiveEquipment;
            self.messages[Packets.List] = self.receiveEntityList;
            self.messages[Packets.Sync] = self.receiveSync;
            self.messages[Packets.Movement] = self.receiveMovement;
            self.messages[Packets.Teleport] = self.receiveTeleport;
            self.messages[Packets.Despawn] = self.receiveDespawn;
            self.messages[Packets.Combat] = self.receiveCombat;
            self.messages[Packets.Animation] = self.receiveAnimation;
            self.messages[Packets.Projectile] = self.receiveProjectile;
            self.messages[Packets.Population] = self.receivePopulation;
            self.messages[Packets.Points] = self.receivePoints;
            self.messages[Packets.Network] = self.receiveNetwork;
            self.messages[Packets.Chat] = self.receiveChat;
            self.messages[Packets.Command] = self.receiveCommand;
            self.messages[Packets.Inventory] = self.receiveInventory;
            self.messages[Packets.Bank] = self.receiveBank;
            self.messages[Packets.Ability] = self.receiveAbility;
            self.messages[Packets.Quest] = self.receiveQuest;
            self.messages[Packets.Notification] = self.receiveNotification;
            self.messages[Packets.Blink] = self.receiveBlink;
            self.messages[Packets.Heal] = self.receiveHeal;
            self.messages[Packets.Experience] = self.receiveExperience;
            self.messages[Packets.Death] = self.receiveDeath;
            self.messages[Packets.Audio] = self.receiveAudio;
            self.messages[Packets.NPC] = self.receiveNPC;
            self.messages[Packets.Respawn] = self.receiveRespawn;
            self.messages[Packets.Enchant] = self.receiveEnchant;

        },

        handleData: function(data) {
            var self = this,
                packet = data.shift();

            if (self.messages[packet] && _.isFunction(self.messages[packet]))
                self.messages[packet].call(self, data);
        },

        handleBulkData: function(data) {
            var self = this;

            _.each(data, function(message) {
                self.handleData(message);
            });
        },

        handleUTF8: function(message) {
            var self = this;

            self.app.toggleLogin(false);

            switch (message) {

                case 'updated':
                    self.app.sendError(null, 'The client has been updated, please refresh using CTRL!');
                    break;

                case 'full':
                    self.app.sendError(null, 'The servers are currently full!');
                    break;

                case 'error':
                    self.app.sendError(null, 'The server has responded with an error!');
                    break;

                case 'development':
                    self.app.sendError(null, 'The game is currently in development mode.');
                    break;

                case 'disallowed':
                    self.app.sendError(null, 'The server is currently not accepting connections!');
                    break;

                case 'maintenance':
                    self.app.sendError(null, 'The server is currently under maintenance.');
                    break;

                case 'userexists':
                    self.app.sendError(null, 'The username you have chosen already exists.');
                    break;

                case 'emailexists':
                    self.app.sendError(null, 'The email you have chosen is not available.');
                    break;

                case 'loggedin':
                    self.app.sendError(null, 'The player is already logged in!');
                    break;

                case 'invalidlogin':
                    self.app.sendError(null, 'You have entered the wrong username or password.');
                    break;

                case 'malform':
                    self.app.game.handleDisconnection(true);

                    self.app.sendError(null, 'Client has experienced a malfunction (stop trying to bypass stuff).');
                    break;

                default:
                    self.app.sendError(null, 'An unknown error has occurred, please refer to the forums.');
                    break;
            }
        },

        /**
         * Data Receivers
         */

        receiveHandshake: function(data) {
            var self = this;

            if (self.handshakeCallback)
                self.handshakeCallback(data.shift());
        },

        receiveWelcome: function(data) {
            var self = this,
                playerData = data.shift();

            if (self.welcomeCallback)
                self.welcomeCallback(playerData);
        },

        receiveSpawn: function(data) {
            var self = this;

            if (self.spawnCallback)
                self.spawnCallback(data);
        },

        receiveEquipment: function(data) {
            var self = this,
                equipType = data.shift(),
                equipInfo = data.shift();

            if (self.equipmentCallback)
                self.equipmentCallback(equipType, equipInfo);
        },

        receiveEntityList: function(data) {
            var self = this;

            if (self.entityListCallback)
                self.entityListCallback(data);
        },

        receiveSync: function(data) {
            var self = this;

            if (self.syncCallback)
                self.syncCallback(data.shift());
        },

        receiveMovement: function(data) {
            var self = this,
                movementData = data.shift();

            if (self.movementCallback)
                self.movementCallback(movementData);
        },

        receiveTeleport: function(data) {
            var self = this,
                teleportData = data.shift();

            if (self.teleportCallback)
                self.teleportCallback(teleportData);
        },

        receiveDespawn: function(data) {
            var self = this,
                id = data.shift();

            if (self.despawnCallback)
                self.despawnCallback(id);
        },

        receiveCombat: function(data) {
            var self = this,
                combatData = data.shift();

            if (self.combatCallback)
                self.combatCallback(combatData);
        },

        receiveAnimation: function(data) {
            var self = this,
                id = data.shift(),
                info = data.shift();

            if (self.animationCallback)
                self.animationCallback(id, info);
        },

        receiveProjectile: function(data) {
            var self = this,
                type = data.shift(),
                info = data.shift();

            if (self.projectileCallback)
                self.projectileCallback(type, info);
        },

        receivePopulation: function(data) {
            var self = this;

            if (self.populationCallback)
                self.populationCallback(data.shift());
        },

        receivePoints: function(data) {
            var self = this,
                pointsData = data.shift();

            if (self.pointsCallback)
                self.pointsCallback(pointsData);
        },

        receiveNetwork: function(data) {
            var self = this,
                opcode = data.shift();

            if (self.networkCallback)
                self.networkCallback(opcode);
        },

        receiveChat: function(data) {
            var self = this,
                info = data.shift();

            if (self.chatCallback)
                self.chatCallback(info);
        },

        receiveCommand: function(data) {
            var self = this,
                info = data.shift();

            if (self.commandCallback)
                self.commandCallback(info);
        },

        receiveInventory: function(data) {
            var self = this,
                opcode = data.shift(),
                info = data.shift();

            if (self.inventoryCallback)
                self.inventoryCallback(opcode, info);
        },

        receiveBank: function(data) {
            var self = this,
                opcode = data.shift(),
                info = data.shift();

            if (self.bankCallback)
                self.bankCallback(opcode, info);
        },

        receiveAbility: function(data) {
            var self = this,
                opcode = data.shift(),
                info = data.shift();

            if (self.abilityCallback)
                self.abilityCallback(opcode, info);
        },

        receiveQuest: function(data) {
            var self = this,
                opcode = data.shift(),
                info = data.shift();

            if (self.questCallback)
                self.questCallback(opcode, info);
        },

        receiveNotification: function(data) {
            var self = this,
                opcode = data.shift(),
                message = data.shift();

            if (self.notificationCallback)
                self.notificationCallback(opcode, message);
        },

        receiveBlink: function(data) {
            var self = this,
                instance = data.shift();

            if (self.blinkCallback)
                self.blinkCallback(instance);
        },

        receiveHeal: function(data) {
            var self = this;

            if (self.healCallback)
                self.healCallback(data.shift());
        },

        receiveExperience: function(data) {
            var self = this;

            if (self.experienceCallback)
                self.experienceCallback(data.shift());
        },

        receiveDeath: function(data) {
            var self = this;

            if (self.deathCallback)
                self.deathCallback(data.shift());
        },

        receiveAudio: function(data) {
            var self = this;

            if (self.audioCallback)
                self.audioCallback(data.shift());
        },

        receiveNPC: function(data) {
            var self = this,
                opcode = data.shift(),
                info = data.shift();

            if (self.npcCallback)
                self.npcCallback(opcode, info);
        },

        receiveRespawn: function(data) {
            var self = this,
                id = data.shift(),
                x = data.shift(),
                y = data.shift();

            if (self.respawnCallback)
                self.respawnCallback(id, x, y);
        },

        receiveEnchant: function(data) {
            var self = this,
                opcode = data.shift(),
                info = data.shift();

            if (self.enchantCallback)
                self.enchantCallback(opcode, info);
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

        onEquipment: function(callback) {
            this.equipmentCallback = callback;
        },

        onEntityList: function(callback) {
            this.entityListCallback = callback;
        },

        onSync: function(callback) {
            this.syncCallback = callback;
        },

        onMovement: function(callback) {
            this.movementCallback = callback;
        },

        onTeleport: function(callback) {
            this.teleportCallback = callback;
        },

        onDespawn: function(callback) {
            this.despawnCallback = callback;
        },

        onCombat: function(callback) {
            this.combatCallback = callback;
        },

        onAnimation: function(callback) {
            this.animationCallback = callback;
        },

        onProjectile: function(callback) {
            this.projectileCallback = callback;
        },

        onPopulation: function(callback) {
            this.populationCallback = callback;
        },

        onPoints: function(callback) {
            this.pointsCallback = callback;
        },

        onNetwork: function(callback) {
            this.networkCallback = callback;
        },

        onChat: function(callback) {
            this.chatCallback = callback;
        },

        onCommand: function(callback) {
            this.commandCallback = callback;
        },

        onInventory: function(callback) {
            this.inventoryCallback = callback;
        },

        onBank: function(callback) {
            this.bankCallback = callback;
        },

        onAbility: function(callback) {
            this.abilityCallback = callback;
        },

        onQuest: function(callback) {
            this.questCallback = callback;
        },

        onNotification: function(callback) {
            this.notificationCallback = callback;
        },

        onBlink: function(callback) {
            this.blinkCallback = callback;
        },

        onHeal: function(callback) {
            this.healCallback = callback;
        },

        onExperience: function(callback) {
            this.experienceCallback = callback;
        },

        onDeath: function(callback) {
            this.deathCallback = callback;
        },

        onAudio: function(callback) {
            this.audioCallback = callback;
        },

        onNPC: function(callback) {
            this.npcCallback = callback;
        },

        onRespawn: function(callback) {
            this.respawnCallback = callback;
        },

        onEnchant: function(callback) {
            this.enchantCallback = callback;
        }

    });

});