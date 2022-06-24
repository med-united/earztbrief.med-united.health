sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel"
], function(Object, JSONModel) {
    "use strict";
    
    return Object.extend("health.med-united.earztbrief.model.MedicationRequester", {
        constructor: function (data) {
            if (data) {
                this.firstName = data.firstName;
                this.lastName = data.lastName;
                this.birthDate = data.birthDate;
                this.insuranceNumber = data.insuranceNumber;
                this.authorID = data.authorID;
                this.organizationID = data.organizationID;
                this.patientEmail = data.patientEmail;
                this.practitionerEmail = data.practitionerEmail;
                this.practitionerFullName = data.practitionerFullName;
                this.pharmacy = data.pharmacy;
                this.medications = data.medications;
                this.emailMessage = data.emailMessage;
            }
            this.model = new JSONModel();
            this.model.setData(this);
        },
        getFirstName: function () {
            return this.firstName;
        },
        getLastName: function () {
            return this.lastName;
        },
        getFullName: function() {
            return this.firstName + ' ' + this.lastName;
        },
        getBirthDate: function () {
            return this.birthDate;
        },
        getInsuranceNumber: function () {
            return this.insuranceNumber;
        },
        getAuthorID: function () {
            return this.authorID;
        },
        getOrganizationID: function () {
            return this.organizationID;
        },
        getPatientEmail: function () {
            return this.patientEmail;
        },
        getPractitionerEmail: function () {
            return this.practitionerEmail;
        },
        getPractitionerFullName: function () {
            return this.practitionerFullName;
        },
        getPharmacy: function () {
            return this.pharmacy;
        },
        getMedications: function () {
            return this.medications;
        },
        getEmailMessage: function () {
            return this.emailMessage;
        },
        getModel:function(){
            return this.model;
        }
    });
});