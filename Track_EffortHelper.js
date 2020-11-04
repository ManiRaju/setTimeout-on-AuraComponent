({
	loadCaseRecord : function(component, caseID) {

	},
    
    createRecord_StartTimeOnUI : function(component, parentObjId) {
        var action = component.get("c.createEffortRecord");
        action.setParams({
            "ParentRecordID": parentObjId
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === "SUCCESS") {
                component.set("v.effortRecord", response.getReturnValue());
                var resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": "New Effort Record Created",
                    "message": "The new effort was created with Start DateTime.",
                    "type": "success"
                });

                $A.get("e.force:closeQuickAction").fire();
                resultsToast.fire();
                $A.get("e.force:refreshView").fire();
                
                this.setStartTimeOnUI(component);

            } else if (state === "ERROR") {
                console.log('Problem inserting effort record, response state: ' + state);
            } else {
				console.log('Unknown problem, response state: ' + state);
			}
        });
        $A.enqueueAction(action);
    },
    
    updateRecord_StopTimeOnUI : function(component) {
        var action = component.get("c.updateEffortRecord");
        action.setParams({
            "effort": component.get("v.effortRecord"),
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(component.isValid() && state === "SUCCESS") {
                var resultsToast = $A.get("e.force:showToast");
                resultsToast.setParams({
                    "title": "Effort Record Updated",
                    "message": "Effort has been updated with End DateTime.",
                    "type": "success"
                });

                $A.get("e.force:closeQuickAction").fire();
                resultsToast.fire();
                $A.get("e.force:refreshView").fire();
                
                this.setStopTimeOnUI(component);

            } else if (state === "ERROR") {
                console.log('Problem updating effort record, response state: ' + state);
            } else {
				console.log('Unknown problem, response state: ' + state);
			}
        });
        $A.enqueueAction(action);
    },
    
    setStartTimeOnUI : function(component) {
        component.set("v.ltngIsDisplayed",true);
        var currTime = component.get("v.ltngCurrTime");
        if(typeof currTime != 'undefined' && currTime != null){
            var ss = currTime.split(":");
            var dt = new Date();
            dt.setHours(ss[0]);
            dt.setMinutes(ss[1]);
            dt.setSeconds(ss[2]);
            var dt2 = new Date(dt.valueOf() + 500);
            var temp = dt2.toTimeString().split(" ");
            var ts = temp[0].split(":");
            
            if( ts[2] == 30 ){
                this.showNotification(component, "Timer is In-Progress");
            }
            
            component.set("v.ltngCurrTime",ts[0] + ":" + ts[1] + ":" + ts[2]);
            this.waitingTimeId = setTimeout($A.getCallback(() => this.setStartTimeOnUI(component)), 1000);
            localStorage.setItem(component.get("v.recordId"), this.waitingTimeId);
        }
    },
    
    setStopTimeOnUI : function(component) 
    {
        component.set("v.ltngIsDisplayed",false);
        component.set("v.ltngCurrTime","00:00:00");
        //window.clearTimeout(this.waitingTimeId);
        window.clearTimeout(localStorage.getItem(component.get("v.recordId")));
    },
    
    showNotification : function(component, notificationTitle){
        var title = notificationTitle;
        var body = "Timer is in progress";
        if (Notification.permission === "granted") {
            	var notification = new Notification(title, { body });
				notification.onclick = () => { 
					notification.close();
					window.parent.focus();
				}
		}
    },
                                                            
	addListeners: function (component){
        let self = this;
        document.addEventListener('visibilitychange', function() {
            if(document.hidden) {
                console.log('Window Hidden at '+new Date());
            } else {
                console.log('Window active '+new Date());
                if( typeof component.get("v.recordId") != 'undefined' ){
                    console.log('Retrieveing data '+new Date());
                    self.retrieveOpenEffRecord(component);
                }
            }
        });
    },
                                                            
	retrieveOpenEffRecord : function(component){
		var action = component.get("c.retrieveEffortRecord");
        action.setParams({
            "ParentRecordID": component.get("v.recordId")
        });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state === "SUCCESS") {
                if(response.getReturnValue().length  > 0){
                    console.log('I have open effort Record');
                    component.set( "v.ltngCurrTime", this.formulateHHMMSS(response.getReturnValue()[0].Start_DateTime__c) );
                }else if(response.getReturnValue().length  === 0){
                    console.log('I do not have open effort Record');
                    this.setStopTimeOnUI(component);
                }
            } else if (state === "ERROR") {
                console.log('Problem in retrieveing effort record, response state: ' + state);
            } else {
				console.log('Unknown problem, response state: ' + state);
			}
        });
        
        $A.enqueueAction(action);
	},
                                                            
	formulateHHMMSS : function(hStartDateTime){
        var dateNow = new Date();
        let miliseconds = Math.abs(new Date(hStartDateTime) - new Date(dateNow)) / 1000;
        var hours = Math.floor(miliseconds / 3600);
        miliseconds -= hours * 3600;
        var minutes = Math.floor(miliseconds / 60) % 60;
        miliseconds -= minutes * 60;
        var seconds = Math.floor(miliseconds);
        return this.addZero(hours) + ":" + this.addZero(minutes) + ":" + this.addZero(seconds);
    },
                                                            
	addZero : function(i) {
    	if (i < 10) {
        	i = "0" + i;
        }
        return i;
    },
})