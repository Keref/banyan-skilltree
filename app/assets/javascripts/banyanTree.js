/*
 * listContainer: lists and returns the elements of the graph container (nodes and links)
 *
 * return array( node%int: { textContent, offsetTop, offsetLeft }, link%int: { sourceNode, targetNode, linkType } )
 */
function listContainer(){
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
        treeSave["icon"] = $('#tree_icon').attr('src').replace(/.*\//g,'').replace(/-[0-9a-f]{12,50}.png$/, '.png');
        treeSave["tags"] = $('#tree_tags').val();
        
				$('div').filter(function() {
					return /^(new|load)_state\d+$/.test(this.id);
				}).each(function() {
					var pos=$(this).position();
					var icon_name = $('#icon_'+this.id).attr('src').replace(/.*\//g,'').replace(/-[0-9a-f]{12,50}.png$/, '.png');

					treeSave["node"][this.id] = { title: encodeURI($("#desc_area_title_"+this.id).val()),
																			content: encodeURI($("#desc_area_"+this.id).val()),
																				 icon: icon_name,
																		offsetTop: pos.top,
																		offsetLeft: pos.left};
				});
				


        var linkList = jsPlumb.getAllConnections();

        for (var m in linkList) {
					//FUCKING BUG HERE WHERE PARENT IS NOT THE CLASS THE ENDPOINT IS CONNECTED TO
								var source = linkList[m].sourceId.replace(/^connect_/,"");
                treeSave["link"]["link"+m] = { sourceNode: source,
                                               targetNode: linkList[m].targetId,
                                               linkType: linkList[m].getParameter("link_type"),
                                               link_id: linkList[m].getParameter("link_id") };
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
function postNewGraph(){
	formParam = listContainer();
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
					error: function (data, error){
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
 *  createNode: adds a node to the jsPlumb instance.
 * 
 * param: { name: 'totoSkill',
					node_div_name: 'load_state65',
					nodeid:'65',
					content:'zis ma skillz',
					offsetTop:'330',
					offsetLeft:'335' }
 */
function createNode(param){
	
	//displayTrace(param);
	var icon_path = '/assets/icon-pignon-128.png';
	if ( param["icon"] !== null ) icon_path = param["icon"];
	//console.log(icon_path);
	var node_div_id = param["node_div_name"];
	var skill_node = $('<div>').attr('id', node_div_id).addClass('skill_node');
	var skill_node_title = $('<div>').addClass('skill_node_title');
	//var skill_node_title_content = $('<p>');
	var skill_node_icon = $('<img>').attr('id','icon_'+node_div_id).attr('src', icon_path).attr('width','40').attr('height','40').addClass('skill_node_icon');
	var skill_node_connect = $('<div>').attr('id', "connect_" + node_div_id).addClass('skill_node_connect');
	var desc_skill = $('<div>').attr('id', "desc_" + node_div_id).addClass('skill_desc');
	var	desc_top = $("<div>").attr('id','desc_area_titleline_'+node_div_id).addClass('skill_desc_top');
	var desc_icon = $('<img>').attr('src', icon_path).attr('width','48').attr('height','48').addClass('skill_desc_icon');
	desc_skill.append(desc_top);
	desc_top.append(desc_icon);
	var desc_content,	desc_title, desc_title_input;
	
	skill_node.append(skill_node_icon);
	skill_node.append(skill_node_title);
	
	
	var name = decodeURI(param["name"]);
	desc_skill.attr("title",name);
	skill_node_title.text(name);
	
	//if editable, the desc_box is an textarea, else just a regular div
	if  ( param["editable"] == true ){
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
	skill_node.click(function(e) {
		hide_desc();
			
		var s = document.getElementById(node_div_id);
		var l = s.offsetLeft + 80;
		//TODO: we move the desc box next to the skill box (in cas it's been dragged)
		//$("#desc_" + node_div_id).css({"visibility":"visible", "top": s.offsetTop+"px", "left": l+"px"});
		$('#desc_area_' + node_div_id).jqte();
		$("#desc_" + node_div_id).dialog({
			title: desc_title.val(),
			dialogClass: 'ui-alert',
			maxHeight: 600,
			width: 600,
			close: function(){
				if ( param["editable"] === true ) {
					skill_node_title.text(desc_title_input.val());
				}
			}
		}).enableSelection();
	});	
	
	
	if  ( param["editable"] == true ){
		jsPlumb.makeTarget(node_div_id, targetEndpoint);
		
		jsPlumb.makeSource(skill_node_connect, {
				parent: skill_node,
				anchor: 'Continuous',
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
		
		//makes the skill draggable, and prevent dragging from propagating
		jsPlumb.draggable(skill_node, {
			containment: 'parent',
			stop: function(event, ui) {
				// event.toElement is the element that was responsible
				// for triggering this event. The handle, in case of a draggable.
				$( event.toElement ).one('click', function(e){ e.stopImmediatePropagation(); }) }
			,
			grid: [40, 40]
		});

		//suppress a node on dblclick it
		skill_node.dblclick(function(e) {
			jsPlumb.detachAllConnections($(this));
			jsPlumb.removeAllEndpoints($(this));
			$(this).remove();
			desc_skill.remove();
			e.stopImmediatePropagation();
		});	
		
	}
	hide_desc();
}


/*
 * icon_selector_dialog: creates an icon selector dialog
 * 
 * when browsing the icons pages stay in the dialog; on choosing an icon, icon_div (and optional_icon_div)
 * display the chosen image
 */
function icon_selector_dialog ( icon_div , optional_icon_div) {
		var icon_handler = $("<div>").attr('id', "icon_handler");
		console.log(icon_div);
		//defining a function to display 
		function load_desc_icon(url){
			icon_handler.load(url);
			icon_handler.click(function (event) {
				event.preventDefault();
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
		return /^desc_(new|load)/.test(this.id);
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
 * init_jsplumb: called after the graph page has been created to initialize jsPlumb internals and bind events.
 */
function init_jsplumb() {
	
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



	  $('#graphContainer').dblclick(function(e) {
			createNode({ name: "New Skill",
										node_div_name: "new_state" + i,
										nodeid: null,
										content: "",
										offsetTop: e.pageY - this.offsetLeft,
										offsetLeft: e.pageX - this.offsetTop,
										editable: true });
			i++;    
		});


}


