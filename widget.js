/* global requirejs cprequire cpdefine chilipeppr THREE */
// Defining the globals above helps Cloud9 not show warnings for those variables

// ChiliPeppr Widget/Element Javascript

requirejs.config({
    /*
    Dependencies can be defined here. ChiliPeppr uses require.js so
    please refer to http://requirejs.org/docs/api.html for info.
    
    Most widgets will not need to define Javascript dependencies.
    
    Make sure all URLs are https and http accessible. Try to use URLs
    that start with // rather than http:// or https:// so they simply
    use whatever method the main page uses.
    
    Also, please make sure you are not loading dependencies from different
    URLs that other widgets may already load like jquery, bootstrap,
    three.js, etc.
    
    You may slingshot content through ChiliPeppr's proxy URL if you desire
    to enable SSL for non-SSL URL's. ChiliPeppr's SSL URL is
    https://i2dcui.appspot.com which is the SSL equivalent for
    http://chilipeppr.com
    */
    paths: {
        // Example of how to define the key (you make up the key) and the URL
        // Make sure you DO NOT put the .js at the end of the URL
        // SmoothieCharts: '//smoothiecharts.org/smoothie',
    },
    shim: {
        // See require.js docs for how to define dependencies that
        // should be loaded before your script/widget.
    }
});

// Test this element. This code is auto-removed by the chilipeppr.load()
cprequire_test(["inline:com-chilipeppr-widget-grbl"], function (grbl) {
    //console.log("test running of " + grbl.id);
    grbl.init();
    //testRecvline();
    
    var sendGrblVersion = function() {
        chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {
            dataline: "Grbl 0.8c"
        });
    };
    
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$0=755.906 (x, step/mm)\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$1=755.906 (y, step/mm)\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$13=0 (report mode, 0=mm,1=inch)\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$3=30 (step pulse, usec)\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "$5=500.000 (default feed, mm/min)\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "[G0 G54 G17 G21 G90 G94 M0 M5 M9 T0 F500.0]\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "[ALARM: Hard/soft limit]\n" });
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", {dataline: "['$H'|'$X' to unlock]\n" });
    
    
    chilipeppr.publish("/com-chilipeppr-widget-3dviewer/unitsChanged","inch");
    chilipeppr.publish("/com-chilipeppr-widget-serialport/onQueue", {Buf: 100});
    
    var sendTestPositionData = function() {
        setTimeout(function() {
            // MPos:[-0.05,0.00,0.00],WPos:[-0.05,0.00,0.00]
            //chilipeppr.publish("/com-chilipeppr-widget-serialport/recvline", { 
                //dataline: "MPos:[-0.05,0.00,0.00],WPos:[-0.05,0.200,-1.00]"  //0.8a            
                //dataline: "<idle,MPos:-0.05,0.00,0.00,WPos:-0.05,0.200,-1.00>"  //0.8c
            //});
        }, 2000);
        
    };
    sendGrblVersion();
    sendTestPositionData();
    
    chilipeppr.publish("/com-chilipeppr-widget-serialport/recvSingleSelectPort",{BufferAlgorithm: "grbl"}); //error not grbl buffer

    $('body').css('padding', '20px');
    
    
} /*end_test*/ );

function Queue(){var e=[];var t=0;this.getLength=function(){return e.length-t};this.isEmpty=function(){return e.length==0};this.enqueue=function(t){e.push(t)};this.dequeue=function(){if(e.length==0)return undefined;var n=e[t];if(++t*2>=e.length){e=e.slice(t);t=0}return n};this.peek=function(){return e.length>0?e[t]:undefined};this.sum=function(){for(var t=0,n=0;t<e.length;n+=e[t++]);return n};this.last=function(){return e[e.length-1]}}

cpdefine("inline:com-chilipeppr-widget-grbl", ["chilipeppr_ready", "jquerycookie"], function () {
    return {
        id: "com-chilipeppr-widget-grbl",
        implements: { 
            "com-chilipeppr-interface-cnccontroller" : "The CNC Controller interface is a loosely defined set of publish/subscribe signals. The notion of an interface is taken from object-oriented programming like Java where an interface is defined and then specific implementations of the interface are created. For the sake of a Javascript mashup like what ChiliPeppr is, the interface is just a rule to follow to publish signals and subscribe to signals by different top-level names than the ID of the widget or element implementing the interface. Most widgets/elements will publish and subscribe on their own ID. In this widget we are publishing/subscribing on an interface name. If another controller like Grbl is defined by a member of the community beyond this widget for GRBL, this widget can be forked and used without other widgets needing to be changed and the user could pick a Grbl or GRBL implementation of the interface."
        },
        url: "(auto fill by runme.js)",       // The final URL of the working widget as a single HTML file with CSS and Javascript inlined. You can let runme.js auto fill this if you are using Cloud9.
        fiddleurl: "(auto fill by runme.js)", // The edit URL. This can be auto-filled by runme.js in Cloud9 if you'd like, or just define it on your own to help people know where they can edit/fork your widget
        githuburl: "(auto fill by runme.js)", // The backing github repo
        testurl: "(auto fill by runme.js)",   // The standalone working widget so can view it working by itself
        name: "Widget / GRBL",
        desc: "This widget shows the GRBL Buffer so other widgets can limit their flow of sending commands and other specific GRBL features.",
        publish: {
            '/com-chilipeppr-interface-cnccontroller/feedhold' : "Feedhold (Emergency Stop). This signal is published when user hits the Feedhold button for an emergency stop of the GRBL. Other widgets should see this and stop sending all commands such that even when the plannerresume signal is received when the user clears the queue or cycle starts again, they have to manually start sending code again. So, for example, a Gcode sender widget should place a pause on the sending but allow user to unpause.",
            '/com-chilipeppr-interface-cnccontroller/plannerpause' : "This widget will publish this signal when it determines that the planner buffer is too full on the GRBL and all other elements/widgets need to stop sending data. You will be sent a /plannerresume when this widget determines you can start sending again. The GRBL has a buffer of 28 slots for data. You want to fill it up with around 12 commands to give the planner enough data to work on for optimizing velocities of movement. However, you can't overfill the GRBL or it will go nuts with buffer overflows. This signal helps you fire off your data and not worry about it, but simply pause the sending of the data when you see this signal. This signal does rely on the GRBL being in {qv:2} mode which means it will auto-send us a report on the planner every time it changes. This widget watches for those changes to generate the signal. The default setting is when we hit 12 remaining planner buffer slots we will publish this signal.",
            '/com-chilipeppr-interface-cnccontroller/plannerresume' : "This widget will send this signal when it is ok to send data to the GRBL again. This widget watches the {qr:[val]} status report from the GRBL to determine when the planner buffer has enough room in it to send more data. You may not always get a 1 to 1 /plannerresume for every /plannerpause sent because we will keep sending /plannerpause signals if we're below threshold, but once back above threshold we'll only send you one /plannerresume. The default setting is to send this signal when we get back to 16 available planner buffer slots.",
            '/com-chilipeppr-interface-cnccontroller/axes' : "This widget will normalize the GRBL status report of axis coordinates to send off to other widgets like the XYZ widget. The axes publish payload contains {x:float, y:float, z:float, a:float} If a different CNC controller is implemented, it should normalize the coordinate status reports like this model. The goal of this is to abstract away the specific controller implementation from generic CNC widgets.",
            '/com-chilipeppr-interface-cnccontroller/units' : "This widget will normalize the GRBL units to the interface object of units {units: \"mm\"} or {units: \"inch\"}. This signal will be published on load or when this widget detects a change in units so other widgets like the XYZ widget can display the units for the coordinates it is displaying.",
            '/com-chilipeppr-interface-cnccontroller/proberesponse': 'Publish a probe response with the coordinates triggered during probing, or an alarm state if the probe does not contact a surface',
            '/com-chilipeppr-interface-cnccontroller/status' : 'Publish a signal each time the GRBL status changes'
        },
        subscribe: {
            '/com-chilipeppr-interface-cnccontroller/jogdone' : 'We subscribe to a jogdone event so that we can fire off an exclamation point (!) to the GRBL to force it to drop all planner buffer items to stop the jog immediately.',
            '/com-chilipeppr-interface-cnccontroller/recvgcode' : 'Subscribe to receive gcode from other widgets for processing and passing on to serial port'
        },
        foreignPublish: {
            "/com-chilipeppr-widget-serialport/send" : "We send to the serial port certain commands like the initial configuration commands for the GRBL to be in the correct mode and to get initial statuses like planner buffers and XYZ coords. We also send the Emergency Stop and Resume of ! and ~"
        },
        foreignSubscribe: {
            "/com-chilipeppr-widget-serialport/ws/onconnect" : "When we see a new connect, query for status.",
            "/com-chilipeppr-widget-serialport/recvline" : "When we get a dataline from serialport, process it and fire off generic CNC controller signals to the /com-chilipeppr-interface-cnccontroller channel.",
            "/com-chilipeppr-widget-serialport/send" : "Subscribe to serial send and override so no other subscriptions receive command."
        },
        //plannerPauseAt: 128, // grbl planner buffer can handle 128 bytes of data
        //qLength: new Queue(),
        //qLine: new Queue(),
        //g_count: 0,
        //l_count: 0,
        //interval_id: 0,
        config: [],
        err_log: [],
        //config_index: [],
        buffer_name: "",
        report_mode: 0,
        work_mode: 0,
        controller_units: null,
        status: "Offline",
        version: "",
        q_count: 0,
        alarm: false,
        offsets: {"x": 0.000, "y": 0.000, "z": 0.000},
        last_work: {"x":0.000, "y": 0.000, "z": 0.000},
        last_machine: {"x":0.000, "y": 0.000, "z": 0.000},
        g_status_reports: null,
        gcode_lookup:{"G0":"Rapid","G1":"Linear","G2":"Circular CW","G3":"Circular CCW","G38.2":"Probing","G80":"Cancel Mode",
                      "G54":"G54","G55":"G55","G56":"G56","G57":"G57","G58":"G58","G59":"G59",
                      "G17":"XY Plane", "G18":"ZX Plane","G19":"YZ Plane","G90":"Absolute", "G91":"Relative","G93":"Inverse", "G94":"Units/Min",
                      "G20":"Inches", "G21":"Millimetres","G43.1":"Active Tool Offset","G49":"No Tool Offset",
                      "M0":"Stop","M1":"Stop","M2":"End","M30":"End","M3":"Active-CW","M4":"Active-CCW","M5":"Off",
                      "M7":"Mist","M8":"Flood","M9":"Off"
                     },
                      
                      
        init: function () {
            this.uiHover(); //set up the data elements for all UI
            
            this.setupUiFromCookie();
            this.btnSetup();

            this.forkSetup();

            // setup recv pubsub event
            // this is when we receive data in a per line format from the serial port
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvline", this, function (msg) {
                this.grblResponse(msg);
            });

            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onportopen", this, this.openController);
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onportclose", this, this.closeController);
            
            // subscribe to jogdone so we can stop the planner buffer immediately
            chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/jogdone", this, function (msg) {
                //chilipeppr.publish("/com-chilipeppr-widget-serialport/send", '!\n');
                //this.sendCode('!\n');
                setTimeout(function() {
                    chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerresume', "");
                }, 2);
            });
            
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/recvSingleSelectPort", this, function(port){
                if(port !== null){
                   this.buffer_name = port.BufferAlgorithm;
                    if(this.buffer_name !== "grbl"){
                       $("#grbl-buffer-warning").show();
                    }
                    else{
                       $("#grbl-buffer-warning").hide();
                    }
                }
            });
            
            //no longer following the send.
            //chilipeppr.subscribe("/com-chilipeppr-widget-serialport/send", this, this.bufferPush, 1);
            
            //listen for units changed
            chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/unitsChanged",this,this.updateWorkUnits);
            chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/recvUnits",this,this.updateWorkUnits);
            chilipeppr.subscribe("/com-chilipeppr-interface-cnccontroller/units", this, this.updateWorkUnits); //this sets axes to match 3d viewer.
            
            //listen for whether a gcode file is playing - if so, cancel our $G interval and start sending each 25 lines of gcode file sent.
            chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onplay", this, this.trackGcodeLines);
            chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onstop", this, this.restartStatusInterval);
            //chilipeppr.subscribe("/com-chilipeppr-widget-gcode/onpause",this, function(state, metadata){
            //    if(state === false){ this.restartStatusInterval(); } //when gcode widget pauses, go back to interval querying $G
            //    else if(state === true){ this.trackGcodeLines(); }   //when gcode widget resumes, begin tracking line count to embed $G into buffer.
            //});
            chilipeppr.subscribe("/com-chilipeppr-widget-gcode/done", this, this.restartStatusInterval);
            
            //call to determine the current serialport configuration
            chilipeppr.publish("/com-chilipeppr-widget-serialport/requestSingleSelectPort","");
            
            //count spjs queue
            chilipeppr.subscribe("/com-chilipeppr-widget-serialport/onWrite", this, function(data){
                if(data.QCnt >= 0){
                    this.q_count = data.QCnt;
                    $('.stat-queue').html(this.q_count); 
                }
            });

            //call to find out what current work units are
            chilipeppr.publish("/com-chilipeppr-widget-3dviewer/requestUnits","");
            
            //watch for a 3d viewer /sceneReloaded and pass back axes info
            chilipeppr.subscribe("/com-chilipeppr-widget-3dviewer/sceneReloaded",this,function(data){
                if(this.last_work.x !== null)
                    this.publishAxisStatus(this.last_work);
                else if(this.last_machine.x !== null)
                    this.publishAxisStatus(this.machine);
                else
                    this.publishAxisStatus({"x":"x","y":"y","z":"z"});
            });
        },
        options: null,
        setupUiFromCookie: function() {
            // read vals from cookies
            var options = $.cookie('com-chilipeppr-widget-grbl-options');
            
            if (true && options) {
                options = $.parseJSON(options);
                //console.log("GRBL: just evaled options: ", options);
            } else {
                options = {showBody: true};
            }
            this.options = options;
            //console.log("GRBL: options:", options);
            
        },
        saveOptionsCookie: function() {
            var options = {
                showBody: this.options.showBody
            };
            var optionsStr = JSON.stringify(options);
            //console.log("GRBL: saving options:", options, "json.stringify:", optionsStr);
            // store cookie
            $.cookie('com-chilipeppr-widget-grbl-options', optionsStr, {
                expires: 365 * 10,
                path: '/'
            });
        },
        showBody: function(evt) {
            $('#com-chilipeppr-widget-grbl .panel-body .stat-row').removeClass('hidden');
            $('#com-chilipeppr-widget-grbl .hidebody span').addClass('glyphicon-chevron-up');
            $('#com-chilipeppr-widget-grbl .hidebody span').removeClass('glyphicon-chevron-down');
            if ((evt !== null)) {
                this.options.showBody = true;
                this.saveOptionsCookie();
            }
        },
        hideBody: function(evt) {
            $('#com-chilipeppr-widget-grbl .panel-body .stat-row').addClass('hidden');
            $('#com-chilipeppr-widget-grbl .hidebody span').removeClass('glyphicon-chevron-up');
            $('#com-chilipeppr-widget-grbl .hidebody span').addClass('glyphicon-chevron-down');
            if ((evt !== null)) {
                this.options.showBody = false;
                this.saveOptionsCookie();
            }
        },
        btnSetup: function() {
            // chevron hide body
            var that = this;
            $('#com-chilipeppr-widget-grbl .hidebody').click(function(evt) {
                //console.log("GRBL: hide/unhide body");
                if ($('#com-chilipeppr-widget-grbl .panel-body .stat-row').hasClass('hidden')) {
                    // it's hidden, unhide
                    that.showBody(evt);
                } else {
                    // hide
                    that.hideBody(evt);
                }
            });
            $('#com-chilipeppr-widget-grbl .grbl-feedhold').click(function() {
                //console.log("GRBL: feedhold");
                that.sendCode('!');
                // announce to other widgets that user hit e-stop
                chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerpause', "");
                chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/feedhold", "");
            });
            $('#com-chilipeppr-widget-grbl .grbl-cyclestart').click(function() {
                //console.log("GRBL: cyclestart");
                that.sendCode('~');
                //may want to check if buffer queue is >128 before resuming planner.
                chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerresume', ""); 
            });
            
            $('#com-chilipeppr-widget-grbl .grbl-verbose').click(function() {
                //console.log("GRBL: manual status update");
                $('#com-chilipeppr-widget-grbl .grbl-verbose').toggleClass("enabled");
            });
            
            $('#com-chilipeppr-widget-grbl .grbl-reset').click(function() {
                //console.log("GRBL: reset");
                that.sendCode(String.fromCharCode(24));
                chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/plannerresume', "");
            });

            $('#com-chilipeppr-widget-grbl-btnoptions').click(this.showConfigModal.bind(this));
            
            $('#com-chilipeppr-widget-grbl .btn-toolbar .btn').popover({
                delay: 500,
                animation: true,
                placement: "auto",
                trigger: "hover",
                container: 'body'
            });
        },
        showConfigModal: function() {
            $('#grbl-config-div').empty();
            
            this.config.forEach(function(config_element,index_num) {
                $('#grbl-config-div').append(
                    '<div class="input-group" ' + 
                    'style="width:400px;margin-bottom:2px;"><div class="input-group-addon" style="width:40px;padding:0px 6px;">' + 
                    "$" + 
                    index_num + 
                    '</div><input class="form-control" style="height:20px;padding:0px 6px;width:100px;" id="com-chilipeppr-widget-grbl-config-' + 
                    index_num + 
                    '" value="' + 
                    config_element[0] + 
                    '"/><span style="margin-left:10px;">' + 
                    config_element[1] + 
                    '</span></div>');
                
            }, this);

            $('#grbl-config-div').append('<br/><button class="btn btn-xs btn-default save-config">Save Settings To GRBL</button>');
            $('.save-config').click(this.saveConfigModal.bind(this));
            $('#com-chilipeppr-widget-grbl-modal').modal('show');
        },
        hideConfigModal: function() {
            $('#com-chilipeppr-widget-grbl-modal').modal('hide');
        },
        saveConfigModal: function() {
            console.log("GRBL: Save Settings");

            this.config.forEach(function(config_element,index_num){
                var command = "$" + index_num + '=' + $('#com-chilipeppr-widget-grbl-config-' + index_num).val() + '\n';
                this.config[index_num][0] = $('#com-chilipeppr-widget-grbl-config-' + index_num).val();
                this.sendCode(command);
            },this);
            console.log(this.config);
            return true;
        },
        updateWorkUnits: function(units){
            if(units==="mm")
                this.work_mode = 0;
            else if(units==="inch")
                this.work_mode = 1;
            console.log("GRBL: Updated Work Units - " + this.work_mode);
            //update report units if they have changed
            this.updateReportUnits();
        },
        updateReportUnits: function(){
            if(this.config[13] !== undefined){
                if(this.config[13][0] === 0)
                    this.report_mode = 0;
                else if(this.config[13][0] === 1)
                    this.report_mode = 1;
            }
            console.log("GRBL: Updated Report Units - " + this.report_mode);
        },
        //formerly queryControllerForStatus
        openController: function(isWithDelay) {
            var that = this;
            
            //wait three second for arduino initialization before requesting the grbl config variables.
            setTimeout(function() {
                chilipeppr.publish("/com-chilipeppr-widget-serialport/requestSingleSelectPort",""); //Request port info
                if(that.version === "")
                    that.sendCode("*init*\n"); //send request for grbl init line (grbl was already connected to spjs when chilipeppr loaded and no init was sent back.
                that.sendCode("*status*\n"); //send request for initial status response.
                that.sendCode("$$\n"); //get grbl params
                //wait one additional second before checking for what reporting units grbl is configured for.
                setTimeout(function() {
                    that.updateReportUnits();
                }, 1000);

                that.restartStatusInterval();  //Start the $G tracking loop
                
                //that.g_status_reports = setInterval(function(){
                //    that.getControllerInfo(); //send a $G every 2 seconds
                //}, 2000);
            }, 3000);
        },
        closeController: function(isWithDelay) {
            $("#grbl-buffer-warning").show();
            $('#grbl-status-info-div').hide();
            clearInterval(this.g_status_reports);
            this.config = [];
            this.buffer_name = "";
            this.report_mode = 0;
            this.work_mode = 0;
            this.status = "Offline";
            chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/status',this.status);
            $('.com-chilipeppr-grbl-state').text(this.status);
            this.version = "";
            $('#com-chilipeppr-widget-grbl .panel-title').text("GRBL");
            this.offsets = {"x": 0.000, "y": 0.000, "z": 0.000};
            this.last_machine= {"x":0.000, "y": 0.000, "z": 0.000};
            this.last_work = {"x":0.000, "y": 0.000, "z": 0.000};
            this.publishAxisStatus({"posx":0.000, "posy":0.000,"posz":0.000});
        },
        getControllerInfo: function(){
            var json = {
                D: "$G\n",
                Id: "status"
            };
            if(!this.alarm) //only send if we're not in an alarm state.
                chilipeppr.publish("/com-chilipeppr-widget-serialport/jsonSend", json);
        },
        trackGcodeLines: function(){
            if(this.g_status_reports !== null){
                clearInterval(this.g_status_reports);
                this.g_status_reports = null; //clear status report interval flag
            }
            /*chilipeppr.subscribe("/com-chilipeppr-widget-serialport/jsonSend", this, function(msg){
                if(msg.Id.slice(1) % 5 === 0)
                    this.getControllerInfo(); //send a $G every 5 lines of the gcode file.
            });*/
        },
        restartStatusInterval: function(){
            //stop tracking the jsonSend, file is finished.
            //chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/jsonSend", this.trackGcodeLines);
            
            var that = this;
            if(this.g_status_reports === null){ //confirm no setInterval is currently running.
                that.g_status_reports = setInterval(function(){
                    if(that.q_count === 0) //only send $G if the queue is clear
                        that.getControllerInfo(); //send a $G every 2 seconds
                }, 2000);
            }
        },
        grblResponse: function (recvline) {
            //console.log("GRBL: Message Received - " + recvline.dataline);
            if (!(recvline.dataline) || recvline.dataline=='\n') {
                //console.log("GRBL: got recvline but it's not a dataline, so returning.");
                return true;
            }
            
            var msg = recvline.dataline;
            //console.log("GRBL: Line Received -- " + recvline.dataline);
            if (msg.indexOf("ok") >= 0 || msg.indexOf("error") >= 0) { //expected response
                if(msg.indexOf("error") >= 0){
                    this.addError("Error", msg);
                    //update error count;
                }
            }
            else{ //when response isn't an ok or error, it's actionable information
                if(msg.indexOf("PRB:") >= 0){
                    var coords = msg.replace(/\[PRB:|\]|\n/g,"").split(",");
                    //use current offsets to bring this value back to work coordinate system for proberesponse.
                    if(this.work_mode===this.report_mode)
                        chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/proberesponse", {"x":parseFloat(coords[0]) - this.offsets.x,"y":parseFloat(coords[1]) - this.offsets.y,"z":parseFloat(coords[2]) - this.offsets.z});
                    else if(this.work_mode===1 && this.report_mode===0) //work is inch, reporting in mm
                        chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/proberesponse", {"x":this.toInch(parseFloat(coords[0]) - this.offsets.x),"y":this.toInch(parseFloat(coords[1]) - this.offsets.y),"z":this.toInch(parseFloat(coords[2]) - this.offsets.z)});
                    else if(this.work_mode===0 && this.report_mode===1) //work is mm, reporting in inches
                        chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/proberesponse", {"x":this.toMM(parseFloat(coords[0]) - this.offsets.x),"y":this.toMM(parseFloat(coords[1]) - this.offsets.y),"z":this.toMM(parseFloat(coords[2]) - this.offsets.z)});
                }
                else if(msg.indexOf("<") >= 0 && msg.indexOf(">") >= 0){ //if the response is a status message, parse for all possible values
                    //remove brackets
                    msg = msg.replace(/<|>|\[|\]|\n/g, ""); 
                    //change colons to commas & split string
                    rpt_array = msg.replace(/:/g, ",").split(",");
                    
                    if(this.version === '0.8a')
                        $('.stat-state').text("Too Old - Upgrade GRBL!");
                    else
                        if(rpt_array[0] !== this.status){
                            this.status = rpt_array[0];
                            chilipeppr.publish('/com-chilipeppr-interface-cnccontroller/status',this.status);
                            if(this.alarm !== true && this.status === "Alarm"){
                                this.alarm = true;
                                $('.stat-state').text("Alarm - Click To Reset (CTRL+X)");
                                var that = this;
                                $('.stat-state').click(function(){
                                    that.sendCode(String.fromCharCode(24));
                                });
                                $(".stat-state").hover(function() {
                                    $(this).css('cursor','pointer');
                                }, function() {
                                    $(this).css('cursor','auto');
                                });
                                $('#stat-state-background-box').css('background-color', 'pink');
                            }
                            if(this.alarm !== true || this.status !== "Alarm"){
                                this.alarm = false;
                                $('.stat-state').unbind("click");
                                $('.stat-state').text(this.status.charAt(0).toUpperCase() + this.status.slice(1)); //Update UI
                                $('#stat-state-background-box').css('background-color', '#f5f5f5');
                            }
                            
                            
                        }
                    
                    var len = rpt_array.length;
                    var i = 1;
                    var MPos_flag = false;
                    var WPos_flag = false;
                    while (i < len) {
                        if(rpt_array[i] == "MPos"){
                            this.last_machine.x = parseFloat(rpt_array[i+1]);
                            this.last_machine.y = parseFloat(rpt_array[i+2]);
                            this.last_machine.z = parseFloat(rpt_array[i+3]);
                            this.last_machine.a = null;
                            this.last_machine.type = "machine";
                            if(this.report_mode === 1)
                                this.last_machine.unit = "inch";
                            else
                                this.last_machine.unit = "mm";
                            
                            $('.stat-mcoords').html("X:" + this.last_machine.x.toFixed(3) + " Y:" + this.last_machine.y.toFixed(3) + " Z:" + this.last_machine.z.toFixed(3));
                            
                            
                            MPos_flag = true;
                            i += 4; //increment i counter past the MPos values
                        }
                        else if(rpt_array[i] == "WPos"){
                            this.last_work.x = parseFloat(rpt_array[i+1]);
                            this.last_work.y = parseFloat(rpt_array[i+2]);
                            this.last_work.z = parseFloat(rpt_array[i+3]);
                            this.last_work.a = null;
                            this.last_work.type = "work";
                            if(this.report_mode === 1)
                                this.last_work.unit = "inch";
                            else
                                this.last_work.unit = "mm";
                            WPos_flag = true;
                            i += 4;
                        }
                        else if(rpt_array[i] == "Buf")
                            i += 2;
                        else if(rpt_array[i] == "RX")
                            i += 2;
                        else
                            i++;
                    }
                    
                    //calculate offsets if both sets of coordinates are being received
                    if(MPos_flag && WPos_flag){
                        this.offsets.x = this.last_machine.x - this.last_work.x; //x offset
                        this.offsets.y = this.last_machine.y - this.last_work.y; //y offset
                        this.offsets.z = this.last_machine.z - this.last_work.z; //z offset
                    }

                    if(WPos_flag === true)
                        this.publishAxisStatus(this.last_work);
                    else if(MPos_flag === true)
                        this.publishAxisStatus(this.machine);
                    else  //as failsafe send NAN so user knows that the coordinates are not displaying properly -- could handle this error on the receiving widget side.
                        this.publishAxisStatus({"x":"x","y":"y","z":"z"});

                }
                else if(msg.indexOf("Grbl") >= 0){
                    //if this is not the first init line, warn the user grbl has been reset
                    if(this.version !== "")
                        chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "GRBL has been reset - temporary work coordinate and tool offsets have been lost.");
                    
                    chilipeppr.publish("/com-chilipeppr-widget-gcode/stop", true); //stops gcode widget since grbl just reset.
                    this.version = msg.split(" ")[1];
                    $('#com-chilipeppr-widget-grbl .panel-title').text("GRBL (" + this.version + ")"); //update ui  
                }
                else if(msg.search(/^\$[0-9][0-9]*=/g) >= 0){ //is a config report ($0=,$1=...etc)
                    var tmp = msg.split(/ (.+)/); //break out config and description
                    var val = tmp[0].replace("$","").split("="); //split config into variable id and value
                    //console.log(val);
                    this.config[parseInt(val[0],10)] = [parseFloat(val[1]), tmp[1]]; //save config value and description
                    //console.log("GRBL: this.config = ");
                    //console.log(this.config[0]);
                }
                else if(msg.indexOf("ALARM: Probe fail") >= 0){
                    this.alarm = true;
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "Probe Failed - Alarm State!");
                    chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/proberesponse", "alarm");
                    //should we clear the buffer here as well, or resend queued commands afteras a reset to grbl is needed to clear this which will clear all buffered items?
                }
                else if(msg.indexOf("ALARM: Hard/soft limit") >= 0 || msg.indexOf("ALARM: Soft limit") >= 0 || msg.indexOf("ALARM: Hard limit") >= 0){
                    this.alarm = true;
                    this.restartStatusInterval();
                    
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "Alarm! GRBL has exceeded a hard or soft limit.");
                    chilipeppr.publish("/com-chilipeppr-widget-gcode/stop", true); //stops gcode widget since grbl just reset.
                    this.clearBuffer();
                    
                    $('.stat-state').text("Alarm - Click To Reset (CTRL+X)");
                    var that = this;
                    $('.stat-state').unbind("click");
                    $('.stat-state').click(function(){
                        that.sendCode(String.fromCharCode(24));
                    });
                    $(".stat-state").hover(function() {
                        $(this).css('cursor','pointer');
                    }, function() {
                        $(this).css('cursor','auto');
                    });
                    $('#stat-state-background-box').css('background-color', 'pink');
                    
                    this.addError("Alarm", msg);
                    //update error count;
                }    
                else if(msg.indexOf("'$X' to unlock") >= 0){
                    this.alarm = true;
                    this.restartStatusInterval();
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "GRBL is locked - $X to unlock");
                    
                    chilipeppr.publish("/com-chilipeppr-widget-gcode/stop", true); //stops gcode widget since grbl just reset.
                    this.clearBuffer();
                    
                    $('.stat-state').html("Alarm - Click To Unlock ($X)");
                    var that = this;
                    $('.stat-state').unbind("click");
                    $('.stat-state').click(function(){
                        that.sendCode("$X\n");
                    });
                    $(".stat-state").hover(function() {
                        $(this).css('cursor','pointer');
                    }, function() {
                        $(this).css('cursor','auto');
                    });
                    $('#stat-state-background-box').css('background-color', 'pink');
                    
                    this.addError("Alarm", msg);
                    //update error count;
                }
                else if(msg.indexOf("Enabled") >= 0){
                    //action check mode on
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "GRBL is now in passive gcode checking mode.");
                }
                else if(msg.indexOf("Disabled") > 0){
                    //action check mode off
                    chilipeppr.publish("/com-chilipeppr-elem-flashmsg/flashmsg", "GRBL Widget", "GRBL is now in active run mode.");
                }
                else if(msg.search(/^\[/g) >= 0 && msg.indexOf(":") < 0){ //some config information is being returned - figure out what.
                    
                    msg = msg.replace(/\[|\]|\n/g, ""); //remove brackets
                    var msg_array = msg.split(/\s|,|:/g); //split to array on space, comma, or colon
                    //check for units change, save new units state and publish units to other widgets
                    if((this.controller_units !== "mm" && msg_array[3] === "G21")){ 
                        this.controller_units = "mm";
                        console.log("we have a unit change. publish it. units:", this.controller_units);
                        chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/units", this.controller_units);
                        //resend coordinates
                        if(this.last_work.x !== null)
                            this.publishAxisStatus(this.last_work);
                        else if(this.last_machine.x !== null)
                            this.publishAxisStatus(this.last_machine);
                        else
                            this.publishAxisStatus({"x":"x","y":"y","z":"z"});
                    } else if((this.controller_units !== "inch" && msg_array[3] === "G20")){ 
                        this.controller_units = "inch";
                        console.log("we have a unit change. publish it. units:", this.controller_units);
                        chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/units", this.controller_units);
                        
                        //resend coordinates
                        if(this.last_work.x !== null)
                            this.publishAxisStatus(this.last_work);
                        else if(this.last_machine.x !== null)
                            this.publishAxisStatus(this.last_machine);
                        else
                            this.publishAxisStatus({"x":"x","y":"y","z":"z"});
                    }
                    
                    //notify coords change for WCS widget
                    chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/coords",{coord:msg_array[1], coordNum: parseInt(msg_array[1].replace("G",""))});
                    
                    $('.stat-motion').html(this.gcode_lookup[msg_array[0]]);
                    $('.stat-wcs').html(this.gcode_lookup[msg_array[1]]);
                    $('.stat-plane').html(this.gcode_lookup[msg_array[2]]);
                    $('.stat-distance').html(this.gcode_lookup[msg_array[4]]);
                    $('.stat-units').html(this.gcode_lookup[msg_array[3]]);
                    $('.stat-spindle').html(this.gcode_lookup[msg_array[7]]);
                    $('.stat-coolant').html(this.gcode_lookup[msg_array[8]]);
                    msg_array[10] = parseFloat(msg_array[10].substring(1));
                    $('.stat-feedrate').html(this.controller_units === "inch" ? (parseFloat(msg_array[10])/25.4).toFixed(2) : msg_array[10].toFixed(2));  
                }
            }
        },
        
        sendCode: function (sendline){
            //chilipeppr.unsubscribe("/com-chilipeppr-widget-serialport/send", this, this.bufferPush); //unsubscribe before publishing to serial port
            chilipeppr.publish("/com-chilipeppr-widget-serialport/send", sendline); //send to serial port 
            console.log("GRBL: Code Sent - " + sendline);
            //chilipeppr.subscribe("/com-chilipeppr-widget-serialport/send", this, this.bufferPush, 1); //resubscribe with top priority
        },
        
        clearBuffer: function(){
            console.log("GRBL: Clearing SPJS Buffer");
            this.sendCode("%\n");
        },
        
        //queryStatus: function(that){
        //    that.sendCode('?\n'); //request status/coordinates
        //},
        publishAxisStatus: function(axes) {
            chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/axes", axes);
        },
        plannerLastEvent: "resume",
        publishPlannerPause: function() {
            // tell other widgets to pause their sending because we're too far into
            // filling up the planner buffer
            this.plannerLastEvent = "pause";
            chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/plannerpause", "");
        },
        publishPlannerResume: function() {
            // tell other widgets they can send again
            this.plannerLastEvent = "resume";
            chilipeppr.publish("/com-chilipeppr-interface-cnccontroller/plannerresume", "");
        },
        toInch: function(mm){
            return (mm/25.4).toFixed(3);  
        },
        toMM: function(inch){
            return (inch*25.4).toFixed(3);   
        },
        addError: function(line, msg){
            if(this.err_log.length === 0)
                i = 0;
            else
                i = this.err_log.length - 1;
            //save error in log array
            this.err_log[i] = line.toString() + " - " + msg;
        },
        forkSetup: function () {
            var topCssSelector = '#com-chilipeppr-widget-grbl';
            
            //$(topCssSelector + ' .fork').prop('href', this.fiddleurl);
            //$(topCssSelector + ' .standalone').prop('href', this.url);
            //$(topCssSelector + ' .fork-name').html(this.id);
            $(topCssSelector + ' .panel-title').popover({
                title: this.name,
                content: this.desc,
                html: true,
                delay: 200,
                animation: true,
                trigger: 'hover',
                placement: 'auto'
            });
            
            var that = this;
            
            // used to be
            // "http://fiddle.jshell.net/chilipeppr/zMbL9/show/light/"
            // but now using the github repo
            // http://raw.githubusercontent.com/chilipeppr/widget-pubsubviewer/master/auto-generated-widget.html
            chilipeppr.load("http://raw.githubusercontent.com/chilipeppr/widget-pubsubviewer/master/auto-generated-widget.html", function () {
                require(['inline:com-chilipeppr-elem-pubsubviewer'], function (pubsubviewer) {
                    pubsubviewer.attachTo($('#com-chilipeppr-widget-grbl .panel-heading .dropdown-menu'), that);
                });
            });
            
        },
        uiHover: function(){
            //units
            $("#ttl-units").attr("data-delay", "500");
            $("#ttl-units").attr("data-animation","true");
            $("#ttl-units").attr("data-placement","auto");
            $("#ttl-units").attr("data-container","body");
            $("#ttl-units").attr("data-trigger","hover");
            $("#ttl-units").attr("data-toggle","popover");
            $("#ttl-units").attr("data-title","Units");
            $("#ttl-units").attr("data-content","The active distance mode which the CNC will move - Can be Inches (G20) or Millimetres (G21)");
            $("#ttl-units").popover();
            
            //state
            $("#ttl-state").attr("data-delay", "500");
            $("#ttl-state").attr("data-animation","true");
            $("#ttl-state").attr("data-placement","auto");
            $("#ttl-state").attr("data-container","body");
            $("#ttl-state").attr("data-trigger","hover");
            $("#ttl-state").attr("data-toggle","popover");
            $("#ttl-state").attr("data-title","State");
            $("#ttl-state").attr("data-content","Current state of the GRBL controller");
            $("#ttl-state").popover();
            
            //wcs
            $("#ttl-wcs").attr("data-delay", "500");
            $("#ttl-wcs").attr("data-animation","true");
            $("#ttl-wcs").attr("data-placement","auto");
            $("#ttl-wcs").attr("data-container","body");
            $("#ttl-wcs").attr("data-trigger","hover");
            $("#ttl-wcs").attr("data-toggle","popover");
            $("#ttl-wcs").attr("data-title","Work Coordinate System");
            $("#ttl-wcs").attr("data-content","The current work coordinate offsets being applied to the machine coordinates");
            $("#ttl-wcs").popover();
            
            //coolant
            $("#ttl-coolant").attr("data-delay", "500");
            $("#ttl-coolant").attr("data-animation","true");
            $("#ttl-coolant").attr("data-placement","auto");
            $("#ttl-coolant").attr("data-container","body");
            $("#ttl-coolant").attr("data-trigger","hover");
            $("#ttl-coolant").attr("data-toggle","popover");
            $("#ttl-coolant").attr("data-title","Coolant");
            $("#ttl-coolant").attr("data-content","Indicates whether cooling is currently on or off");
            $("#ttl-coolant").popover();
            
            //plane
            $("#ttl-plane").attr("data-delay", "500");
            $("#ttl-plane").attr("data-animation","true");
            $("#ttl-plane").attr("data-placement","auto");
            $("#ttl-plane").attr("data-container","body");
            $("#ttl-plane").attr("data-trigger","hover");
            $("#ttl-plane").attr("data-toggle","popover");
            $("#ttl-plane").attr("data-title","Plane");
            $("#ttl-plane").attr("data-content","The current coordinate plane on which arcs will be rendered (XY, XZ, or YZ)");
            $("#ttl-plane").popover();
            
            //feedrate
            $("#ttl-feedrate").attr("data-delay", "500");
            $("#ttl-feedrate").attr("data-animation","true");
            $("#ttl-feedrate").attr("data-placement","auto");
            $("#ttl-feedrate").attr("data-container","body");
            $("#ttl-feedrate").attr("data-trigger","hover");
            $("#ttl-feedrate").attr("data-toggle","popover");
            $("#ttl-feedrate").attr("data-title","Feedrate");
            $("#ttl-feedrate").attr("data-content","The active feedrate for G1, G2, G3 commands");
            $("#ttl-feedrate").popover();
            
            //motion
            $("#ttl-motion").attr("data-delay", "500");
            $("#ttl-motion").attr("data-animation","true");
            $("#ttl-motion").attr("data-placement","auto");
            $("#ttl-motion").attr("data-container","body");
            $("#ttl-motion").attr("data-trigger","hover");
            $("#ttl-motion").attr("data-toggle","popover");
            $("#ttl-motion").attr("data-title","Motion");
            $("#ttl-motion").attr("data-content","Indicates what type of motion GRBL performed on the last command (rapid seek motion, cutting feed motion, or probing operations)");
            $("#ttl-motion").popover();
            
            //distance
            $("#ttl-distance").attr("data-delay", "500");
            $("#ttl-distance").attr("data-animation","true");
            $("#ttl-distance").attr("data-placement","auto");
            $("#ttl-distance").attr("data-container","body");
            $("#ttl-distance").attr("data-trigger","hover");
            $("#ttl-distance").attr("data-toggle","popover");
            $("#ttl-distance").attr("data-title","Distance");
            $("#ttl-distance").attr("data-content","Indicates whether commands should use absolute positioning or relative positioning for determining distance of a command (Determined by G90 or G91 commands)");
            $("#ttl-distance").popover();
            
            //spindle
            $("#ttl-spindle").attr("data-delay", "500");
            $("#ttl-spindle").attr("data-animation","true");
            $("#ttl-spindle").attr("data-placement","auto");
            $("#ttl-spindle").attr("data-container","body");
            $("#ttl-spindle").attr("data-trigger","hover");
            $("#ttl-spindle").attr("data-toggle","popover");
            $("#ttl-spindle").attr("data-title","Spindle");
            $("#ttl-spindle").attr("data-content","Indicates whether the spindle is on or off");
            $("#ttl-spindle").popover();
            
            //queue
            $("#ttl-queue").attr("data-delay", "500");
            $("#ttl-queue").attr("data-animation","true");
            $("#ttl-queue").attr("data-placement","auto");
            $("#ttl-queue").attr("data-container","body");
            $("#ttl-queue").attr("data-trigger","hover");
            $("#ttl-queue").attr("data-toggle","popover");
            $("#ttl-queue").attr("data-title","Queue");
            $("#ttl-queue").attr("data-content","Lists the number of lines remaining to be executed in the SPJS queue");
            $("#ttl-queue").popover();
            
            //machine Coords
            $("#ttl-mcoords").attr("data-delay", "500");
            $("#ttl-mcoords").attr("data-animation","true");
            $("#ttl-mcoords").attr("data-placement","auto");
            $("#ttl-mcoords").attr("data-container","body");
            $("#ttl-mcoords").attr("data-trigger","hover");
            $("#ttl-mcoords").attr("data-toggle","popover");
            $("#ttl-mcoords").attr("data-title","Machine Coordinates");
            $("#ttl-mcoords").attr("data-content","Shows the current machine coordinates based on the machine origin.  This differs from the current work coordinates when a work coordinate offset has been applied.");
            $("#ttl-queue").popover();
        }
    };
});