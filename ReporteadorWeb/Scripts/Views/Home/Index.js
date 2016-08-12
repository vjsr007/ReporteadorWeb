var Home = Home || {};

(function (self) {
    var $idForm = "#frmReporteador"
    var $form = function (selector) { return $($idForm).find(selector) };
    var tablas = {};

    var controls = {
        get form() { return $($idForm) },
        get paper() { return $form('#paper') },
        get grid() { return $form('#grid') },
        get pager() { return $form('#pager') },
        get tabs() { return $form('#tabs') },
        get btnRun() { return $form('#btnRun') },
        get cmbTop() { return $form('#cmbTop') },
        get cmbShema() { return $form('#cmbSchema') },
        get txtFilter() { return $form('#txtFilter') },
        get dataShape() { return $form('[data-shape="TableShape"]') },
    }

    var imageFormat = function (cellvalue, options, rowObject) {
        var minus = "R0lGODlhCwALAIABAAAAAP///yH5BAEAAAEALAAAAAALAAsAAAIUhI8Wy6zdHlxyqnTBdHqHCoERlhQAOw=="

        //cellvalue = base64js.toByteArray(minus);
        var image = "<img width='50' heigth='50' src='data:image/bmp;charset=utf-8;base64," + Utils.hexToBase64(cellvalue) + "' />";

        return image;
    }

    var getMetadata = function (type, key) {
        switch (type) {
            case "int": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: "integer",
                    formatoptions: { decimalSeparator: ".", thousandsSeparator: "" },
                    sorttype: "integer",
                }
                break;
            }
            case "bigint": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: "integer",
                    sorttype: "integer",
                }
                break;
            }
            case "decimal": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: "number", align: "right",
                    sorttype: "number",
                }
                break;
            }
            case "money": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: "currency", align: "right",
                    formatoptions: { decimalSeparator: ".", thousandsSeparator: ",", decimalPlaces: 2, prefix: "$ " },
                    sorttype: "number",
                }
                break;
            }
            case "float": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: "number", align: "right",
                    sorttype: "number",
                }
                break;
            }

            case "date": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: 'date', formatoptions: {
                        srcformat: 'Y/m/d',
                        newformat: 'Y/m/d'
                    },
                    sorttype: "date",
                }
                break;
            }
            case "datetime2": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: 'date', formatoptions: {
                        srcformat: 'Y/m/d H:i:s',
                        newformat: 'Y/m/d H:i:s'
                    },
                    sorttype: "date",
                }
                break;
            }
            case "datetime": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: 'date', formatoptions: {
                        srcformat: 'Y/m/d H:i:s',
                        newformat: 'Y/m/d H:i:s'
                    },
                    sorttype: "date",
                }
                break;
            }
            case "image": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: imageFormat
                }
                break;
            }
            case "binary": {
                return {
                    name: key,
                    index: key,
                    sortable: true,
                    editable: false,
                    formatter: imageFormat
                }
                break;
            }
        }

        return null;
    }

    var configurarGrid = function (data) {
        
        //var collection = $.parseJSON(data).root.row;
        var collection = $.parseJSON(data.json);
        var columns = data.headers;
        data = null;

        var model = new Array
        var headers = new Array;
        try {
            collection.forEach(function (col, idx) {

                var i = 0;
               
                for (var key in col) {
                    var object = getMetadata(columns[i].DATA_TYPE, key);

                    if (object == null) {
                        object =
                        {
                            name: key,
                            index: key,
                            sortable: true,
                            editable: false
                        };
                    }

                    model.push(object);
                    headers.push(key);

                    i++;
                }

                if (idx == 0) throw "break";
            });
        }
        catch (e) { /*Utils.mostrarMensaje("Error al llenar grid.", e.message) */};

        controls.grid.GridUnload();

        controls.grid.jqGrid({
            datatype: 'local',
            colNames: headers,
            colModel: model,
            data: collection,
            pager: controls.pager,
            viewrecords: true,
            sortorder: "asc",
            width: '100%',
            rowNum: 10,
            rowList: [10, 20, 50, 100],
            height: '100%',
            autowidth: true,
            shrinkToFit: false,
        }); //end grid

        controls.tabs.tabs({ active: 1 });
    }

    var obtenerTablas = function (callBack) {
        Utils.ejecutarAjax({}, 'Home/ObtenerTablas', 'post', function (data) {
            if (callBack) callBack(data);
        });
    }

    var init = function () {
        obtenerTablas(function (data) {
            tablas.tablas = data;
            tablas.entities = new Array;

            DiagramaER.init({
                entities: tablas
            });

            controls.tabs.tabs();

            eventos();
        });
    }

    var eventos = function () {

        controls.btnRun.click(function (e) {
            DiagramaER.run(parseInt(controls.cmbTop.val()),configurarGrid);
        });


        controls.cmbShema.change(function () {

            if (controls.cmbShema.val() != "") {
                controls.dataShape.hide();
                $('[data-entity^="{0}."]'.format($.trim(controls.cmbShema.val()).toLowerCase())).show();
            }
            else {
                controls.dataShape.show();
            }
        });

        controls.txtFilter.keyup(function () {
            if (controls.txtFilter.val() != "") {
                controls.dataShape.hide();
                $('[data-entity*="{0}"]'.format($.trim(controls.txtFilter.val()).toLowerCase())).show();
            }
            else {
                controls.dataShape.show();
            }

        });
    }

    $(init);

})(Home.Index = Home.Index || {});