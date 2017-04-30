/* global log, Class, Detect */

define(['jquery'], function($) {

    return Class.extend({

        init: function() {
            var self = this;

            log.info('Loading the main application...');

            self.config = null;

            self.body = $('body');
            self.parchment = $('#parchment');

            self.loginButton = $('.login');
            self.registerButton = $('.createNew');
            self.helpButton = $('#helpButton');
            self.loading = $('.loader');

            self.loginFields = [];
            self.registerFields = [];

            self.game = null;

            self.parchmentAnimating = false;

            self.load();
        },

        load: function() {
            var self = this;

            self.loginButton.click(function() {
                if (self.verifyForm()) {
                    self.toggleLogin(true);
                    self.game.connect();
                }
            });

            self.registerButton.click(function() {
                self.openScroll('loadCharacter', 'createCharacter');
            });

            window.scrollTo(0, 1);

            $.getJSON('data/config.json', function(json) {
                self.config = json;

                if (self.readyCallback)
                    self.readyCallback();
            });
        },

        openScroll: function(origin, destination) {
            var self = this;

            if (!destination)
                return;

            self.cleanErrors();

            if (!self.isMobile()) {
                if (self.parchmentAnimating)
                    return;

                self.parchmentAnimating = true;

                self.parchment.toggleClass('animate').removeClass(origin);

                setTimeout(function() {

                    self.parchment.toggleClass('animate').addClass(destination);
                    self.parchmentAnimating = false;

                }, self.isTablet() ? 0 : 1000);

            } else
                self.parchment.removeClass(origin).addClass(destination);
        },

        displayScroll: function(content) {
            var self = this,
                state = self.parchment.attr('class');

            if (self.game.started) {

                self.parchment.removeClass().addClass(content);

                self.body.removeClass('credits legal about').toggleClass(content);

                if (self.game.player)
                    self.body.toggleClass('death');

                if (content !== 'about')
                    self.helpButton.removeClass('active');

            } else if (state !== 'animate')
                self.openScroll(state, state === content ? 'loadCharacter' : content);

        },

        verifyForm: function() {
            var self = this,
                activeForm = self.getActiveForm();

            if (activeForm === 'null')
                return;

            switch (activeForm) {

                case 'loadCharacter':

                    var nameInput = $('#loginNameInput'),
                        passwordInput = $('#loginPasswordInput');

                    if (self.loginFields.length === 0)
                        self.loginFields = [nameInput, passwordInput];

                    if (!nameInput.val()) {
                        self.sendError(nameInput, 'Please enter a username.');
                        return false;
                    }

                    if (!passwordInput.val()) {
                        self.sendError(passwordInput, 'Please enter a password.');
                        return false;
                    }

                    break;

                case 'createCharacter':

                    var characterName = $('#registerNameInput'),
                        registerPassword = $('#registerPasswordInput'),
                        registerPasswordConfirmation = $('#registerPasswordConfirmationInput'),
                        email = $('#registerEmailInput');

                    if (self.registerFields.length === 0)
                        self.registerFields = [characterName, registerPassword, registerPasswordConfirmation, email];

                    if (!characterName.val()) {
                        self.sendError(characterName, 'A username is necessary you silly.');
                        return false;
                    }

                    if (!registerPassword.val()) {
                        self.sendError(registerPassword, 'You must enter a password.');
                        return false;
                    }

                    if (registerPasswordConfirmation.val() !== registerPassword.val()) {
                        self.sendError(registerPasswordConfirmation, 'Please ensure the two passwords match!');
                        return false;
                    }

                    if (!email.val() || !self.verifyEmail(email.val())) {
                        self.sendError(email, 'You must enter a valid email to register.');
                        return false;
                    }

                    break;
            }

            return true;
        },

        verifyEmail: function(email) {
            return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
        },

        sendError: function(field, error) {
            this.cleanErrors();

            $('<span></span>', {
                'class': 'validation-error blink',
                text: error
            }).appendTo('.validation-summary');

            field.addClass('field-error').select();
            field.bind('keypress', function(event) {
                field.removeClass('field-error');

                $('.validation-error').remove();

                $(this).unbind(event);
            });
        },

        cleanErrors: function() {
            var self = this,
                activeForm = self.getActiveForm(),
                fields = activeForm === 'loadCharacter' ? self.loginFields : self.registerFields;

            for (var i = 0; i < fields.length; i++)
                fields[i].removeClass('field-error');

            $('.validation-error').remove();
        },

        getActiveForm: function() {
            return this.parchment[0].className;
        },

        resize: function() {
            log.info('Screen re-sized, scale: ' + this.getScaleFactor());
            log.info('Supports workers: ' + this.hasWorker());
        },

        setGame: function(game) {
            this.game = game;
        },

        hasWorker: function() {
            return !!window.Worker;
        },

        getScaleFactor: function() {
            var width = window.innerWidth,
                height = window.innerHeight;

            /**
             * These are raw scales, we can adjust
             * for up-scaled rendering in the actual
             * rendering file.
             */

            return width <= 1000 ? 1 : ((width <= 1500 || height <= 870) ? 2 : 3);
        },

        updateLoader: function(message) {
            this.loading.html(message + '<span class="loader__dot">.</span><span class="loader__dot">.</span><span class="loader__dot">.</span>');
        },

        toggleLogin: function(toggle) {
            var self = this;

            if (toggle) {
                self.loginButton.fadeOut('slow');
                self.registerButton.fadeOut('slow');
                self.loading.removeAttr('hidden');
            } else {
                self.loginButton.fadeIn('slow');
                self.registerButton.fadeIn('slow');
                self.loading.attr('hidden', true);
            }
        },

        onReady: function(callback) {
            this.readyCallback = callback;
        },

        isMobile: function() {
            return this.getScaleFactor() < 2;
        },

        isTablet: function() {
            return Detect.isIpad() || (Detect.isAndroid() && this.getScaleFactor() > 1);
        }

    });

});