sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/xml/XMLModel"],
    function (Controller, XMLModel) {
        "use strict";
        return Controller.extend("medunited.view.earztbrief", {
            onInit: function () {
                this.getView().setModel(
                    new XMLModel("./template/Arztbrief-Minimal.XML")
                );
            },
            onClick: function() {
                const oXmlDoc = this.getView().getModel().getData();
                const sXml = new XMLSerializer().serializeToString(oXmlDoc.documentElement);
                console.log(sXml);

                // TODO: Send email via EmailJS

                // TODO: Add PDF/A document
            }
        });
    }
);