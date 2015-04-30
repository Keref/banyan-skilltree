
/*
 * listContainer: lists and returns the elements of the graph container (nodes and links)
 *
 * return array( node%int: { textContent, offsetTop, offsetLeft }, link%int: { sourceNode, targetNode, linkType } )
 */
function listContainer(is_new_graph){
        //jsPlumb.setContainer($('#graphContainer'));
        var trace = document.getElementById('savestate');
        trace.innerHTML = "";
        var treeSave = {node: {}, link: {} };
        
        //blocks position is absolute, and we need relative position to the container
        var shiftLeft = document.getElementById('graphContainer').offsetLeft;
        var shiftTop = document.getElementById('graphContainer').offsetTop;
        var cont = $("#graphContainer");
        treeSave["width"] = cont.width();
        treeSave["height"] = cont.height();
        //if the icon is an uploaded image
        treeSave["icon"] = $('#tree_icon').attr('src').replace(/.*\//g,'').replace(/-[0-9a-f]{12,50}.png$/, '.png');
        treeSave["tags"] = $('#tree_tags').val();
        
				$('div').filter(function() {
					return /^(new|load)_state\d+$/.test(this.id);
				}).each(function() {
					var idd = this.id;
					var content = encodeURI($("#desc_area_"+this.id).val());
					//in case of duplicating graph, we strip names to change all load_state* to new_state*
					if ( is_new_graph !== null && is_new_graph == "true" ){
						idd = idd.replace('load_s', 'new_s');
						content = encodeURI($("#desc_area_"+this.id).html());
					}

					var pos=$(this).position();
					var icon_name = $('#icon_'+this.id).attr('src').replace(/.*\//g,'').replace(/-[0-9a-f]{12,50}.png$/, '.png');

					treeSave["node"][idd] = { title: encodeURI($("#skill_node_title_span_"+this.id).text()),
																			content: content,
																				 icon: icon_name,
																		 maxlevel: $('#badge_' + this.id).text(),
																		offsetTop: pos.top,
																		offsetLeft: pos.left,
																		nodetype: "default"
																		};
				});
				$('div').filter(function() {
					return /^(new|load)_external_state\d+$/.test(this.id);
				}).each(function() {
					var pos=$(this).position();
					treeSave["node"][this.id] = { nodetype: "reference",
																				content: $("#desc_area_"+this.id).html(),
																			offsetTop: pos.top,
																			offsetLeft: pos.left
																			};
				});


        var linkList = jsPlumb.getAllConnections();

        for (var m in linkList) {
					//FUCKING BUG HERE WHERE PARENT IS NOT THE CLASS THE ENDPOINT IS CONNECTED TO
					var source = linkList[m].sourceId.replace(/^connect_/,"");
					var target = linkList[m].targetId;
					//in case of duplicating graph, we strip names to change all load_state* to new_state*
					if ( is_new_graph !== null && is_new_graph == "true" ) {
						source = source.replace('load_s', 'new_s');
						target = target.replace('load_s', 'new_s');
					}

					treeSave["link"]["link"+m] = { sourceNode: source,
																				 targetNode: target,
																				 linkType: linkList[m].getParameter("link_type"),
																				 link_id: linkList[m].getParameter("link_id"),
																				 };
					if ( is_new_graph !== null && is_new_graph == "true" ) {
						delete treeSave["link"]["link"+m].link_id ;
					}
																				 
        }

        return treeSave;
}



/*
 * displayTrace: displays an array in the save state to allow parameter check
 */
function displayTrace(arrayP ){
	var trace = document.getElementById('savestate');
	trace.innerHTML += JSON.stringify(arrayP);
}


/*
 * postNewGraph: sets the array of parameters and sends it back to the
 */
function postGraph(is_new_graph){
	formParam = listContainer(is_new_graph);
	//TODO: make proper test error proof
	var method = 'POST';
	var authToken = document.getElementsByName("authenticity_token");
	if (authToken != null) formParam[authToken[0].name] = authToken[0].value;
	var utf8 = document.getElementsByName("utf8");
	if (utf8 != null) formParam["utf8"] = utf8[0].value;
	var name = document.getElementById("node_name");
	if (name != null) formParam["name"] = name.value;
	var graphid = document.getElementById("graph_id");
	var nl = "";
	
	//if the graph is saved as new, it means that we want to duplicate it, we "post" the graph to /nodes/ instead of "patch" to /nodes/id
	if ( is_new_graph !== null && is_new_graph == "true" ){
		method = "POST";
		formParam["name"] = $("#graph_h1_title").attr("value");
	}
	if (graphid != null){
		formParam["graph_id"] = graphid.value;
		method = "PATCH";
		nl = graphid.value;
	}
	displayTrace(formParam);

	$.ajax({type: method,
					url: '/nodes/'+nl,
					data: formParam,
					dataType: 'json',
					success:function(response){ 
            if (response.redirect) {
                window.location.href = response.redirect;
            }
            else {
							displayTrace(response);

							$("#fMessages").removeClass();
							$("#fMessages").addClass("alert alert-"+response.status);
							$("#fMessages").text(response.message);
            }
            jsPlumb.recalculateOffsets("graphContainer");
					},
					error: function (data, errors, tt){
						console.log(data);
						console.log(errors);
						console.log(tt);
						$("#fMessages").removeClass();
						$("#fMessages").addClass("alert alert-danger");
						$("#fMessages").text("An error occurred while querying the server.");
					}
    });
}

/*
 * function postProgress: send the progress stats of the tree
 */
function postProgress(){
	var postData = {};
	postData["level"] = {};
	$('.badge').each( function (i){
		var level = $(this).text().replace(/\/.*/, '');
		var id = $(this).attr('id').replace(/.*state/,'');
		postData["level"][id] = level;
	});
	var graphid = $("#graph_id").attr('value');
	$.ajax({type: 'PATCH',
				url: '/skills/'+graphid,
				data: postData,
				dataType: 'json',
				success:function(response){ 
					if (response.redirect) {
							window.location.href = response.redirect;
					}
					else {
						displayTrace(response);

						$("#fMessages").removeClass();
						$("#fMessages").addClass("alert alert-"+response.status);
						$("#fMessages").text(response.message);
					}
				},
				error: function (data, errors, tt){
					console.log(data);
					console.log(errors);
					console.log(tt);
					$("#fMessages").removeClass();
					$("#fMessages").addClass("alert alert-danger");
					$("#fMessages").text("An error occurred while querying the server.");
				}
	});

}



// Defining some styles for jsPlumb	
// from jsplumb demo flowchart
// this is the paint style for the connecting lines..
var dynamicAnchors = [ "Top", "Right", "Bottom", "Left"],
		connectorPaintStyle = {
				lineWidth: 2,
				strokeStyle: "#aaaaaa",
				joinstyle: "round",
				outlineColor: "white",
				outlineWidth: 2
		},
// .. and this is the hover style.
		connectorHoverStyle = {
				lineWidth: 2,
				strokeStyle: "#444444",
				outlineWidth: 2,
				outlineColor: "white"
		},
		endpointHoverStyle = {
				fillStyle: "#555555",
				strokeStyle: "#434f55"
		},
// the definition of source endpoints (the small blue ones)
		sourceEndpoint = {
				anchor: dynamicAnchors,
				endpoint: "Dot",
				paintStyle: {
						strokeStyle: "#aaaaaa",
						fillStyle: "transparent",
						radius: 6,
						lineWidth: 2
				},
				connector: [ "Flowchart", { stub: [15, 10], gap: 5, cornerRadius: 10 } ],
				connectorStyle: connectorPaintStyle,
				hoverPaintStyle: endpointHoverStyle,
				connectorHoverStyle: connectorHoverStyle,
				dragOptions: {},
				overlays: [ [ "Arrow", { width:15, length:15, location:1 }	] ]
		},
		// the definition of target endpoints (will appear when the user drags a connection)
		targetEndpoint = {
			anchor: dynamicAnchors,
				endpoint: "Dot",
				paintStyle: { fillStyle: "#bbbbbb", radius: 3 },
				hoverPaintStyle: endpointHoverStyle,
				maxConnections: -1,
				dropOptions: { hoverClass: "hover", activeClass: "active" },
				isTarget: true,
				overlays: [ [ "Arrow", { width:15, length:15, location:1 }	] ]
		}




/*
 * createBadge: creates a badge with event handler
 * 
 * return: badge jquery object
 */
function createBadge ( params ){
	//if the badge is not editable, we can still click the badge to increase a level (learning)
	var maxlevel	= params["maxlevel"] || 1;
	var level = params["level"] || 0;
	var badge_name = params["name"] || "badge";
	var badge = $("<span>").attr('id', badge_name).addClass("badge blue");
	
	function modif_level(badge, op, maxlvl){
		bt = badge.text().replace(/\/.*/,'');
		if ( op == "plus" && bt < maxlvl ) bt = parseInt(bt) + 1;
		if ( op == "minus" && bt > 0 ) bt = parseInt(bt) -1;
		badge.text( bt+"/"+maxlvl);
	}

	if (params["editable"] == true ){
		badge.text(maxlevel);
		//event binding: right click is increasing max value by one, left click decreasing by one
		badge.click( function (e) {
			e.stopImmediatePropagation();
			badge.text( parseInt(badge.text()) + 1 );
		});
		badge.bind("contextmenu",function(e){
			parseInt(badge.text()) > 0 && badge.text( badge.text() - 1 );
			return false;
		}); 
	}
	else {
		badge.text(level + '/' + maxlevel);
		badge.click( function (e) {
			e.stopImmediatePropagation();
			modif_level(badge, "plus", maxlevel);
		});
		badge.bind("contextmenu", function(e){
			modif_level(badge, "minus", maxlevel);
			return false;
		});
	}
	return badge
}




/*
 *  createNode: adds a node to the jsPlumb instance.
 * 
 * param: { name: 'totoSkill',
					node_div_name: 'load_state65',
					nodeid:'65',
					content:'zis ma skillz',
					icon: '/path/to/icon.png',
					maxlevel: '1',
					offsetTop:'330',
					offsetLeft:'335',
					editable: true,
					learn: false }
 */
function createNode(param){
	
	//displayTrace(param);
	var icon_path = "assets/default_icon.png";
	if ( param["icon"] != null ) icon_path = param["icon"];
	//console.log(icon_path);
	var node_div_id = param["node_div_name"];
	var skill_node = $('<div>').attr('id', node_div_id);
	if ( param["nodetype"] != null ) {
		skill_node.addClass('skill_node_' + param["nodetype"]);
	}
	else
		skill_node.addClass('skill_node');
	
	var skill_node_title = $('<div>').addClass('skill_node_title');
	var skill_node_title_span = $('<span>').addClass('skill_node_title_span').attr('id','skill_node_title_span_' + node_div_id);
	var skill_node_badge = skill_node_title.append(skill_node_title_span);
	
	var skill_node_icon = $('<img>').attr('id','icon_'+node_div_id).attr('src', icon_path).attr('width','40').attr('height','40').addClass('skill_node_icon');
	var skill_node_connect = $('<div>').attr('id', "connect_" + node_div_id).addClass('skill_node_connect');
	var desc_skill = $('<div>').attr('id', "desc_" + node_div_id).addClass('skill_desc');
	var	desc_top = $("<div>").attr('id','desc_area_titleline_'+node_div_id).addClass('skill_desc_top');
	var desc_icon = $('<img>').attr('src', icon_path).attr('width','48').attr('height','48').addClass('skill_desc_icon');


	var desc_content,	desc_title, desc_title_input;
	
	skill_node.append(skill_node_icon);
	skill_node.append(skill_node_title);
	
	
	var name = decodeURI(param["name"]);
	desc_skill.attr("title",name);
	skill_node_title_span.text(name);
	
	//if editable, the desc_box is an textarea, else just a regular div
	if  ( param["editable"] == true && param["nodetype"] != "reference" ){
		desc_skill.append(desc_top);
		desc_top.append(desc_icon);
		
		desc_title = $("<div>").addClass("skill_desc_title");
		desc_title_input = $("<textarea>").attr('id', 'desc_area_title_' + node_div_id).attr('wrap','soft').attr("cols", "10").attr("rows","2").attr("type", "text").attr("maxlength", "26").val(name);
		//desc_title.append("Skill name")
		desc_title.append(desc_title_input);

		desc_content = $('<textarea>').attr('id', 'desc_area_' + node_div_id).addClass('skill_desc_content').addClass('jqte-test');
		desc_skill.append("<br><br>Description").append(desc_content);
		desc_content.val(decodeURI(param["content"]));

		skill_node.append(skill_node_connect);
		
		//initializes the icon selector dialog
		icon_selector_dialog(desc_icon, skill_node_icon);

	}
	else {
		//displaying the graph: no fancy choosing, inputs...
		desc_title = $("<div>").attr('id', 'desc_area_title_' + node_div_id);
		desc_content = $('<p>').attr('id', 'desc_area_' + node_div_id).addClass('skill_desc_content');
		desc_skill.append(desc_content);
		desc_content.append( decodeURI(param["content"]));
		
	}
	desc_top.append(desc_title);

	//try to align to see //alignmet problem on chrome
	var altop = param["offsetTop"] - (param["offsetTop"] % 40);
	var alleft = param["offsetLeft"] - (param["offsetLeft"] % 40);
		
	skill_node.css({
		'top': altop + "px",
		'left': alleft +"px",
		'position': 'absolute'
	});

	
	$('#graphContainer').append(skill_node);
	$('#graphContainer').append(desc_skill);
	//jsPlumb.addEndpoint(node_div_id, sourceEndpoint);	
	
	//creates a dialog box with the skill content on click the box
		if ( param["nodetype"] != "reference" ) {
		skill_node.click(function(e) {
			hide_desc();
				
			var s = document.getElementById(node_div_id);
			var l = s.offsetLeft + 80;
			//TODO: we move the desc box next to the skill box (in case it's been dragged)
			if (param["editable"] === true ) { $('#desc_area_' + node_div_id).jqte(); }
			$("#desc_" + node_div_id).dialog({
				title: desc_title.val(),
				dialogClass: 'ui-alert',
				maxHeight: 600,
				width: 600,
				close: function(){
					if ( param["editable"] === true ) {
						skill_node_title_span.text(desc_title_input.val());
					}
				}
			}).enableSelection();
		});	
	}
	
			
	//makes the skill draggable, and prevent dragging from propagating
	//draggable is allowed in non editable mode (for now)
	jsPlumb.draggable(skill_node, {
		containment: 'parent',
		stop: function(event, ui) {
			// event.toElement is the element that was responsible
			// for triggering this event. The handle, in case of a draggable.
			$( event.toElement ).one('click', function(e){ e.stopImmediatePropagation(); }) }
		,
		grid: [40, 40]
		});
	
	
	if  ( param["editable"] == true ){
		jsPlumb.makeTarget(node_div_id, targetEndpoint);
		
		jsPlumb.makeSource(skill_node_connect, {
				parent: skill_node,
				anchor: 'Continuous',
				type: "basic",
				endpoint: "Dot",
				paintStyle: {
						strokeStyle: "#aaaaaa",
						fillStyle: "transparent",
						radius: 5,
						lineWidth: 2
				},
				connector: [ "Flowchart", { stub: [15, 15], gap: 5, cornerRadius: 10 } ],
				connectorStyle: connectorPaintStyle,
				hoverPaintStyle: endpointHoverStyle,
				connectorHoverStyle: connectorHoverStyle,
				dragOptions: {},
				overlays: [ [ "Arrow", { width:15, length:15, location:1 }	] ]
			}, sourceEndpoint );

		//suppress a node by left clicking it
		skill_node.bind("contextmenu", function(e) {
			jsPlumb.detachAllConnections($(this));
			jsPlumb.removeAllEndpoints($(this));
			$(this).remove();
			desc_skill.remove();
			e.stopImmediatePropagation();
			return false;
		});	
		
	}
	else {
		//non editable, preventing users from suppressing connections
		//TODO: does not work
		jsPlumb.selectEndpoints().each(function (e){
				$(this).setVisible(false);
				e.setVisible(false);
		});
	}
	
	//we finally add the badge: being on top we define in the end to keep click event processing order
	skill_node_title.append(createBadge({ name: 'badge_' + node_div_id, editable: param["editable"], maxlevel: param["maxlevel"], level:param["level"] }  ) );
	
	hide_desc();
}



/*
 * 
 */
	var skill_preloaded;
	function preload_external_skill(){
		var target = $('#skill_preload');
		$.ajax({type: "GET",
				url: '/nodes/'+$("#input_skill_id").val(),
				dataType: 'json',
				success:function(response){ 
					if (response.redirect) {
							window.location.href = response.redirect;
					}
					else {
						console.log(response);
						html_rep = "<table><tr><td><img id='icon_preload' width='70'  src='"+response.icon
														+"' /></td><td>Reference: "+response.id+"<br>Name: "+response.name+"</td></tr></table>";
						target.html(html_rep);
						skill_preloaded = response;
					}
				},
				error: function (data, errors, tt){
					target.html("Error while looking for this skill");
				}
    });
		
	}
	
	


/*
 * createExtNode: asks for an external graph link and creates a special node linking to that tree
 */
function createExtNode(i){
	//we create a popup dialog asking for the skill id
	var id_request = $('<div>').html('Skill Id number:<input type="text" id="input_skill_id" /><input type="button" value="Search" onclick="preload_external_skill();" />');
	//	$('#graphContainer').append(id_request);
	id_request.appendTo("body");
	var skill_preload = $('<div>').attr('id', 'skill_preload');
	id_request.append(skill_preload);

  id_request.dialog({
        modal: false,
        title: 'link to an External Tree',
        zIndex: 10000,
        width: 'auto',
        resizable: false,
        buttons: {
            OK: function () {
                $(this).dialog("close");
								createNode({ name: skill_preloaded.name,
									icon: skill_preloaded.icon,
									node_div_name: "new_external_state" + i,
									nodeid: null,
									content: skill_preloaded.id,
									offsetTop: $("#graphContainer").offsetLeft,
									offsetLeft:$("#graphContainer").offsetTop,
									editable: true,
									nodetype: "reference" });
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        },
        close: function (event, ui) {
            $(this).remove();
        }
    });
	console.log(id_request);
/*
	createNode({ name: "External skill "+i,
							icon: default_icon,
							node_div_name: "external_state" + i,
							nodeid: null,
							content: "",
							offsetTop: $("#graphContainer").offsetLeft,
							offsetLeft:$("#graphContainer").offsetTop,
							editable: true,
							nodetype: "reference" });	*/
}



/*
 * icon_selector_dialog: creates an icon selector dialog
 * 
 * when browsing the icons pages stay in the dialog; on choosing an icon, icon_div (and optional_icon_div)
 * display the chosen image
 */
function icon_selector_dialog ( icon_div , optional_icon_div) {
	/*	var upload_icon = $("<div>").attr('id', 'upload_icon');
		upload_icon.append('Upload a new file (max XX kB): <input type="file" />');
		var icon_list = $("<div>").attr('id', "icon_list");
		*/
		var icon_handler = $("<div>").attr('id', "icon_handler");
		
		//defining a function to display 
		function load_desc_icon(url){
			icon_handler.load(url);
			icon_handler.click(function (event) {
				console.log('click icon handler');
				//event.preventDefault();
				var is_clicked = $(event.target);
				if ( is_clicked.is('a') ){
					//if a link is clicked we load the new page in the div
					load_desc_icon( is_clicked.attr('href') );
				}
				else if  (is_clicked.is('img')) {
					//if an image is clicked, we change the icons
					icon_div.attr('src', is_clicked.attr('src'));
					if ( typeof optional_icon_div !== 'undefined' ) {
						optional_icon_div.attr('src', is_clicked.attr('src'));
					}
				}
			});
		}
		//click the icon to change it
		icon_div.click(function(e) {
			icon_handler.dialog({
            open: function (){
							load_desc_icon("/icons/");
            },   
            width: 400,
            title: 'Choose a new icon'
        });
			});
}



/* hide_desc: hides the description boxes
 */
function hide_desc(){
	$(".ui-dialog-content").dialog("close");
	$('div').filter(function() {
		return /^desc_(new|load|external)/.test(this.id);
	}).each(function() {
		$("#"+this.id).css({"display":"none"});
	});
}


/*
 *  createLink: creates a link
 * 
 * param: { name: 'default',
					source_node: 'load_state198',
					target_node: 'load_state199',
					content: '' }
 */
function createLink(param){
	var linkid = 0;
	if ( param["link_id"] != null){
		linkid = param["link_id"];
	}

	var e_source = jsPlumb.addEndpoint( param["source_node"], sourceEndpoint );
	var e_target = jsPlumb.addEndpoint( param["target_node"], targetEndpoint );
	
	var conn = jsPlumb.connect(	{
			source: e_source,
			target: e_target,
			link_id: linkid,
			type: "basic"

	}, sourceEndpoint	);
	
	conn.setParameter("link_type", "default");
	conn.setParameter("link_id", linkid);

}

/*
 * resize_container: changes the size of the graphContainer
 * 
 * direction: "height" or "width"
 * amount: +/- XX  (e.g "+50", -"50", ...)
 */
function resize_container(direction, amount){
	var con = $("#graphContainer");
	if ( direction == "width" ) {
		con.width(con.width() + amount );
	}
	else {
		con.height(con.height() + amount );
	}
}


/*
 * init_jsplumb: called after the graph page has been created to initialize jsPlumb internals and bind events.
 */
function init_jsplumb(default_icon, editable) {
	
		//from jsplumb flowchart demo
	   var jsPlumbInstance = jsPlumb.getInstance({
        // default drag options
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
            [ "Arrow", { location: 1 } ],
            [ "Label", {
                location: 0.1,
                id: "label",
                cssClass: "aLabel"
            }]
        ]
    });
	  jsPlumbInstance.setContainer($('#graphContainer'));
    var basicType = {
        connector: "StateMachine",
        paintStyle: { strokeStyle: "red", lineWidth: 4 },
        hoverPaintStyle: { strokeStyle: "blue" },
        overlays: [
            "Arrow"
        ]
    };
    var myConnType = {
				anchor: 'Continuous',
				endpoint: "Dot",
				paintStyle: {
						strokeStyle: "#7AB02C",
						fillStyle: "transparent",
						radius: 2,
						lineWidth: 3
				},
				connector: [ "Flowchart", { stub: [5, 10], gap: 5, cornerRadius: 10 } ],
				connectorStyle: connectorPaintStyle,
				hoverPaintStyle: endpointHoverStyle,
				connectorHoverStyle: connectorHoverStyle,
				dragOptions: {},
				isSource: true,
				overlays: [ [ "Arrow", { width:15, length:15, location:1 }	] ]
		}
    
    jsPlumbInstance.registerConnectionType("basic", myConnType); 

		//to ensure new elements unique name
	  var i = 0;
		if (editable !== null && editable === true)
	  $('#graphContainer').dblclick(function(e) {
			createNode({ name: "New Skill "+i,
										icon: default_icon,
										node_div_name: "new_state" + i,
										nodeid: null,
										content: "",
										offsetTop: e.pageY - this.offsetLeft,
										offsetLeft: e.pageX - this.offsetTop,
										editable: true });
			i++;    
		});

		//initializes the editing tool bar
		$("#edit_add_node").click(function(e) {
			createNode({ name: "New Skill "+i,
										icon: default_icon,
										node_div_name: "new_state" + i,
										nodeid: null,
										content: "",
										offsetTop: $("#graphContainer").offsetLeft,
										offsetLeft:$("#graphContainer").offsetTop,
										editable: true });
			i++;
		});
		
		$("#edit_add_node_external").click(function(e) {
			createExtNode(i);
			i++;
		});
		
		$("#edit_save").click(function(e){
			postGraph();
		});
		
		$("#edit_reduce_width").click(function(e){ resize_container("width" , -50); });
		$("#edit_reduce_height").click(function(e){ resize_container("height" , -50); });
		$("#edit_enlarge_width").click(function(e){ resize_container("width" , 50); });
		$("#edit_enlarge_height").click(function(e){ resize_container("height" , 50); });
		
}


