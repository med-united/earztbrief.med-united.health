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
                const sXml = new XMLSerializer().serializeToString(oXmlDoc.documentElement);
                console.log(sXml);

                // Send email via backend
                const templateParams = {
                    contactname: oXmlModel.getProperty("/recordTarget/patientRole/patient/name/given")
                        + " "
                        + oXmlModel.getProperty("/recordTarget/patientRole/patient/name/family"),
                    contactemail: oXmlModel.getProperty("/recordTarget/patientRole/providerOrganization/telecom/@value"),
                    contactmessage: oXmlModel.getProperty("/component/structuredBody/component/section").toString(),
                    attachment: sXml,
                };
                fetch('https://earztbrief-sender.med-united.health/sendEmail', {
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