sap.ui.define(
    ["sap/ui/core/mvc/Controller",
    "sap/ui/model/xml/XMLModel",
    "sap/ui/model/json/JSONModel",
    "../model/MedicationRequester",
    "../model/Medication",
    "../control/DataMatrixCode"],

    function (Controller, XMLModel, JSONModel, MedicationRequester, Medication, DataMatrixCode) {
        "use strict";

        return Controller.extend("medunited.earztbrief.controller.InputForm", {

            onInit: function () {
                this.getView().setModel(new XMLModel("./template/Arztbrief-Minimal.XML"), "arztbriefXML");
                this.getView().setModel(new JSONModel("./template/otherRequesterFields.json"), "otherRequesterFieldsJSON");                
                this._data = {
                    Medications : [
                        { name:"", pzn:"", effectiveDate:"", dosage:"", note:"" }
                    ]
                };
                this.getView().setModel(new JSONModel(), "Medications");
                this.getView().getModel("Medications").setData(this._data);
            },

            addRow : function () {
                this._data.Medications.push( { name:"", pzn:"", effectiveDate:"", dosage : "", note : ""} );
                this.getView().getModel("Medications").refresh();
            },

            deleteRow : function (oEvent) {
                var deleteRecord = oEvent.getSource().getBindingContext("Medications").getObject();
                for (var i=0; i<this._data.Medications.length; i++) {
                    if(this._data.Medications[i] == deleteRecord ) {
                        this._data.Medications.splice(i,1);
                        this.getView().getModel("Medications").refresh();
                        break;//quit the loop
                    }
                }
            },

            onClick: function () {
                const oXMLModel = this.getView().getModel("arztbriefXML");

                // Preparing XML attachment
                const oXMLDoc = oXMLModel.getData();
                const sXML = new XMLSerializer().serializeToString(oXMLDoc.documentElement);
                let attachmentList = [];
                attachmentList.push(sXML);

                // Model with practitionerFullName and pharmacy 
                const oOtherRequesterFieldsModel = this.getView().getModel("otherRequesterFieldsJSON");

                // Fields for creating a MedicationRequester
                const firstName = oXMLModel.getProperty("/recordTarget/patientRole/patient/name/given");
                const lastName = oXMLModel.getProperty("/recordTarget/patientRole/patient/name/family");
                const birthDate = oXMLModel.getProperty("/recordTarget/patientRole/patient/birthTime/@value");
                const insuranceNumber = oXMLModel.getProperty("/recordTarget/patientRole/id/@extension");
                const authorID = oXMLModel.getProperty("/author/assignedAuthor/id/@extension");
                const organizationID = oXMLModel.getProperty("/custodian/assignedCustodian/representedCustodianOrganization/id/@extension");
                const patientEmail = oXMLModel.getProperty("/recordTarget/patientRole/telecom/@value");
                const practitionerEmail = oXMLModel.getProperty("/recordTarget/patientRole/providerOrganization/telecom/@value");
                const practitionerFullName = oOtherRequesterFieldsModel.getProperty("/practitionerFullName");
                const pharmacy = oOtherRequesterFieldsModel.getProperty("/pharmacy");
                const emailMessage = oXMLModel.getProperty("/component/structuredBody/component/section").toString();
                let medicationsList = [];

                const oTable = this.getView().byId("medicationTable");

                // Fields for creating a Medication
                for (let item of oTable.getItems()) {
                    const medicationName = item.getBindingContext("Medications").getProperty("name");
                    const medicationPZN = item.getBindingContext("Medications").getProperty("pzn");
                    const medicationEffectiveDate = item.getBindingContext("Medications").getProperty("effectiveDate");
                    const medicationDosage = item.getBindingContext("Medications").getProperty("dosage");
                    const medicationNote = item.getBindingContext("Medications").getProperty("note");

                    this.medication = new Medication({ name:medicationName,
                                                       pzn:medicationPZN,
                                                       effectiveDate:medicationEffectiveDate,
                                                       dosage:medicationDosage,
                                                       note:medicationNote });
                    medicationsList.push(this.medication);
                }

                this.p = new MedicationRequester({ firstName:firstName,
                                                   lastName:lastName,
                                                   birthDate:birthDate,
                                                   insuranceNumber:insuranceNumber,
                                                   authorID:authorID,
                                                   organizationID: organizationID,
                                                   patientEmail: patientEmail,
                                                   practitionerEmail: practitionerEmail,
                                                   practitionerFullName:practitionerFullName,
                                                   pharmacy:pharmacy,
                                                   medications: medicationsList,
                                                   emailMessage: emailMessage });

                this.getView().setModel(this.p.getModel(), "medicationRequester");
                const oMedicationRequesterData = this.getView().getModel("medicationRequester").getData();

                let xml = this.getMedicationPlanXML(oMedicationRequesterData);

                const dataMatrixCode = new DataMatrixCode();
                dataMatrixCode.setMsg(xml);
                const svg = dataMatrixCode.getSVGXml();

                const datamatrixForPractitioner = [];
                let oPromise = [];
                const svgToPngPromise = this._base64SvgToBase64Png(svg, datamatrixForPractitioner);
                oPromise.push(svgToPngPromise);

                // Send e-mail via backend
                const templateParams = {
                    contactName: oMedicationRequesterData.getFullName(),
                    contactEmail: oMedicationRequesterData.getPractitionerEmail(),
                    contactMessage: oMedicationRequesterData.getEmailMessage(),
                    attachment: attachmentList,
                    datamatrices: datamatrixForPractitioner
                };
                Promise.all(oPromise).then(function() {
                    fetch('https://mail-sender.med-united.health/sendEmail/earztbrief', {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(templateParams)
                    });
                });
            },

            getMedicationPlanXML: function (oMedicationRequester) {
                let sXML = "<MP v=\"025\" U=\"" + [...Array(32)].map(() => 'ABCDEF0123456789'.charAt(Math.floor(Math.random() * 16))).join('') + "\" l=\"de-DE\">\n";
                sXML += "  <P g=\"" + oMedicationRequester.getFirstName() + "\" f=\"" + oMedicationRequester.getLastName() + "\" b=\"" + (oMedicationRequester.getBirthDate() ? oMedicationRequester.getBirthDate().replaceAll("-", "") : "") + "\" />\n";
                sXML += "  <A n=\"" + oMedicationRequester.getPractitionerFullName() + "\" s=\"" + "\" z=\"" + "\" c=\"" + "\" p=\"" + "\" e=\"" + oMedicationRequester.getPractitionerEmail() + "\" t=\"" + new Date().toISOString().substring(0, 19) + "\" />\n";
                sXML += "  <S>\n";
                for (let oMedication of oMedicationRequester.getMedications()) {
                    try {
                        sXML += "    <M p=\"" + oMedication.getPZN() + "\" ";
                        if (oMedication.getDosage()) {
                            const aDosage = oMedication.getDosage().split(/-/);
                            const mDosage = {
                                0: "m",
                                1: "d",
                                2: "v",
                                3: "h"
                            };
                            for (let i = 0; i < aDosage.length; i++) {
                                sXML += mDosage[i] + "=\"" + aDosage[i] + "\" ";
                            }
                        }
                        const sNote = oMedication.getNote();
                        if (sNote) {
                            const m = sNote.match("Grund: (.*) Hinweis: (.*)");
                            if (m) {
                                sXML += "r=\"" + m.group(1) + "\" i=\"" + m.group(2) + "\" ";
                            } else {
                                sXML += "i=\"" + sNote + "\" ";
                            }
                        }
                        sXML += "/>\n";
                    } catch (e) {
                        console.error(e);
                    }
                }
                sXML += "   </S>\n";
                sXML += "</MP>";
                return sXML;
            },

            _base64SvgToBase64Png: function (svg, datamatrixForPractitioner) {
                return new Promise(resolve => {
                    this._svgToPng(svg, (imgData) => {
                        const pngImage = document.createElement('img');
                        pngImage.src = imgData;
                        const base64 = this._getBase64String(imgData);
                        resolve(datamatrixForPractitioner.push(base64));
                    })
                });
            },
            
            _svgToPng: function (svg, callback) {
                const url = this._getSvgUrl(svg);
                this._svgUrlToPng(url, (imgData) => {
                    callback(imgData);
                    URL.revokeObjectURL(url);
                });
            },

            _getSvgUrl: function (svg) {
                const blob = new Blob([svg], { type: 'image/svg+xml' })
                return URL.createObjectURL(blob);
            },

            _svgUrlToPng: function (svgUrl, callback) {
                const svgImage = document.createElement('img');
                document.body.appendChild(svgImage);
                const that = this;
                svgImage.onload = function () {
                    const canvas = document.createElement('canvas');
                    canvas.width = svgImage.clientWidth;
                    canvas.height = svgImage.clientHeight;
                    const canvasCtx = canvas.getContext('2d');
                    canvasCtx.drawImage(svgImage, 0, 0);
                    const imgData = canvas.toDataURL('image/png');
                    callback(imgData);
                    // that._downloadPNG(imgData);
                    document.body.removeChild(svgImage);
                };
                svgImage.src = svgUrl;
            },

            _downloadPNG: function (source) {
                const fileName = source.split('/').pop();
                const link = document.createElement("a");
                link.download = fileName;
                link.href = source;
                document.body.appendChild(link);
                link.click();
                link.remove();
            },

            _getBase64String: function (dataURL) {
                var idx = dataURL.indexOf('base64,') + 'base64,'.length;
                return dataURL.substring(idx);
            }
        });
    }
);