({
	doInit : function(component, event, helper) {
		helper.loadCaseRecord( component, component.get("v.recordId") );
	},
    
    handleStartClick : function(component, event, helper){
        var parentObjId = component.get("v.recordId");
        helper.createRecord_StartTimeOnUI(component, parentObjId);
    },
    
    handleStopClick : function(component, event, helper){
        helper.updateRecord_StopTimeOnUI(component);
    }
})