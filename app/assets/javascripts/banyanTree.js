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
	var newState = $('<div>').attr('id', node_div_id).addClass('itemSkill');
	var title = $('<div>').addClass('title');
	var connect = $('<div>').attr('id', "connect_" + node_div_id).addClass('connect');
	
	newState.append(title);
	var stateName = $('<input>').attr('type', 'text');
	if ( param["name"] === null ){
		//if the name is not set, i.e new node
		title.append(stateName);
		newState.css({
			'top': param["offsetTop"] + "px",
			'left': param["offsetLeft"] +"px",
			'position': 'absolute'
		});
	}
	else {
		//if the node is loaded, we rectify the relative position to the container
		var pTop = parseInt(param["offsetTop"], 10) + document.getElementById('graphContainer').offsetTop;
		var pLeft= parseInt(param["offsetLeft"], 10) + document.getElementById('graphContainer').offsetLeft;
		newState.css({
			'top': pTop + "px",
			'left': pLeft + "px",
			'position': 'absolute'
		});
		title.text(param["name"]);
	}
	newState.append(connect);
	
	$('#graphContainer').append(newState);
	
	

	
	
	jsPlumb.makeTarget(node_div_id, {
		anchor: 'Continuous'
		
	});
	
	jsPlumb.makeSource(connect, {
		parent: newState,
		anchor: 'Continuous',
	});
	
	if ( param["name"] === null ){
		stateName.focus();
		stateName.keyup(function(e) {
			if (e.keyCode === 13) {
				$(this).parent().text(this.value);
			}
		});
	}

	if ( param["draggable"] === true ){
		jsPlumb.draggable(newState, {
			containment: 'parent'/*,
			grid: [40, 40]*/
		});
	}

	//suppress a node on dblclick it
	newState.dblclick(function(e) {
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
			link_id: linkid,
        connector: "Flowchart",
        paintStyle: { strokeStyle: "red", lineWidth: 4 },
        hoverPaintStyle: { strokeStyle: "blue" },
        overlays: [
            "Arrow"
        ]
	}	);
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
            [ "Arrow", { location: 1 } ],
            [ "Label", {
                location: 0.1,
                id: "label",
                cssClass: "aLabel"
            }]
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
