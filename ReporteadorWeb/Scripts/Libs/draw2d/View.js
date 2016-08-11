example.View = draw2d.Canvas.extend({
	init:function(id)
    {
		this._super(id, 2000,2000);
		
		this.setScrollArea("#"+id);
	},
    /**
     * @method
     * Called if the user drop the droppedDomNode onto the canvas.<br>
     * <br>
     * Draw2D use the jQuery draggable/droppable lib. Please inspect
     * http://jqueryui.com/demos/droppable/ for further information.
     * 
     * @param {HTMLElement} droppedDomNode The dropped DOM element.
     * @param {Number} x the x coordinate of the drop
     * @param {Number} y the y coordinate of the drop
     * @param {Boolean} shiftKey true if the shift key has been pressed during this event
     * @param {Boolean} ctrlKey true if the ctrl key has been pressed during the event
     * @private
     **/
    onDrop : function(droppedDomNode, x, y, shiftKey, ctrlKey)
    {
        var type = $(droppedDomNode).data("shape");
        var entity = $(droppedDomNode).data("entity");
        var figure = eval("new "+type+"();");
        
        
        figure.setName(entity);


        //Creamos la entidad y sus propiedades
        try {
            var UserData = new Array;
            _.filter(DiagramaER.tablas, function (t) {
                if ('{0}.{1}'.format(t.TABLE_SCHEMA, t.TABLE_NAME) == entity)
                    return t;
            }).forEach(function (t) {
                UserData.push(t);
            
                figure.addEntity(t.COLUMN_NAME);           
            });

            figure.addUserData(UserData);
        }catch(e){}

        // agregar soporte de comando drag&drop
        var command = new draw2d.command.CommandAdd(this, figure, x, y);
        this.getCommandStack().execute(command);
    }
});

