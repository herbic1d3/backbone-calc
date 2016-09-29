$(function() {
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // Models
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    var clsModel = Backbone.Model.extend({
        defaults: function() {
            return {
                value: '0',
                type: 'number',
            };
        },
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    var clsModelRefresh = Backbone.Model.extend({
        defaults: function() {
            return {
                refresh: 'false',
            };
        },
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // Views
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    var clsHandler = Backbone.View.extend({
        data: null,
        layoutName: 'layout',

        render: function() {
            if (this.template) {
                this.$el.html(this.template(this.data));

                Backbone.$('#' + this.layoutName).html(this.$el);
            }

            return this;
        }
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    var clsDisplay = clsHandler.extend({
        template: _.template(Backbone.$('#display-template').html()), 
        layoutName: 'display_layout',

        modelData: null,
        result: 0,
        operation: '',
        refreshValue: false,

        initialize: function(options) {
            this.modelData = options.modelData; 
            this.listenTo(this.modelData,'change',this.update);

            this.data = {value: '0'};
        },

        update: function() {
            var value = this.modelData.get('value');
            var type = this.modelData.get('type');
            var current = this.data.value;

            if (value == 'C') { // clear
                this.result = 0;
                this.data.value = 0;
            }
            else if ('0123456789.'.indexOf(value) != -1) { // number
                if (current == '0' || this.refreshValue == true) {
                    this.data = {value: value.charAt(0)};
                    this.refreshValue = false;
                }
                else {
                    this.data = {value: current + value}
                }
            }
            else if ('/*-+='.indexOf(value) != -1) { // operation
                if (this.result == 0) {
                    if (Number(current) != 0 && value != '=') {
                        this.result = Number(current);

                        this.operation = value;
                        this.refreshValue = true;
                    }
                }
                else {
                    switch(this.operation) {
                        case '/': 
                            this.result = this.result/Number(current);
                            this.operation = value;
                            break 
                        case '*': 
                            this.result = this.result*Number(current);
                            this.operation = value;
                            break 
                        case '-': 
                            this.result = this.result-Number(current);
                            this.operation = value;
                            break 
                        case '+': 
                            this.result = this.result+Number(current);
                            this.operation = value;
                            break 
                    }
                    this.data = {value: this.result};
                    this.refreshValue = true;

                    if (value == '=') {
                        this.result = 0;
                    }
                }
            }
            this.$el.html(this.template(this.data));
        },
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    var clsKeyboard = clsHandler.extend({
        template: _.template(Backbone.$('#keyboard-template').html()), 
        layoutName: 'keyboard_layout',

        modelData: null,

        events: {
              'click .buttons': 'onClick'
        },

        initialize: function(options) {
            this.modelData = options.modelData; 
        },

        onClick: function(e) {
            if (e && e.prevetDefault) {
                e.prevetDefault();
            }

            this.modelData.set({
                value: e.currentTarget.dataset.value,
                type: e.currentTarget.dataset.type,
            });
        },    
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    var clsCalculator = clsHandler.extend({
        template: _.template(Backbone.$('#calculator-template').html()), 
        layoutName: 'calculator_layout',

        modelData: new clsModel(),

        viewDisplay: null,
        viewKeyboard: null,

        initialize: function() {

            this.viewDisplay = new clsDisplay({modelData: this.modelData});
            this.viewKeyboard = new clsKeyboard({modelData: this.modelData});

            this.viewDisplay.render();
            this.viewKeyboard.render();
        },

        updateDisplay: function() {
        },
    });

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    // Body
    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    Backbone.history.start();

    var clsRootRouter = Backbone.Router.extend({
        routes: {
          '!/': 'onRoot',
        },

        onRoot: function() {
            var viewCalc = new clsCalculator();
            viewCalc.render();
        }
    });

    var route = new clsRootRouter();

    setTimeout(function(){
        if (window.location.hash == '') {
            window.location.hash = '!/';
        }
    });

});