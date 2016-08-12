//# sourceURL=Home.dialogEditarCampos.js
var Home = Home || {};

(function (self) {
    var $idForm = "#frmdialogEditarCampos"
    var $form = function (selector) { return $($idForm).find(selector) };
    var tablas = {};
    var controls = {
        get form() { return $($idForm) },
        get cmbCampos() { return $form("#cmbCampos") }
    }

    self.Modal = {};
    //Label - Etiqueta sobre la que se realizo la acción
    self.label = {};

    self.Success = function (value) { };

    self.initialize = function (dialog, label, sucess) {
        self.Modal = dialog;
        self.label = label;
        self.Success = sucess;

        self.Modal.dialog(
        {
            buttons: {
                Guardar: function () {
                    self.Modal.dialog({ beforeClose: {} });
                    self.Modal.dialog("close");
                    self.Success(controls.cmbCampos.val());
                },
                Cerrar: function () {
                    self.Modal.dialog("close");
                }
            }
        });

        cargarCampos();
    }

    var cargarCampos = function () {
        var campos = new Array;
        var camposActuales = new Array;
        DiagramaER.datos.entidades.every(function (e) {
            campos = _.where(e.entities, {id: self.label.id});

            if (campos.length>0){
                camposActuales = e.entities

                campos = _.filter(DiagramaER.tablas, function (t) {
                    if ('{0}.{1}'.format(t.TABLE_SCHEMA, t.TABLE_NAME) == e.name)
                        return t;
                });

                return false;
            }
            else return true;
        });

        var option = '<option value="{0}">{1}</option>';
        var shtml = option.format("","[Select]");
        campos.forEach(function (e) {
            shtml += option.format(e.COLUMN_NAME, e.COLUMN_NAME);
        });

        controls.cmbCampos.html(shtml);
    }

    var eventos = function () {

    }

    var init = function () {
        eventos();

        cargarCampos();
    }

    $(init);

})(Home.dialogEditarCampos = Home.dialogEditarCampos || {});