sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel"
], function(Object, JSONModel) {
    "use strict";
    
    return Object.extend("medunited.earztbrief.model.Medication", {
        constructor: function(data) {
            if(data){
                this.name = data.name;
                this.pzn = data.pzn;
                this.effectiveDate = data.effectiveDate;
                this.dosage = data.dosage;
                this.note = data.note;
            }
            this.model = new JSONModel();
            this.model.setData(this);
        },
        getName: function () {
            return this.name;
        },
        getModel: function () {
            return this.model;
        },
        getPZN: function () {
            return this.pzn;
        },
        getEffectiveDate: function () {
            return this.effectiveDate;
        },
        getDosage: function () {
            return this.dosage;
        },
        getNote: function () {
            return this.note;
        }
    });
});