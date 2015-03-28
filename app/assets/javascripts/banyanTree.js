/*
 * listContainer: lists and returns the elements of the graph container (nodes and links)
 *
 * return array( node%int: { textContent, offsetTop, offsetLeft }, link%int: { sourceNode, targetNode, linkType } )
 */
function listContainer(){
        jsPlumb.setContainer($('#graphContainer'));
        var trace = document.getElementById('savestate');
        trace.innerHTML = "";
        var treeSave = {node: {}, link: {} };
        var itemList = document.getElementsByClassName("itemSkill");
        var gCont = document.getElementById('graphContainer').getElementsByTagName("div");
        
        //blocks position is absolute, and we need relative position to the container
        var shiftLeft = document.getElementById('graphContainer').offsetLeft;
        var shiftTop = document.getElementById('graphContainer').offsetTop;
        
				$('div').filter(function() {
					return /^(new|load)_state\d+$/.test(this.id);
				}).each(function() {
					treeSave["node"][this.id] = { title: encodeURI($("#desc_area_title_"+this.id).val()),
																			content: encodeURI($("#desc_area_"+this.id).val()),
																		offsetTop: this.offsetTop - shiftTop,
																		offsetLeft: this.offsetLeft - shiftLeft};
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
				lineWidth: 4,
				strokeStyle: "#61B7CF",
				joinstyle: "round",
				outlineColor: "white",
				outlineWidth: 2
		},
// .. and this is the hover style.
		connectorHoverStyle = {
				lineWidth: 4,
				strokeStyle: "#216477",
				outlineWidth: 2,
				outlineColor: "white"
		},
		endpointHoverStyle = {
				fillStyle: "#216477",
				strokeStyle: "#216477"
		},
// the definition of source endpoints (the small blue ones)
		sourceEndpoint = {
				anchor: dynamicAnchors,
				endpoint: "Dot",
				paintStyle: {
						strokeStyle: "#7AB02C",
						fillStyle: "transparent",
						radius: 2,
						lineWidth: 3
				},
				connector: [ "Flowchart", { stub: [10, 10], gap: 5, cornerRadius: 10 } ],
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
				paintStyle: { fillStyle: "#7AB02C", radius: 2 },
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

	displayTrace(param);
	var node_div_id = param["node_div_name"];
	var skill_node = $('<div>').attr('id', node_div_id).addClass('skill_node');
	var skill_node_title = $('<div>').addClass('skill_node_title');
	var skill_node_connect = $('<div>').attr('id', "connect_" + node_div_id).addClass('skill_node_connect');
	var desc_skill = $('<div>').attr('id', "desc_" + node_div_id).addClass('skill_desc');

	skill_node_title.css({ "background-image": "url('/assets/skill-1-48.png')"});
	skill_node.append(skill_node_title);
	
	//TODO: set the new title on the fly while we type it
	var desc_title = $("<input>").attr('id', 'desc_area_title_' + node_div_id).attr("type", "text");
	var desc_content = $('<textarea>').attr('id', 'desc_area_' + node_div_id).addClass('skill_desc_content');
	if ( param["content"] === null ){ desc_content.val ("Skill description") ; }
	else { desc_content.val( decodeURI(param["content"]));}
	
	desc_skill.append("Skill name").append(desc_title);
	desc_skill.append("Description").append(desc_content);
	
	if ( param["name"] === null ){
		//if the name is not set, i.e new node
		skill_node_title.text("0");
		skill_node.css({
			'top': param["offsetTop"] + "px",
			'left': param["offsetLeft"] +"px",
			'position': 'absolute'
		});
	}
	else {
		var name = decodeURI(param["name"]);
		desc_title.val(name);
		desc_skill.attr("title",name);
		//if the node is loaded, we rectify the relative position to the container
		var pTop = parseInt(param["offsetTop"], 10) + document.getElementById('graphContainer').offsetTop;
		var pLeft= parseInt(param["offsetLeft"], 10) + document.getElementById('graphContainer').offsetLeft;
		skill_node.css({
			'top': pTop + "px",
			'left': pLeft + "px",
			'position': 'absolute'
		});
		skill_node_title.text(name);
	}
	skill_node.append(skill_node_connect);
	
	$('#graphContainer').append(skill_node);
	$('#graphContainer').append(desc_skill);
	//jsPlumb.addEndpoint(node_div_id, sourceEndpoint);	
	
	jsPlumb.makeTarget(node_div_id, targetEndpoint);
	
	jsPlumb.makeSource(skill_node_connect, {
		  parent: skill_node,
		  anchor: 'Continuous',
		  				endpoint: "Dot",
				paintStyle: {
						strokeStyle: "#7AB02C",
						fillStyle: "transparent",
						radius: 2,
						lineWidth: 3
				},
				connector: [ "Flowchart", { stub: [10, 10], gap: 5, cornerRadius: 10 } ],
				connectorStyle: connectorPaintStyle,
				hoverPaintStyle: endpointHoverStyle,
				connectorHoverStyle: connectorHoverStyle,
				dragOptions: {},
				overlays: [ [ "Arrow", { width:15, length:15, location:1 }	] ]
		}, sourceEndpoint );
	
	//creates a dialog box with the skill content on click the box
	skill_node.click(function(e) {

		hide_desc();
			
		var s = document.getElementById(node_div_id);
		var l = s.offsetLeft + 80;
		//we move the desc box next to the skill box (in cas it's been dragged)
		//$("#desc_" + node_div_id).css({"visibility":"visible", "top": s.offsetTop+"px", "left": l+"px"});
		$("#desc_" + node_div_id).dialog({
			title: desc_title.val(),
			dialogClass: 'ui-alert',
			maxHeight: 600
		}).enableSelection();
	});	
	
	//makes the skill draggable, and prevent dragging from propagating
	if ( param["draggable"] === true ){
		jsPlumb.draggable(skill_node, {
			containment: 'parent',
			stop: function(event, ui) {
        // event.toElement is the element that was responsible
        // for triggering this event. The handle, in case of a draggable.
        $( event.toElement ).one('click', function(e){ e.stopImmediatePropagation(); }) }
			/*,
			grid: [40, 40]*/
		});
	}

	//suppress a node on dblclick it
	skill_node.dblclick(function(e) {
		jsPlumb.detachAllConnections($(this));
		$(this).remove();
		e.stopPropagation();
	});	
	hide_desc();
}


/* hide_desc: hides the description boxes
 */
function hide_desc(){
	$('div').filter(function() {
		return /^desc_/.test(this.id);
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
				connector: [ "Flowchart", { stub: [10, 10], gap: 5, cornerRadius: 10 } ],
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
			createNode({ name: null,
										node_div_name: "new_state" + i,
										nodeid: null,
										content: "",
										offsetTop: e.pageY,
										offsetLeft: e.pageX,
										draggable: true });
			i++;    
		});

}
