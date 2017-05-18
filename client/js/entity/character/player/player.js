/* global Modules */

define(['../character', './equipment/armour', './equipment/weapon',
        './equipment/pendant', './equipment/boots', './equipment/ring'],
        function(Character, Armour, Weapon, Pendant, Boots, Ring) {

    return Character.extend({

        init: function() {
            var self = this;

            self._super(-1, Modules.Types.Player);

            self.username = '';
            self.password = '';
            self.email = '';

            self.avatar = null;

            self.wanted = false;
            self.experience = -1;
            self.pvpKills = -1;
            self.pvpDeaths = -1;

            self.prevX = 0;
            self.prevY = 0;

            self.loadEquipment();
        },

        loadEquipment: function() {
            var self = this;

            self.armour = null;
            self.weapon = null;
            self.pendant = null;
            self.ring = null;
            self.boots = null;
        },

        hasWeapon: function() {
            return !!this.weapon;
        },

        performAction: function(orientation, action) {
            this._super(orientation, action);
        },

        setSprite: function(sprite) {
            this._super(sprite);
        },

        getSpriteName: function() {
            return this.sprite ? this.sprite : 'clotharmor';
        },

        setGridPosition: function(x, y) {
            this._super(x, y);
        },

        setEquipment: function(type, data) {
            var self = this,
                name = data.shift(),
                string = data.shift(),
                count = data.shift(),
                skill = data.shift(),
                skillLevel = data.shift();

            switch (type) {
                case Modules.Equipment.Armour:

                    if (!self.armour)
                        self.armour = new Armour(name, string, count, skill, skillLevel);
                    else
                        self.armour.update(name, string, count, skill, skillLevel);

                    break;

                case Modules.Equipment.Weapon:

                    if (!self.weapon)
                        self.weapon = new Weapon(name, string, count, skill, skillLevel);
                    else
                        self.weapon.update(name, string, count, skill, skillLevel);

                    break;

                case Modules.Equipment.Pendant:

                    if (!self.pendant)
                        self.pendant = new Pendant(name, string, count, skill, skillLevel);
                    else
                        self.pendant.update(name, string, count, skill, skillLevel);

                    break;

                case Modules.Equipment.Ring:

                    if (!self.ring)
                        self.ring = new Ring(name, string, count, skill, skillLevel);
                    else
                        self.ring.update(name, string, count, skill, skillLevel);

                    break;

                case Modules.Equipment.Boots:

                    if (!self.boots)
                        self.boots = new Boots(name, string, count, skill, skillLevel);
                    else
                        self.boots.update(name, string, count, skill, skillLevel);

                    break;


            }
        },

        unequip: function(type) {
            var self = this;

            switch (type) {
                case Modules.Equipment.Armour:
                    self.armour = null;
                    break;

                case Modules.Equipment.Weapon:
                    self.weapon = null;
                    break;

                case Modules.Equipment.Pendant:
                    self.pendant = null;
                    break;

                case Modules.Equipment.Ring:
                    self.ring = null;
                    break;

                case Modules.Equipment.Boots:
                    self.boots = null;
                    break;
            }
        }

    });

});