var Home = Home || {};

(function (self) {
    var $idForm = "#frmdialogEditarCampos"
    var $form = function (selector) { return $($idForm).find(selector) };
    var tablas = {};

    var controls = {
        get form() { return $($idForm) },
    }


    var init = function () {
        eventos();
    }

    self.Success = function (value) { };

    var eventos = function () {

    }

    self.renderButtons = function () {
        self.Modal.dialog(
        {
            buttons: {
                Guardar: function () {
                    self.Success("nuevo");
                    self.Modal.dialog({ beforeClose: {} });
                    self.Modal.dialog("close");
                },
                Cerrar: function () {
                    self.Modal.dialog("close");
                }
            }
        });


        if (self.Accion == "E") {
            prepararEdicion();
        }
    }


    $(init);

})(Home.dialogEditarCampos = Home.dialogEditarCampos || {});