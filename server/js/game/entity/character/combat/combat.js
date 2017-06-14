/* global log */

var cls = require('../../../../lib/class'),
    CombatQueue = require('./combatqueue'),
    Utils = require('../../../../util/utils'),
    Formulas = require('../../../formulas'),
    _ = require('underscore'),
    Hit = require('./hit'),
    Modules = require('../../../../util/modules'),
    Messages = require('../../../../network/messages'),
    Packets = require('../../../../network/packets');

/**
 * Author: Tachyon
 * Company: uDeva 2017
 */

module.exports = Combat = cls.Class.extend({

    init: function(character) {
        var self = this;

        self.character = character;
        self.world = null;

        self.attackers = {};

        self.retaliate = false;

        self.queue = new CombatQueue();

        self.attacking = false;

        self.attackLoop = null;
        self.followLoop = null;
        self.checkLoop = null;

        self.first = false;
        self.started = false;
        self.lastAction = -1;
        self.lastHit = -1;

        self.cleanTimeout = null;
    },

    start: function() {
        var self = this;

        if (self.started)
            return;

        self.lastAction = new Date();

        self.attackLoop = setInterval(function() { self.parseAttack(); }, self.character.attackRate);

        self.followLoop = setInterval(function() { self.parseFollow(); }, 400);

        self.checkLoop = setInterval(function() {
            var time = new Date();

            if (time - self.lastAction > 5000)
                self.stop();

        }, 1000);

        self.started = true;
    },

    stop: function() {
        var self = this;

        if (!self.started)
            return;

        clearInterval(self.attackLoop);
        clearInterval(self.followLoop);
        clearInterval(self.checkLoop);

        self.attackLoop = null;
        self.followLoop = null;
        self.checkLoop = null;

        self.started = false;

        self.cleanTimeout = setTimeout(function() {
            if (new Date().getTime() - self.lastHit > 10000 && self.character.type === 'mob') {
                self.forget();
                self.character.removeTarget();
                self.sendToSpawn();
            }
        }, 20000);
    },

    parseAttack: function() {
        var self = this;

        if (!self.world || !self.queue)
            return;

        if (self.character.hasTarget() && self.inProximity()) {

            if (self.queue.hasQueue())
                self.hit(self.character, self.character.target, self.queue.getHit());

            if (!self.character.target.isDead())
                self.attack(self.character.target);

            self.lastAction = new Date();

        } else
            self.queue.clear();
    },

    parseFollow: function() {
        var self = this;

        self.sendFollow();

        if (self.character.type === 'mob' && !self.character.isAtSpawn() && !self.isAttacked()) {
            self.character.return();
            self.move(self.character, self.character.x, self.character.y);
        }

        if (self.onSameTile()) {
            var position = self.getNewPosition();
            self.move(self.character, position.x, position.y);
        }

        if (self.character.hasTarget() && !self.inProximity() && (self.character.type === 'mob' || self.isRetaliating())) {
            var attacker = self.getClosestAttacker();

            if (attacker)
                self.follow(self.character, attacker);
        }
    },

    attack: function(target) {
        var self = this,
            hit = new Hit(Modules.Hits.Damage, Formulas.getDamage(self.character, target));

        self.queue.add(hit);
    },

    forceAttack: function() {
        var self = this;

        if (!self.character.target || !self.inProximity())
            return;

        self.stop();
        self.start();

        self.attackCount(2, self.character.target);
        self.hit(self.character, self.character.target, self.queue.getHit());
    },

    attackCount: function(count, target) {
        var self = this;

        for (var i = 0; i < count; i++)
            self.attack(new Hit(Modules.Hits.Damage, Formulas.getDamage(self.character, target)));
    },

    addAttacker: function(character) {
        var self = this;

        if (self.hasAttacker(character))
            return;

        self.attackers[character.instance] = character;
    },

    removeAttacker: function(character) {
        var self = this;

        if (self.hasAttacker(character))
            delete self.attackers[character.instance];

        self.sendToSpawn();
    },

    sendToSpawn: function() {
        var self = this;

        if (self.character.type === 'mob' && Object.keys(self.attackers).length === 0) {
            self.character.return();
            self.move(self.character, self.character.spawnLocation[0], self.character.spawnLocation[1]);
        }
    },

    hasAttacker: function(character) {
        var self = this;

        if (!self.isAttacked())
            return;

        return character.instance in self.attackers;
    },

    onSameTile: function() {
        var self = this;

        if (!self.character.target || self.character.type !== 'mob')
            return;

        return self.character.x === self.character.target.x && self.character.y === self.character.target.y;
    },

    isAttacked: function() {
        return Object.keys(this.attackers).length > 0;
    },

    getNewPosition: function() {
        var self = this,
            position = {
                x: self.character.x,
                y: self.character.y
            };

        var random = Utils.randomInt(0, 3);

        if (random === 0)
            position.x++;
        else if (random === 1)
            position.y--;
        else if (random === 2)
            position.x--;
        else if (random === 3)
            position.y++;

        return position;
    },

    isRetaliating: function() {
        return Object.keys(this.attackers).length === 0 && this.retaliate;
    },

    inProximity: function() {
        var self = this;

        if (!self.character.target)
            return;

        var targetDistance = self.character.getDistance(self.character.target),
            range = self.character.attackRange;

        if (self.character.isRanged())
            return targetDistance <= range;

        return self.character.isNonDiagonal(self.character.target);
    },

    getClosestAttacker: function() {
        var self = this,
            closest = null,
            lowestDistance = 100;

        self.forEachAttacker(function(attacker) {
            var distance = self.character.getDistance(attacker);

            if (distance < lowestDistance)
                closest = attacker;
        });

        return closest;
    },

    setWorld: function(world) {
        var self = this;

        if (!self.world)
            self.world = world;
    },

    forget: function() {
        this.attackers = {};
    },

    move: function(character, x, y) {
        this.world.pushBroadcast(new Messages.Movement(character.instance, Packets.MovementOpcode.Move, false, false, x, y));
    },

    hit: function(character, target, hitInfo) {
        var self = this,
            time = new Date().getTime();

        if (time - self.lastHit < self.character.attackRate)
            return;

        if (character.isRanged()) {
            var projectile = self.world.createProjectile(true, [character, target]);

            self.world.pushToAdjacentGroups(character.group, new Messages.Projectile(Packets.ProjectileOpcode.Create, [projectile.instance, projectile.id, character.instance, target.instance, projectile.damage]));

        } else {

            self.world.pushBroadcast(new Messages.Combat(Packets.CombatOpcode.Hit, character.instance, target.instance, hitInfo));

            self.world.handleDamage(character, target, hitInfo[0]);

        }

        self.lastHit = new Date().getTime();
    },

    follow: function(character, target) {
        this.world.pushBroadcast(new Messages.Movement(character.instance, Packets.MovementOpcode.Follow, false, false, null, null, target.instance));
    },

    end: function() {
        this.world.pushBroadcast(new Messages.Combat(Packets.CombatOpcode.Finish, this.character.instance, null));
    },

    sendFollow: function() {
        var self = this;

        if (!self.character.hasTarget())
            return;

        var ignores = [self.character.instance, self.character.target.instance];

        self.world.pushSelectively(new Messages.Movement(self.character.instance, Packets.MovementOpcode.Follow, false, false, null, null, self.character.target.instance), ignores);
    },

    forEachAttacker: function(callback) {
        _.each(this.attackers, function(attacker) {
            callback(attacker);
        });
    }

});