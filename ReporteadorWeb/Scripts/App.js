var App = {};
(function (self) {
    "use strict";

    self.dontBlock = false;

    var initAngular = function () {
        self.Angular = angular.module("ReporteadorWeb", ['ui.bootstrap']);
    }

    var configBlockUI = function () {
        $.blockUI.defaults.css = {
            padding: '6px 0',
            margin: '-18px 0 0 -83px',
            width: '160px',
            top: '50%',
            left: '50%',
            textAlign: 'center',
            color: '#FFFFFF',
            border: '2px solid #acdd4a',
            backgroundColor: '#6EAC2C',
            cursor: 'normal',
            baseZ: 2000,
        };

        // styles for the overlay 
        $.blockUI.defaults.overlayCSS = {
            backgroundColor: '#AAAAAA',
            opacity: 0.3,
            cursor: 'wait',
            baseZ: 1999
        };

        $.blockUI.defaults.message = 'Un momento por favor...';
    }

    var configScrollUp = function () {
        $("body").append("<div class='scrollup'>↑ Subir</div>");
        $(window).scroll(function () {
            if ($(this).scrollTop() > 120)
                $('.scrollup').fadeIn();
            else
                $('.scrollup').fadeOut();
        });
        $(document).on("click", ".scrollup", function (e) {
            e.preventDefault();
            $("html, body").stop().animate({ scrollTop: 0 }, "slow");
        });
    }

    var configAjax = function () {
        $.ajaxSetup({ cache: false });

        $(document)
           .ajaxSend(function (e, request, settings) {

           }).ajaxStart(function (e) {
               if (!self.dontBlock) {
                   $.blockUI();
               }
           }).ajaxStop(function () {
               $('*').each(function () {
                   if ($(this).css('cursor') == 'wait') $(this).css('cursor', 'default');
               });

               $.unblockUI();
           }).ajaxSuccess(function (e, xhr, settings, data) {
               try { var data = $.parseJSON(data) } catch (e) { };
               if (data.Error) {
                   Utils.mostrarMensaje("ReporteadorWeb", data.Mensaje);

                   return false;
               }
           }).ajaxError(function (e, jqxhr, settings, thrownError) {
               $.unblockUI();

               Utils.mostrarMensaje("Error: " + settings.url, thrownError);

               e.preventDefault();

               return true;
           });
    }

    var docReady = function () {
        ///<summary>Ejecución al realizar $.ready()</summary>
        configScrollUp();

        configAjax();

        configJqGrid();
    };

    var handleError = function () {
        window.onerror = function (message) {
            $.unblockUI();
            Utils.mostrarMensaje("Error ", message);
        };
    }

    var configJqGrid = function () {

        $.extend($.jgrid.defaults, {
            loadui: false,
            rowNum: 50,
            scroll: false,
            hoverrows: false,
            //rownumbers: true 
        });

    }

    var load = function () {
        //<summary>Cargar al momento</summary>
        $(docReady);

        configBlockUI();

        handleError();

        crearBds();
    }

    function crearBds() {
        if (window.openDatabase) {
            var db = window.openDatabase('localdb', '1.0', 'localdb', 2 * 1024 * 1024);
            db.transaction(function (tx) {

                tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)');

                var maxID = 1
                tx.executeSql('SELECT MAX(id) as id FROM foo', [], function (tx, results) {
                    maxID = parseInt(results.rows.item(0).id) + 1;

                    tx.executeSql('INSERT INTO foo (id, text) VALUES ({0}, "synergies")'.format(maxID));
                });


            });
        }
        else {
            console?console.log("No soporta IndexedDB"):"";
        }
    }

    load();

})(App);