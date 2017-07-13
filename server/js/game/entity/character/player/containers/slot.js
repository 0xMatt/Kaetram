var cls = require('../../../../../lib/class'),
    Items = require('../../../../../util/items');

module.exports = Slot = cls.Class.extend({

    init: function(index) {
        var self = this;

        self.index = index;

        self.id = -1;
        self.count = -1;
        self.ability = -1;
        self.abilityLevel = -1;

        self.string = null;
    },

    load: function(id, count, ability, abilityLevel) {
        var self = this;

        self.id = parseInt(id);
        self.count = parseInt(count);
        self.ability = parseInt(ability);
        self.abilityLevel = parseInt(abilityLevel);

        self.string = Items.idToString(self.id);
        self.edible = Items.isEdible(self.id);
        self.equippable = Items.isEquippable(self.string);
    },

    empty: function() {
        var self = this;

        self.id = -1;
        self.count = -1;
        self.ability = -1;
        self.abilityLevel = -1;

        self.string = null;
    },

    increment: function(amount) {
        this.count += amount;
    },

    decrement: function(amount) {
        this.count -= amount;
    },

    getData: function() {
        return {
            index: this.index,
            string: this.string,
            count: this.count,
            ability: this.ability,
            abilityLevel: this.abilityLevel
        };
    }

});