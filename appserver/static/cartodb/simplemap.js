define(function(require, exports, module) {
    // Load requirements
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var CartoDB = require('app/cartodb/cartodb/cartodb');
    var Messages = require("splunkjs/mvc/messages");
    var utils = require('splunkjs/mvc/utils');
    var LL = require('leaflet');
    
    // Define the custom view class
    var CartoDBSimpleMap = CartoDB.extend({
        className: "simplemap",
        markers: LL.layerGroup(),

        options: {
            
        },

        postCreateMap: function(){
            this.markers.addTo(this.map);
        },

        updateView: function(viz, data) {
            var self = this;
            if(this.map){
                this.clearView();
                for(var i=0;i<data.length;i++){
                    var marker;
                    var latlng=[data[i].lat, data[i].lng];
                    var val=data[i].value;
                    if(this.options.marker){
                        marker=this.options.marker(data[i]);
                    }else{
                        marker=LL.circleMarker(latlng, {
                            weight: 1.5,
                            opacity: 1,
                            color: "#FFFFFF",
                            fillColor: "#FF6600",
                            fillOpacity: 0.9,
                            title: val
                        });
                    }
                    if(marker){
                        marker.on('click', function (e) {
                            var popup = LL.popup()
                                .setLatLng(this.getLatLng())
                                .setContent("<p>" + this.options.title + "</p>")
                                .openOn(self.map);
                        });
                        this.markers.addLayer(marker);
                    }
                }
            }
            this._clearMessage();
        },

        clearView: function(){
            if(this.map){
                this.markers.clearLayers();
            }
        }

    });

    return CartoDBSimpleMap;
});
