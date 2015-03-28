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
					treeSave["node"][this.id] = { title: this.textContent,
																		offsetTop: this.offsetTop - shiftTop,
																		offsetLeft: this.offsetLeft - shiftLeft};
				});


        var linkList = jsPlumb.getAllConnections();

        for (var m in linkList) {
                treeSave["link"]["link"+m] = { sourceNode: linkList[m].sourceId,
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


	/*$.ajax({type: method,
					url: '/nodes/'+nl,
					data: formParam,
					dataType: 'json',

					success:function(response){ 
            if (response.redirect) {
                window.location.href = response.redirect;
            }
            else {
							displayTrace(response);
						
							//JSON.parse(response);

							$("fMessage").removeClass();
							$("fMessage").addClass("alert alert-" + response.status);
							$("fMessage").html(response.message);
            }
					},
					error: function (data, error){
						$("fMessage").removeClass();
						$("fMessage").addClass("alert alert-error");
						$("fMessage").html("An error occurred while querying the server.");
				}
    });*/
}


// Defining some styles for jsPlumb	
// from jsplumb demo flowchart
// this is the paint style for the connecting lines..
var connectorPaintStyle = {
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
		paintStyle = {
				strokeStyle: "#7AB02C",
				fillStyle: "transparent",
				radius: 2,
				lineWidth: 3,
				gap: 5
		},
// the definition of source endpoints (the small blue ones)
		sourceEndpoint = {
				anchor: 'Continuous',
				endpoint: "Dot",
				paintStyle: paintStyle,
				connector: [ "Flowchart", { stub: [10, 10], gap: 5, cornerRadius: 10 } ],
				connectorStyle: connectorPaintStyle,
				hoverPaintStyle: endpointHoverStyle,
				connectorHoverStyle: connectorHoverStyle,
				dragOptions: {},
				overlays: [ [ "Arrow", { width:15, length:15, location:1 }	] ]
		},
		// the definition of target endpoints (will appear when the user drags a connection)
		targetEndpoint = {
				anchor: 'Continuous',
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
	var node_div_id = param["node_div_name"];
	//var skill_div = $('<div>').attr('id', "large_"+node_div_id);
	var icon_skill = $('<div>').attr('id', node_div_id).addClass('itemSkill');
	var desc_skill = $('<div>').attr('id', "desc_" + node_div_id).addClass('descSkill');
	
	//skill_div.append(icon_skill);
	var title = $('<div>').addClass('title');
	var connect = $('<div>').attr('id', "connect_" + node_div_id).addClass('connect');
	
	icon_skill.append(connect);
	//icon_skill.append("<img id='skill-pic'"+node_div_id+" src='/assets/skill-1-48.png'/>");
	icon_skill.css({ 'background-image': "url(/assets/skill-1-48.png);" } );
	
	desc_skill.append(title);
	var skill_name = $('<input>').attr('type', 'text');
	if ( param["name"] === null ){
		//if the name is not set, i.e new node
		title.append(skill_name);
		icon_skill.css({
			'top': param["offsetTop"] + "px",
			'left': param["offsetLeft"] +"px"
		});
	}
	else {
		//if the node is loaded, we rectify the relative position to the container
		var pTop = parseInt(param["offsetTop"], 10) + document.getElementById('graphContainer').offsetTop;
		var pLeft= parseInt(param["offsetLeft"], 10) + document.getElementById('graphContainer').offsetLeft;
		icon_skill.css({
			'top': pTop + "px",
			'left': pLeft + "px"
		});
		title.text(param["name"]);
	}
	
	$('#graphContainer').append(icon_skill);
	$('#graphContainer').append(desc_skill);
	
	
	jsPlumb.makeSource(connect, {
		parent: node_div_id,
		anchor: 'Continuous',
		}, {parent: node_div_id,
				anchor: 'Continuous',
				endpoint: "Dot",
				paintStyle: paintStyle,
				connector: [ "Flowchart", { stub: [10, 10], gap: 5, cornerRadius: 10 } ],
				connectorStyle: connectorPaintStyle,
				hoverPaintStyle: endpointHoverStyle,
				connectorHoverStyle: connectorHoverStyle,
				dragOptions: {},
				overlays: [ [ "Arrow", { width:15, length:15, location:1 }	] ]
		});
	
	
	jsPlumb.makeTarget(node_div_id, {
		anchor: 'Continuous'
	}, sourceEndpoint);
	
	if ( param["name"] === null ){
		icon_skill.focus();
		icon_skill.keyup(function(e) {
			if (e.keyCode === 13) {
				$(this).parent().text(this.value);
			}
		});
	}

	if ( param["draggable"] === true ){
		jsPlumb.draggable(icon_skill, {
			containment: 'parent'/*,
			grid: [40, 40]*/
		});
	}
	
	//display description box on click
	icon_skill.click(function(e) {
		$("desc_"+node_div_id).css({"visibility": "visible"});
	});
	
	
	//suppress a node on dblclick it
	icon_skill.dblclick(function(e) {
		jsPlumb.detachAllConnections($(this));
		$(this).remove();
		e.stopPropagation();
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

	var conn = jsPlumb.connect(	{
			source:  param["source_node"].toString(),
			target: param["target_node"].toString(),
			link_id: linkid
	}, sourceEndpoint	);
	var connEndpoints = conn.endpoints;
	console.log(connEndpoints);
	for (var i =0; i < 2; i++){
		connEndpoints[i].setPaintStyle(paintStyle);
	}
	conn.setParameter("link_type", "default");
	conn.setParameter("link_id", linkid);

}

/*
 * init_jsplumb: called after the graph page has been created to initialize jsPlumb internals and bind events.
 */
function init_jsplumb() {
	
		console.log("starting jsplumb demo code");
	   var instance = jsPlumb.getInstance({
        // default drag options
        DragOptions: { cursor: 'pointer', zIndex: 2000 },
        // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
        // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
        ConnectionOverlays: [
            [ "Arrow", { location: 1 } ]
        ],
        Container: "flowchart-demo"
    });
    console.log ("instance ok");
    
	  jsPlumb.setContainer($('#graphContainer'));
	
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
