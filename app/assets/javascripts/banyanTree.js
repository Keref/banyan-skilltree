jsPlumb.ready(function() {

	  jsPlumb.setContainer($('#graphContainer'));
	
	  var i = 0;

	  $('#graphContainer').dblclick(function(e) {
		var newState = $('<div>').attr('id', 'state' + i).addClass('item');
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
	});
