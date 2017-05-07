var cls = require('../lib/class');

module.exports = Creator = cls.Class.extend({

    init: function(mysql) {
        var self = this;

        self.mysql = mysql;

    },

    createTables: function() {
        var self = this;

        self.mysql.connection.query('CREATE TABLE IF NOT EXISTS player_data (' +
            'username varchar(64),' +
            'password varchar(64),' +
            'email varchar(64),' +
            'x int,' +
            'y int,' +
            'experience int,' +
            'kind int,' +
            'rights int,' +
            'poisoned tinyint,' +
            'hitPoints int,' +
            'mana int,' +
            'pvpKills int,' +
            'pvpDeaths int,' +
            'rank int,' +
            'ban int(64),' +
            'membership int(64),' +
            'lastLogin int(64),' +
            'PRIMARY KEY(username))');

        self.mysql.connection.query('CREATE TABLE IF NOT EXISTS player_equipment (' +
            'username varchar(64),' +
            'armour varchar(64),' +
            'weapon varchar(64),' +
            'pendant varchar(64),' +
            'ring varchar(64),' +
            'boots varchar(64),' +
            'PRIMARY KEY(username))');

        self.mysql.connection.query('CREATE TABLE IF NOT EXISTS player_quest (' +
            'username varchar(64),' +
            'id tinyint,' +
            'progress smallint,' +
            'PRIMARY KEY(username))');

        self.mysql.connection.query('CREATE TABLE IF NOT EXISTS player_bank (' +
            'username varchar(64),' +
            'ids text COLLATE utf8_unicode_ci NOT NULL,' +
            'counts text COLLATE utf8_unicode_ci NOT NULL,' +
            'skillKinds text COLLATE utf8_unicode_ci NOT NULL,' +
            'skillLevels text COLLATE utf8_unicode_ci NOT NULL,' +
            'PRIMARY KEY(username))');

        self.mysql.connection.query('CREATE TABLE IF NOT EXISTS player_skills (' +
            'username varchar(64),' +
            'skills text COLLATE utf8_unicode_ci NOT NULL,' +
            'skillLevels text COLLATE utf8_unicode_ci NOT NULL,' +
            'skillSlots text COLLATE utf8_unicode_ci NOT NULL,' +
            'PRIMARY KEY (username))');

        self.mysql.connection.query('CREATE TABLE IF NOT EXISTS player_inventory (' +
            'username varchar(64),' +
            'ids text COLLATE utf8_unicode_ci NOT NULL,' +
            'counts text COLLATE utf8_unicode_ci NOT NULL,' +
            'skillKinds text COLLATE utf8_unicode_ci NOT NULL,' +
            'skillLevels text COLLATE utf8_unicode_ci NOT NULL,' +
            'PRIMARY KEY(username))');

        self.mysql.connection.query('CREATE TABLE IF NOT EXISTS ipbans (' +
            'ip varchar(64),' +
            'ipban int(64),' +
            'PRIMARY KEY(ip))', function(error) {
            if (!error) {
                log.info('[MySQL] Successfully created 7 tables.');
                self.mysql.connect(true, true);
            }
        });
    },

    save: function(player) {
        var self = this,
            queryKey = player.isNew ? 'INSERT INTO' : 'UPDATE',
            playerData = self.formatData(self.getPlayerData(player), 'data'),
            equipmentData = self.formatData(self.getPlayerData(player), 'equipment');

        log.info(equipmentData);

        self.mysql.connection.query(queryKey + ' `player_data` SET ?', playerData);
        self.mysql.connection.query(queryKey + ' `player_equipment` SET ?', equipmentData);
    },

    formatData: function(data, type) {
        var formattedData;

        switch(type) {
            case 'data':
                formattedData = {
                    username: data.username,
                    password: data.password,
                    email: data.email,
                    x: data.x,
                    y: data.y,
                    experience: data.experience,
                    kind: data.kind,
                    rights: data.rights,
                    poisoned: data.poisoned,
                    hitPoints: data.hitPoints,
                    mana: data.mana,
                    pvpKills: data.pvpKills,
                    pvpDeaths: data.pvpDeaths,
                    rank: data.rank,
                    ban: data.ban,
                    membership: data.membership,
                    lastLogin: data.lastLogin
                };
                break;

            case 'equipment':

                formattedData = {
                    username: data.username,
                    armour: data.armour.toString(),
                    weapon: data.weapon.toString(),
                    pendant: data.pendant.toString(),
                    ring: data.ring.toString(),
                    boots: data.boots.toString()
                };

                break;
        }

        return formattedData;
    },

    getPlayerData: function(player) {
        return {
            username: player.username,
            password: player.password,
            email: player.email ? player.email : 'null',
            x: player.x ? player.x : 0,
            y: player.y ? player.y : 0,
            kind: player.kind ? player.kind : 0,
            rights: player.rights ? player.rights : 0,
            hitPoints: player.hitPoints ? player.hitPoints : 100,
            mana: player.mana ? player.mana : 20,
            poisoned: player.poisoned ? player.poisoned : 0,
            experience: player.experience ? player.experience : 0,
            ban: player.ban ? player.ban : 0,
            rank: player.rank ? player.rank : 0,
            membership: player.membership ? player.membership : 0,
            lastLogin: player.lastLogin ? player.lastLogin : 0,
            pvpKills: player.pvpKills ? player.pvpKills : 0,
            pvpDeaths: player.pvpDeaths ? player.pvpDeaths : 0,
            armour: [player.armour ? player.armour.getId() : 114, player.armour ? player.armour.getCount() : 0, player.armour ? player.armour.getSkill() : 0, player.armour ? player.armour.getSkillLevel() : 0],
            weapon: [player.weapon ? player.weapon.getId() : -1, player.weapon ? player.weapon.getCount() : 0, player.weapon ? player.weapon.getSkill() : 0, player.weapon ? player.weapon.getSkillLevel() : 0],
            pendant: [player.pendant ? player.pendant.getId() : -1, player.pendant ? player.pendant.getCount() : 0, player.pendant ? player.pendant.getSkill() : 0, player.pendant ? player.pendant.getSkillLevel() : 0],
            ring: [player.ring ? player.ring.getId() : -1, player.ring ? player.ring.getCount() : 0, player.ring ? player.ring.getSkill() : 0, player.ring ? player.ring.getSkillLevel() : 0],
            boots: [player.boots ? player.boots.getId() : -1, player.boots ? player.boots.getCount() : 0, player.boots ? player.boots.getSkill() : 0, player.boots ? player.boots.getSkillLevel() : 0]
        }
    }

});