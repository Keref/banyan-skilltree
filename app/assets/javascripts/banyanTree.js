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
        for (iKey in itemList){{
                if ( typeof itemList[iKey] == "object" )
                                //trace.innerHTML += iKey + ":" + typeof(itemList[iKey]) + "<hr>";
                                //for (k in itemList[iKey]) trace.innerHTML += k + " : " + JSON.stringify(itemList[iKey][k]) + "<br>";
                                treeSave["node"]["state"+iKey] = { title: itemList[iKey]["textContent"],
                                offsetTop: itemList[iKey]["offsetTop"],
                                offsetLeft: itemList[iKey]["offsetLeft"] };
                }
        }

        var linkList = jsPlumb.getAllConnections();

        for (var m in linkList) {
                //TODO: getType gives some shitty unusable object for its internal use, can't be used directly
                treeSave["link"]["link"+m] = { sourceNode: linkList[m].sourceId,
                                                                                targetNode: linkList[m].targetId,
                                                                                linkType: linkList[m].getType() };
        }

        //trace.innerHTML += JSON.stringify(treeSave);
        return treeSave;
}



/*
 * displayTrace: displays an array in the save state to allow parameter check
 */
function displayTrace(arrayP ){
	var trace = document.getElementById('savestate');
	trace.innerHTML = JSON.stringify(arrayP);
}


/*
 * postNewGraph: sets the array of parameters and sends it back to the
 */
function postNewGraph(){
	formParam = listContainer();
	//TODO: make proper test error proof
	var authToken = document.getElementsByName("authenticity_token");
	if (authToken != null) formParam[authToken[0].name] = authToken[0].value;
	var utf8 = document.getElementsByName("utf8");
	if (utf8 != null) formParam["utf8"] = utf8[0].value;
	var name = document.getElementById("node_name");
	if (name != null) formParam["name"] = name.value;
	
	displayTrace(formParam);

	//end function: sends the form
	//$.post('/nodes/', formParam);
	
	$.ajax({type: "POST",
					url: '/nodes/',
					data: formParam,
					success:  function(data, textStatus){
						       if (data.redirect) {
            // data.redirect contains the string URL to redirect to
            window.location.href = data.redirect;
        }
        else {
            // data.form contains the HTML for the replacement form
            $("#myform").replaceWith(data.form);
        }
    }
    });
}



/*
 * init_jsplumb: called after the graph page has been created to initialize jsPlumb internals and bind events.
 */
function init_jsplumb() {
	  jsPlumb.setContainer($('#graphContainer'));
	
	  var i = 0;

	  $('#graphContainer').dblclick(function(e) {
		var newState = $('<div>').attr('id', 'state' + i).addClass('itemSkill');
		var title = $('<div>').addClass('title');
		var connect = $('<div>').addClass('connect');
		
		newState.css({
		  'top': e.pageY,
		  'left': e.pageX
		});
		
		newState.append(title);
		var stateName = $('<input>').attr('type', 'text');
		title.append(stateName);
		newState.append(connect);
		
		$('#graphContainer').append(newState);
		
		jsPlumb.makeTarget(newState, {
		  anchor: 'Continuous'
		});
		
		jsPlumb.makeSource(connect, {
		  parent: newState,
		  anchor: 'Continuous'
		});		
		stateName.focus();
		stateName.keyup(function(e) {
			if (e.keyCode === 13) {
				$(this).parent().text(this.value);
			}
		});

		jsPlumb.draggable(newState, {
		  containment: 'parent'
		});

		newState.dblclick(function(e) {
		  jsPlumb.detachAllConnections($(this));
		  $(this).remove();
		  e.stopPropagation();
		});		
		
		i++;    
	});
}
