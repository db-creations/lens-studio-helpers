//@input Component.ScriptComponent performanceManager

script.createEvent("LateUpdateEvent").bind(function(eventData){
    script.performanceManager.registerEndFrame();
});