//@input Component.ScriptComponent performanceManager

script.createEvent("UpdateEvent").bind(function(eventData){
    script.performanceManager.registerStartFrame();
});