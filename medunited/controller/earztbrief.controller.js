sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/xml/XMLModel"],
    function (Controller, XMLModel) {
        "use strict";
        return Controller.extend("medunited.view.earztbrief", {
            onInit: function () {
                this.getView().setModel(
                    new XMLModel()
                );
            }
        });
    }
);