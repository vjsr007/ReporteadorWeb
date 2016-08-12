var DiagramaER = {} || DiagramaER;
(function (self) {
    "use strict";

    self.entities = new Array;
    self.tablas = new Array;
    //Formulario principal
    var $form = function (selector) { return $("#frmReporteador").find(selector) };
    //DIV Canvas
    var whiteboard = "#canvas";
    var params;
    var defaults = {
        get whiteboard() { return whiteboard; }, set whiteboard(val) { whiteboard = val; },
        get position() { return "relative"; },
        get overflow() { return "hidden"; },
    };
    var controls = {
        get whiteboard() { return $form(defaults.whiteboard); },
        get sideNav() { return $form('#side-nav') },
        get lyrEntities() { return this.sideNav.find("#lyrEntities") },
    };
    var url = {
        get run() { return "{0}Home/EjecutarConsulta".format(webroot); },
        get dialogEditarCampos() { return "{0}Home/dialogEditarCampos".format(webroot); },
    }

    var routerToUse;
    var app;
    var reader;

    self.datos = {
        get routerToUse() { return routerToUse; },
        get app() { return app; },
        get reader() { return reader; },
        get entidades() {
            var entidades;
            var writer = new draw2d.io.json.Writer();
            writer.marshal(app.view, function (data) { entidades = data });

            return entidades;
        }
    }

    var crearSidemenu = function (Tablas) {
        var tablas = _.sortBy(_.unique(_.map(Tablas, function (t) {
            return '{0}.{1}'.format(t.TABLE_SCHEMA, t.TABLE_NAME)
        }))) || new Array;

        var html = '<div data-entity="{0}" data-shape="TableShape"' +
                    ' class="palette_node_element draw2d_droppable' +
                    ' ui-draggable" title="Arrastrar y soltar" style="z-index: 1;">{0}</div>';

        tablas.forEach(function (t) {
            controls.lyrEntities.append(html.format(t));
        });
    }

    var initWhiteboard = function () {
        params = params ? params : {};
        params.entities = params.entities ? params.entities : {};
        params.entities.tablas = params.entities.tablas ? params.entities.tablas : {};
        params.entities.entities = params.entities.entities ? params.entities.entities : {};

        self.tablas = params.entities.tablas;

        //Se crea antes para que enlace eventos de drop&drag
        crearSidemenu(params.entities.tablas);

        routerToUse = new draw2d.layout.connection.InteractiveManhattanConnectionRouter();

        app = new example.Application();

        app.view.installEditPolicy(new draw2d.policy.connection.DragConnectionCreatePolicy({
            createConnection: function () {
                var connection = new draw2d.Connection({
                    stroke: 3,
                    outlineStroke: 1,
                    outlineColor: "#303030",
                    color: "91B93E",
                    router: routerToUse
                });
                return connection;
            }
        }));

        reader = new draw2d.io.json.Reader();
        reader.unmarshal(app.view, params.entities.entities);

        
    };

    self.run = function (callBack) {
        var entities = new Array;

        self.datos.entidades.forEach(function (e) {
            var entity = {
                id: e.id,
                name: e.name,
                type: e.type,
                entities: e.entities,
                userData: e.userData.columns == null ? null : e.userData.columns,
                json: JSON.stringify(e),
                targetNode: e.target ? e.target.node : null,
                targetPort: e.target ? e.target.port : null,
                sourceNode: e.source ? e.source.node : null,
                sourcePort: e.source ? e.source.port : null,
            }

            entities.push(entity);
        });
        Utils.ejecutarAjax(entities, url.run, 'post', function (data) {
            if (callBack) callBack(data);
        });
    }

    self.init = function (p) {
        params = p;
        initWhiteboard();
    };

    /*================================================================
                            OVERRIDE DRAW2D
    ==================================================================*/

    /**
     * @method
     * Trigger the edit of the label text. override
     * 
     * @param {draw2d.shape.basic.Label} label the label to edit
     */
    draw2d.ui.LabelEditor.prototype.start = function (label) {
        return false;

        var config = this.configuration;
        var newText = prompt(this.configuration.text, label.getText());
        if (newText) {
            var cmd = new draw2d.command.CommandAttr(label, { text: newText });
            label.getCanvas().getCommandStack().execute(cmd);

            config.onCommit(label.getText());
        }
        else {
            config.onCancel();
        }
    }

})(DiagramaER);


