sap.ui.define(
    ["sap/ui/core/mvc/Controller", "sap/ui/model/xml/XMLModel"],
    function (Controller, XMLModel) {
        "use strict";

        return Controller.extend("health.med-united.earztbrief", {
            onInit: function () {
                this.getView().setModel(
                    new XMLModel("./template/Arztbrief-Minimal.XML")
                );
            },
            onClick: function () {
                const oXmlModel = this.getView().getModel();
                const oXmlDoc = oXmlModel.getData();
                //create an empty array 
                const xmlParameter = [];
                const sXml = new XMLSerializer().serializeToString(oXmlDoc.documentElement);
                xmlParameter.push(sXml);
                console.log(sXml);

                // Send email via backend
                const templateParams = {
                    contactName: oXmlModel.getProperty("/recordTarget/patientRole/patient/name/given")
                        + " "
                        + oXmlModel.getProperty("/recordTarget/patientRole/patient/name/family"),
                    contactEmail: oXmlModel.getProperty("/recordTarget/patientRole/providerOrganization/telecom/@value"),
                    contactMessage: oXmlModel.getProperty("/component/structuredBody/component/section").toString(),
                    attachment: xmlParameter,
                    datamatrices: null
                };
                fetch('https://mail-sender.med-united.health/sendEmail/earztbrief', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(templateParams)
                });
            }
        });
    }
);