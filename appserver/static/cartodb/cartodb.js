define(function(require, exports, module) {
    // Load requirements
    var _ = require('underscore');
    var mvc = require('splunkjs/mvc');
    var SimpleSplunkView = require('splunkjs/mvc/simplesplunkview');
    var Messages = require("splunkjs/mvc/messages");
    var utils = require('splunkjs/mvc/utils');
    var LL = require('leaflet');

    Messages.messages['map-error']={icon: "warning-sign",level: "error",message: _("Map loading failed").t()};

    // Define the custom view class
    var CartoDB = SimpleSplunkView.extend({
        className: "cartodb",
        outputMode: 'json',

        default_options: {
            center: [0,0],
            zoom: 2,
            height: "400px",
            tiles: "http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
            tileOptions: {},
            api_key: ""
        },

        initialize: function(){
            this.configure();

            this.$el.html(
                    '<div class="cartodbwrapper" style="height:'+this.options.height+'">'+
                    '<div id="'+this.id+'-msg"></div>'+
                    '<div style="height: '+this.options.height+'; min-height:'+this.options.height+'; min-width:100%;" id="'+this.id+'-map" class="mapcontainer"></div>'+
                    '</div>');

            this.message = this.$('#'+this.id+'-msg');

            this._setOptions();

            this._get_api_key();

            this._viz = null;
            this._data = null;
            this.bindToComponentSetting('managerid', this._onManagerChange, this);
            if (!this.manager) {
                this._onManagerChange(mvc.Components, null);
            }

            if (!String.prototype.encodeHTML) {
                String.prototype.encodeHTML = function () {
                    return this.replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&apos;');
                };
            }
        },

        createView: function(){
            return this;
        },

        displayMessage: function(info){
            if(info=="no-results"){
                this.clearView();
            }else{
                Messages.render(info, this.message);
                this.message.show();
            }
            return this;
        },

        createMap: function(){
            try {

                // Initiate a leaflet map
                this.map = new LL.Map(this.id + '-map', {
                    center: this.options.center,
                    zoom: this.options.zoom
                });
                LL.tileLayer(this.options.tiles, this.options.tileOptions)
                    .addTo(this.map);

                if(this.postCreateMap){
                    this.postCreateMap();
                }
            }catch(err){
                this._errorMessage();
                console.error("Error loading map components");
                console.error(err.stack);
            }
        },

        _get_api_key: function(){
            var that=this;
            mvc.createService().get("/servicesNS/nobody/cartodb/configs/conf-setup/cartodb",{},function(err,response) {
                if(err){
                    console.error("Error fetching api_key");
                    return;
                }
                content=response.data.entry[0].content;

                if(content.api_key.trim()===""){
                    console.error("No api_key found, make sure to set on in the cartodb setup screen");
                    that._errorMessage();
                }else{
                    that.options.api_key=content.api_key.trim();
                    that.createMap();
                }
            });
        },

        _clearMessage: function(){
            if(this.map){
                this.message.hide();
            }else{
                this._errorMessage();
            }
        },

        _errorMessage: function(){
            Messages.render('map-error',this.message);
            this.message.show();
        },

        clearView: function(){
            throw new Error("Not implemented error.");
        },

        _setOptions: function(){
            if(!this.options.center || this.options.center.length===0){
                this.options.center=this.default_options.center;
            }
            if(!this.options.zoom){
                this.options.zoom=this.default_options.zoom;
            }
            if(!this.options.height || this.options.height.trim()===""){
                this.options.height=this.default_options.height;
            }
            if(!this.options.tiles || this.options.tiles.trim()===""){
                this.options.tiles=this.default_options.tiles;
            }
            if(!this.options.tileOptions){
                this.options.tileOptions=this.default_options.tileOptions;
            }
        }
    });
    return CartoDB;
});
