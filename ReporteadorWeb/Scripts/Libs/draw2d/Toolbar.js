example.Toolbar = Class.extend({
	
	init:function(elementId, view)
	{
		this.html = $("#"+elementId);
		this.view = view;
		
		// register this class as event listener for the canvas
		// CommandStack. This is required to update the state of 
		// the Undo/Redo Buttons.
		//
		view.getCommandStack().addEventListener(this);

		// Register a Selection listener for the state hnadling
		// of the Delete Button
		//
        view.on("select", $.proxy(this.onSelectionChanged,this));
		
		// Inject the UNDO Button and the callbacks
		//
        this.undoButton = $("<button type='button' class='gray'><i class='fa fa-undo' aria-hidden='true'></i></button>");
		this.html.append(this.undoButton);
		this.undoButton.click($.proxy(function(){
		       this.view.getCommandStack().undo();
		},this));

		// Inject the REDO Button and the callback
		//
		this.redoButton = $("<button type='button' class='gray'><i class='fa fa-repeat' aria-hidden='true'></button>");
		this.html.append(this.redoButton);
		this.redoButton.click($.proxy(function(){
		    this.view.getCommandStack().redo();
		},this));
	

		// Inject the DELETE Button
		//
		this.deleteButton = $("<button type='button' class='gray'><i class='fa fa-trash' aria-hidden='true'></button>");
		this.html.append(this.deleteButton);
		this.deleteButton.click($.proxy(function(){
			var node = this.view.getPrimarySelection();
			var command= new draw2d.command.CommandDelete(node);
			this.view.getCommandStack().execute(command);
		}, this));

		this.zoomUpButton = $("<button type='button' class='gray'><i class='fa fa-plus' aria-hidden='true'></button>");
		this.html.append(this.zoomUpButton);
		this.zoomUpButton.click($.proxy(function () {
		    var zoom = this.view.getZoom()
		    this.view.setZoom(zoom - .1);
		}, this));

		this.zoomDownButton = $("<button type='button' class='gray'><i class='fa fa-minus' aria-hidden='true'></button>");
		this.html.append(this.zoomDownButton);
		this.zoomDownButton.click($.proxy(function () {
		    var zoom = this.view.getZoom()
		    this.view.setZoom(zoom + .1);
		}, this));

		this.RunButton = $("<button type='button' id='btnRun' class='gray'><i class='fa fa-play' aria-hidden='true'></button>");
		this.html.append(this.RunButton);

		this.OpenButton = $("<button type='button' id='btnOpen' class='gray'><i class='fa fa-folder-open' aria-hidden='true'></button>");
		this.html.append(this.OpenButton);

		this.SaveButton = $("<button type='button' id='btnSave' class='gray'><i class='fa fa-save' aria-hidden='true'></button>");
		this.html.append(this.SaveButton);

		this.TopCombo = $("<div><label type='button' for='cmbTop'>Rows:</label><select id='cmbTop'><option value='10'>10 rows</option><option value='50'>50 rows</option><option value='100'>100 rows</option><option value='1000'>1,000 rows</option><option value='10000'>10,000 rows</option><option value='100000'>100,000 rows</option></select><div>");
		this.html.append(this.TopCombo);
		
        this.disableButton(this.undoButton, true);
        this.disableButton(this.redoButton, true);
        this.disableButton(this.deleteButton, true);
    },

	/**
	 * @method
	 * Called if the selection in the cnavas has been changed. You must register this
	 * class on the canvas to receive this event.
	 *
	 * @param {draw2d.Canvas} emitter
	 * @param {Object} event
	 * @param {draw2d.Figure} event.figure
	 */
	onSelectionChanged : function(emitter, event)
	{
        this.disableButton(this.deleteButton,event.figure===null );
	},
	
	/**
	 * @method
	 * Sent when an event occurs on the command stack. draw2d.command.CommandStackEvent.getDetail() 
	 * can be used to identify the type of event which has occurred.
	 * 
	 * @template
	 * 
	 * @param {draw2d.command.CommandStackEvent} event
	 **/
	stackChanged:function(event)
	{
        this.disableButton(this.undoButton, !event.getStack().canUndo());
        this.disableButton(this.redoButton, !event.getStack().canRedo());
	},
	
	disableButton:function(button, flag)
	{
	   button.prop("disabled", flag);
       if(flag){
            button.addClass("disabled");
        }
        else{
            button.removeClass("disabled");
        }
	}
});