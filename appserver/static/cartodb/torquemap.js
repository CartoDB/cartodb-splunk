define(function(require, exports, module) {
    // Load requirements
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var CartoDB = require('app/cartodb/cartodb/cartodb');
    var Messages = require("splunkjs/mvc/messages");
    var utils = require('splunkjs/mvc/utils');
    var LL = require('leaflet');
    var torque = require('torque');

    // Define the custom view class
    var CartoDBTorqueMap = CartoDB.extend({
        className: "torquemap",

        options: {
            css: [
                'Map {',
                '-torque-time-attribute: "date";',
                '-torque-aggregation-function: "count(cartodb_id)";',
                '-torque-frame-count: 760;',
                '-torque-animation-duration: 15;',
                '-torque-resolution: 2',
                '}',
                '#layer {',
                '  marker-width: 3;',
                '  marker-fill-opacity: 0.8;',
                '  marker-fill: #FEE391;',
                '  comp-op: "lighten";',
                '  [value > 2] { marker-fill: #FEC44F; }',
                '  [value > 3] { marker-fill: #FE9929; }',
                '  [value > 4] { marker-fill: #EC7014; }',
                '  [value > 5] { marker-fill: #CC4C02; }',
                '  [value > 6] { marker-fill: #993404; }',
                '  [value > 7] { marker-fill: #662506; }',
                '  [frame-offset = 1] { marker-width: 10; marker-fill-opacity: 0.05;}',
                '  [frame-offset = 2] { marker-width: 15; marker-fill-opacity: 0.02;}',
                '}'
            ].join('\n'),
            tiles: "http://{s}.api.cartocdn.com/base-dark/{z}/{x}/{y}.png"
        },

        postCreateMap: function(){
            
        },

        updateView: function(viz, data) {
            var self = this;
            if(this.map){
                this.clearView();
                this.torqueLayer = new LL.TorqueLayer({
                    user: 'viz2',
                    table: 'ow',
                    cartocss: this.options.css,
                    tiler_protocol: 'https',
                    tiler_port: 443
                });
                this.torqueLayer.addTo(this.map);
                this.torqueLayer.play();
            }
            this._clearMessage();
        },

        clearView: function(){
            if(this.map){
                // 
            }
        }

    });

    return CartoDBTorqueMap;
});
