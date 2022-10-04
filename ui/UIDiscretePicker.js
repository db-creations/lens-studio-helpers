// UIDiscretePicker.js
// Version: 0.1.2
// Event: Initialized Event
// Description: Choose one of n existing buttons by tapping or sliding
//
// ----- USAGE -----
// Attach this script to a Scene Object with a Screen Transform Component.
// Assign a Screen Image Object to the "Background Object" parameter.
// Assign a Screen Image Object that has to be dragged to the "Selection Object" Parameter.
// Create a needed amount of Scene Objects with a UIButton Script Component and make them children of Parent Scene Object 
//
// ----- LOCAL API USAGE -----
// Valid Event Types: "onEnableInteractable", "onDisableInteractable", "onSelectionChanged"
//
// Manually enable interactable
// script.enableInteractable()
//
// Manually disable interactable
// script.disableInteractable()
//
// Add callback function to event
// script.addCallback(eventType, callback)
//
// Remove callback function from event
// script.removeCallback(eventType, callback)
//
// True if interactable
// script.isInteractable()
//
// Enable touch events
// script.enableTouchEvents()
//
// Disable touch events
// script.disableTouchEvents()
//
// Get the index of current selected item
// script.getCurrentSelection()
//
// Set the index of current selected item
// script.setCurrentSelection()
//
// Get Button Count
// script.getCount()
//
// Get LayoutType 
// script.getGridColumn()
//
// Get Grid Column if the layout type is Grid
// script.getLayoutType()
// -----------------

//@input bool interactable = true

//@ui {"widget":"separator"}

//@input bool editProperties = false

//@ui {"widget":"group_start", "label":"Properties", "showIf":"editProperties"}
//@input int layout = 0 {"widget":"combobox", "values":[{"label":"Vertical", "value": 0}, {"label":"Horizontal", "value": 1},{"label":"Grid", "value": 2},{"label":"Circle", "value": 3},{"label":"Carousel", "value": 4}]}
//@input int gridCol = 2 {"showIf":"layout", "showIfValue":2}
//@input float gridPadding = 0 {"showIf":"layout", "showIfValue":2}
//@input float circlePadding = 0 {"showIf":"layout", "showIfValue":3}
//@input int initialSelection = 0 {"label":"Initial Selection"}
//@input bool useButtonWidgets
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editEventCallbacks = false
//@ui {"widget":"group_start", "label":"Event Callbacks", "showIf":"editEventCallbacks"}
//@input int callbackType = 0 {"widget":"combobox", "values":[{"label":"None", "value":0}, {"label":"Behavior Script", "value": 1}, {"label":"Behavior Custom Trigger", "value":2}, {"label":"Custom Function", "value":3}]}

//@input Component.ScriptComponent[] onSelectionChangedBehaviors {"label":"On Selection Changed", "showIf":"callbackType", "showIfValue":1}

//@input string[] onSelectionChangedGlobalBehaviors {"label":"On Selection Changed", "showIf":"callbackType", "showIfValue":2}

//@input Component.ScriptComponent customFunctionScript {"showIf":"callbackType", "showIfValue":3}
//@input string[] onSelectionChangedFunctionNames {"label":"On Value Changed", "showIf":"callbackType", "showIfValue":3}
//@ui {"widget":"group_end"}

//@ui {"widget":"separator"}
//@input bool editAdvancedOptions = false
//@ui {"widget":"group_start", "label":"Advanced Options", "showIf":"editAdvancedOptions"}
//@input bool printDebugStatements = false
//@input bool printWarningStatements = true
//@input bool shouldDisableTouchEvents = false
//@input bool editConnections = false
//@ui {"widget":"group_start", "label":"Connections", "showIf":"editConnections"}
//@input SceneObject backgroundObject
//@input SceneObject selectionObject

//@ui {"widget":"group_end"}
//@ui {"widget":"group_end"}

var callbackTracker = new global.CallbackTracker(script);

// Local API
script.enableInteractable = enableInteractable;
script.disableInteractable = disableInteractable;
script.isInteractable = isInteractable;
script.enableTouchEvents = enableTouchEvents;
script.disableTouchEvents = disableTouchEvents;
script.getCurrentSelection = getCurrentSelection;
script.setCurrentSelection = setCurrentSelection;
script.getCount = getCount;
script.getGridColumn = getGridColumn;
script.getLayoutType = getLayoutType;
script.initialized = false;
script.widgetType = global.WidgetTypes.UIDiscretePicker;
script.acceptChildWidget = acceptChildWidget;

script.addCallback = callbackTracker.addCallback.bind(callbackTracker);
script.removeCallback = callbackTracker.removeCallback.bind(callbackTracker);


// Touch Event callbacks
script.onTouchStart = onTouchStart;
script.onTouchEnd = onTouchEnd;
script.onTouchMove = onTouchMove;

script.allowTouchEvents = !script.shouldDisableTouchEvents;

script.setOwner = setOwner;
script.notifyOnInitialize = notifyOnInitialize;

script.claimTouchStart = claimTouchStart;
script.getMainRenderOrder = getMainRenderOrder;
// Is this widget interactable?
var interactable = script.interactable;

// Discrete Picker properties
var stepValueX;
var stepValueY;
var stepValueAngle;

var minEndpointX;
var maxEndpointX;
var minEndpointY;
var maxEndpointY;
var count;
var layoutType = script.layout;
var gridColumn = script.gridCol;
var gridRow;
var LayoutTypes = {
    "Vertical" : 0,
    "Horizontal" : 1,
    "Grid" : 2,
    "Circle" : 3,
    "Carousel" : 4,
};
var carouselMinDragDis = 0.1;

// Relevant Components
var thisScreenTransform = null;
var dragScreenTransform;
var backgroundScreenTransform = null;
var backgroundImage = null;
var buttonScripts = [];

// Discrete Picker properties

var cursorIsSlideable = false;
var currentSelection = -1;

var sceneObject = script.getSceneObject();
var refreshHelper = new global.RefreshHelper(initParams);

function refresh() {
    refreshHelper.requestRefresh();
}

refresh();

function claimTouchStart(touchPosition) {
    return (thisScreenTransform && thisScreenTransform.containsScreenPoint(touchPosition))
        ? global.TouchClaimTypes.Claim
        : global.TouchClaimTypes.Reject;
}

function getMainRenderOrder() {
    return backgroundImage ? backgroundImage.getRenderOrder() : null;
}

function acceptChildWidget(widget) {
    var api = widget;
    if (acceptButtonWidget(widget)) {
        return true;
    } else if (!widget.ownerScript && api.widgetType >= 0) {
        global.politeCall(widget, "setOwner", [script]);
        refresh();
        return true;
    }
    return false;
}

function notifyOnInitialize(callback) {
    callback(script);
}

// Initialize all parameters
function initParams() {
    if (script.initialized) {
        return;
    }
    if (!initDiscretePicker() ||
        !initBackground() ||
        !initDragObject() ||
        !initLayout() ||
        !initButtons() ||
        !setInitialSelection() ||
        !initInteractable()
    ) {

        return;
    }

    global.answerPoliteCalls(script, "notifyOnInitialize");
    checkOwner();

    script.initialized = true;

}

function seekOwner() {
    global.findScriptUpwards(sceneObject, "acceptChildWidget", function(scr) {
        return scr.acceptChildWidget(script);
    });
}

function setOwner(ownerScript) {
    script.ownerScript = ownerScript;
    refresh();
}

function checkOwner() {
    if (!script.ownerScript) {
        seekOwner();
    }
    return !!script.ownerScript;
}

// Initialize Color Picker parameters
function initDiscretePicker() {
    thisScreenTransform = sceneObject.getComponent("Component.ScreenTransform");
    if (!thisScreenTransform) {
        printWarning("please assign a Screen Transform component to this Scene Object!");
        return false;
    }

    return true;
}

// Initialize Background parameters
function initBackground() {
    if (!script.backgroundObject) {
        printWarning("no Reference to Background Scene Object! Attempting to search children...");
        script.backgroundObject = global.getChildByName(sceneObject, "Background");
        if (!script.backgroundObject) {
            printWarning("the Background Scene Object has not been assigned! Please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
            return false;
        }
    }

    // Obtain Screen Transform Component from the background
    backgroundScreenTransform = script.backgroundObject.getComponent("Component.ScreenTransform");
    if (!backgroundScreenTransform) {
        printWarning("missing a Screen Transform Component!");
        return false;
    }

    // Obtain Image Component from the background
    backgroundImage = script.backgroundObject.getComponent("Component.Image");
    if (!backgroundImage) {
        printWarning("missing an Image Component!");
        return false;
    }
    return true;
}

function acceptButtonWidget(widget) {
    var api = widget;
    if (!api.ownerScript && api.widgetType == global.WidgetTypes.UIButton) {

        global.politeCall(widget, "setOwner", [script]);
        var buttonScript = widget;
        buttonScripts.push(buttonScript);
        updateWidgetInteractable(buttonScript);
        refresh();
        return true;
    }
    return false;
}

function initDragObject() {
    if (layoutType !==LayoutTypes.Carousel) {
        //selection button 
        if (!script.selectionObject) {
            printWarning("no Reference to Selection Scene Object! Attempting to search children...");
            script.selectionObject = global.getChildByName(sceneObject, "Selection");
            if (!script.selectionObject) {
                printWarning("the Selection Scene Object has not been assigned! Please go to \"Advanced Options\" and reassign it under \"Edit Connections\"!");
                return false;
            }
        }
        dragScreenTransform = script.selectionObject.getComponent("Component.ScreenTransform");
        if (!dragScreenTransform) {
            printWarning("missing a Screen Transform Component!");
            return false;
        }
        return true;
    } else {
        dragScreenTransform = backgroundScreenTransform;
        if (!dragScreenTransform) {
            printWarning("missing a Screen Transform Component!");
            return false;
        }
        return true;
    }
}

function getBtnSize() {
    var btnSize = vec2.zero();
    
    switch (layoutType) {
        case 0:
            btnSize = new vec2(2.0, 2.0 / count);
            break;
        case 1:
            btnSize = new vec2(2.0 / count, 2.0); 
            break;
        case 2:
            btnSize = new vec2((2.0-script.gridPadding) / gridColumn, (2.0-script.gridPadding) / gridRow);
            break;
        case 3:
            var angle = 360/count;
            var r = Math.tan(angle/2)/(1-Math.tan(angle/2))+script.circlePadding/2;
            btnSize = new vec2(r, r);
            break;
        case 4:
            btnSize = new vec2(2.0 / count, 2.0); 
            break;
        default:
            printWarning("can't find layout");
    }
    
    return btnSize;
}

function getBtnLocalPos(index) {
    var btnLocalPos = vec2.zero();
    var x;
    var y;
    var angle;
    switch (layoutType) {
        case 0:
            btnLocalPos = new vec2(0, 2.0 * ((count -1 - index) + 0.5) / count - 1.0);
            break;
        case 1:
            btnLocalPos = new vec2(2.0 * (index + 0.5) / count - 1.0, 0); 
            break;
        case 2:
            x = index % gridColumn * 2.0/ gridColumn ;
            y = (gridRow - Math.floor(index / gridColumn)-1) * 2.0/ gridRow ;

            btnLocalPos.x = x - 1 + 1 / gridColumn ;           
            btnLocalPos.y = y - 1 + 1 / gridRow;
            break;
        case 3:
            angle = index / count * Math.PI * 2;
            btnLocalPos.x = Math.sin(angle) * (1-1.0 / count);
            btnLocalPos.y = Math.cos(angle) * (1-1.0 / count); 

            break;
        case 4:
            btnLocalPos = new vec2(2.0 * (index + 0.5) / count - 1.0, 0); 
            break;
        default:
            printWarning("can't set btn Local Position");
    }
    
    return btnLocalPos;
}


function setEndPointLayout() {
    var halfSize = 1.0 / count;
    
    switch (layoutType) {
        case 0:
            minEndpointX = 0.5;
            maxEndpointX = 0.5;
            minEndpointY = halfSize / 2.0;
            maxEndpointY = 1.0 - halfSize / 2.0;
            stepValueX = (maxEndpointX - minEndpointX) / (count - 1.0);
            stepValueY = (maxEndpointY - minEndpointY) / (count - 1.0);
            break;
        case 1:
            minEndpointX = halfSize / 2.0;
            maxEndpointX = 1.0 - halfSize / 2.0;
            minEndpointY = 0.5;
            maxEndpointY = 0.5;
            stepValueX = (maxEndpointX - minEndpointX) / (count - 1.0);
            stepValueY = (maxEndpointY - minEndpointY) / (count - 1.0); 
            break;
        case 2:
            minEndpointX = 0;
            maxEndpointX = 1;
            minEndpointY = 0;
            maxEndpointY = 1;
            stepValueX = (maxEndpointX - minEndpointX) / gridColumn;
            stepValueY = (maxEndpointY - minEndpointY) / (Math.ceil(count/gridColumn)); 
            break;
        case 3:
            minEndpointX = 0;
            maxEndpointX = 1;
            minEndpointY = 0;
            maxEndpointY = 1;
            stepValueAngle = Math.PI * 2 / count;
            break;
        case 4:
            minEndpointX = halfSize / 2.0;
            maxEndpointX = 1.0 - halfSize / 2.0;
            minEndpointY = 0.5;
            maxEndpointY = 0.5;
            stepValueX = (maxEndpointX - minEndpointX) / (count - 1.0);
            stepValueY = (maxEndpointY - minEndpointY) / (count - 1.0); 
            break;
        default:
            
            printWarning("can't set Endpoint Layout");
    }

}


function initLayout() {
    count = script.backgroundObject.getChildrenCount();
    
    if (layoutType == LayoutTypes.Grid) {
        gridRow = Math.ceil(count/gridColumn);
    }

    var btnSize = getBtnSize();

    for (var i = 0; i < count; i++) {
        var so = script.backgroundObject.getChild(i);

        var anchors = so.getComponent("Component.ScreenTransform").anchors;

        anchors.setSize(btnSize);

        var btnLocalPos = getBtnLocalPos(i);

        anchors.setCenter(btnLocalPos);
    }
    
    setEndPointLayout();

    return true;
}

function initButtons() {
    if (!script.useButtonWidgets) {
        return true;
    }
    for (var i = 0; i < count; i++) {
        var so = script.backgroundObject.getChild(i);
        initButton(so);
    }
    if (buttonScripts.length == count) {
        return true;
    }
    return false;
}

// Initialize Button parameters
function initButton(buttonObject) {
    global.findScript(buttonObject, null, function(scr) {
        global.politeCall(scr, "notifyOnInitialize", [acceptButtonWidget]);
    });
}

// Initialize this interactable
function initInteractable() {
    updateValue(currentSelection);
    return true;
}

// Initialize Color Picker's initial location
function setInitialSelection() {
    updateValue(Math.min(Math.max(0, script.initialSelection), count - 1));
    return true;
}

// Disable touch event
function disableTouchEvents() {
    script.allowTouchEvents = false;
    script.shouldDisableTouchEvents = true;
}

// Enable touch event
function enableTouchEvents() {
    script.allowTouchEvents = true;
    script.shouldDisableTouchEvents = false;
}
// Event callbacks

// Called On Touch Start
function onTouchStart(eventData) {
    if (!interactable) {
        return;
    }
    touchStartPicker(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchStart", eventData);
}

// Called On Touch End
function onTouchEnd(eventData) {
    if (!interactable) {
        return;
    }
    touchEndPicker(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchEnd", eventData);
}

// Called On Touch Move
function onTouchMove(eventData) {
    if (!interactable) {
        return;
    }
    touchMovePicker(eventData);
    callbackTracker.invokeScriptedCallbacks("onTouchMove", eventData);
}

// Apply appropriate action based on whatever was touched on the Color Picker
var touchPos = vec2.zero();
var rootPos = vec2.zero();
var delta = vec2.zero();

function touchStartPicker(eventData) {
    touchPos = eventData.getTouchPosition();
    if (layoutType !== LayoutTypes.Carousel) {
        if (thisScreenTransform.containsScreenPoint(touchPos)) {
            updateSelectionFromTouch(touchPos, true);   
            cursorIsSlideable = true;
        }

    } else {

        if (dragScreenTransform.containsScreenPoint(touchPos)) {
            rootPos = dragScreenTransform.anchors.getCenter();
            cursorIsSlideable = true;
        }
    }

}

function touchEndPicker(eventData) {

    updateSelectionFromTouch(eventData.getTouchPosition(), true);
    cursorIsSlideable = false;

}

// Apply appropriate action based on whatever was touched on the Color Picker
function touchMovePicker(eventData) {
    if (!cursorIsSlideable) {
        return;
    }
    
    if (layoutType !== LayoutTypes.Carousel) {
        updateSelectionFromTouch(eventData.getTouchPosition(), false);
   
    } else {

        var movePos = eventData.getTouchPosition();
        delta = movePos.sub(touchPos);
        updatePositionFromTouch(delta);

    }
    
}

function getNormPos(pos) {
    var normPos = pos.add(vec2.one()).uniformScale(0.5);
    normPos.x = clamp(normPos.x, minEndpointX, maxEndpointX);
    normPos.y = clamp(normPos.y, minEndpointY, maxEndpointY);
    return normPos;

}

function updatePositionFromTouch(touchDelta) {

    var targetPos = rootPos.add(touchDelta);
    var targetNormPos = getNormPos(targetPos);
    setLocationFromNormalizedPoint(targetNormPos);
}

function getNormPosThisScreenTrans(touchData) {
    var targetPos = thisScreenTransform.screenPointToLocalPoint(touchData);
    var targetNormPos = getNormPos(targetPos);
    return targetNormPos;
}

function getNormPosBackgroundScreenTransFromTouch(touchData) {
    var targetPos = dragScreenTransform.screenPointToLocalPoint(touchData);
    var targetNormPos = getNormPos(targetPos);
    return targetNormPos;
}

function getNormPosBackgroundScreenTrans() {
    var targetPos = dragScreenTransform.anchors.getCenter();
    var targetNormPos = getNormPos(targetPos);
    return targetNormPos;
}

function updateSelectionFromTouch(touchData) {

    var index = 0;
    var targetNormPos;
    var x;
    var y;
    var angle;
    switch (layoutType) {
        case 0:
            targetNormPos = getNormPosThisScreenTrans(touchData);
            index = count - 1 - Math.floor(targetNormPos.y / stepValueY);   
            break;
        case 1:
            targetNormPos = getNormPosThisScreenTrans(touchData);
            index = Math.floor(targetNormPos.x / stepValueX);
            break;
        case 2:
            targetNormPos = getNormPosThisScreenTrans(touchData);
            x = Math.floor(targetNormPos.x / stepValueX);
            y = gridRow-1-Math.floor(targetNormPos.y / stepValueY);
            x = clamp(x, 0, gridColumn-1);
            y = clamp(y, 0, gridRow);
            index = clamp(x + y * gridColumn, 0, count-1);
            break;
        case 3:
            targetNormPos = getNormPosThisScreenTrans(touchData);
            angle = Math.atan2((targetNormPos.x-0.5),(targetNormPos.y-0.5));
            if (angle < 0) {
                angle = angle + 2 * Math.PI;
            }
            index = Math.round(angle/stepValueAngle);
            if (index>=count) {
                index = 0;
            }          
            break;
        case 4:
      
        
            if (delta.length <carouselMinDragDis) {
                targetNormPos = getNormPosBackgroundScreenTransFromTouch(touchData);
                index = Math.floor(targetNormPos.x / stepValueX);

            } else {
        
                targetNormPos = getNormPosBackgroundScreenTrans();
                index = count - Math.floor(targetNormPos.x / stepValueX)-1;  

            }

  
            break;
        default:          
            printWarning("can't update Selection From Touch");
    }
    updateValue(index);
    
}

function setLocalPointFromIndex(index) {
    var localScreenPos = vec2.zero();
    var angle; 
    var x;
    var y;   
    switch (layoutType) {
        case 0:
            localScreenPos.x = minEndpointX;
            localScreenPos.y = maxEndpointY - stepValueY * index;
            break;
        case 1:
            localScreenPos.x = minEndpointX + stepValueX * index;
            localScreenPos.y = minEndpointY;
            break;
        case 2:
            x = index % gridColumn * 2.0 / gridColumn ;
            y = (gridRow - Math.floor(index / gridColumn)-1) * 2.0/ gridRow;
            localScreenPos.x = (x +1 / gridColumn)/2;               
            localScreenPos.y = (y +1 / gridRow)/2;
        
            break;         
        case 3:
            angle = index / count * Math.PI * 2;
            x = (Math.sin(angle) * (1-1.0 / count)+1)/2;
            y = (Math.cos(angle) * (1-1.0 / count)+1)/2; 
            localScreenPos = new vec2(x, y);
            break;
        case 4:
            localScreenPos.x = maxEndpointX - stepValueX * index;
            localScreenPos.y = minEndpointY + stepValueY * index;
            break;
        default:
            printWarning("can't set Local Point From Index");
    }
    setLocationFromNormalizedPoint(localScreenPos);
}

function setLocationFromNormalizedPoint(localScreenPos) {
    
    var localPosX = localScreenPos.x * 2.0 - 1;
    var localPosY = localScreenPos.y * 2.0 - 1;
    dragScreenTransform.anchors.setCenter(new vec2(localPosX, localPosY));
    
}


function clamp(v, minV, maxV) {
    return Math.min(Math.max(v, minV), maxV);
}

// Update the color based on where the button is on the texture, and invoke callbacks
function updateValue(newSelection) {
    
    //update button effects if we use Button widgets
    if (currentSelection!==newSelection) {   
        if (script.useButtonWidgets) {
            updateButtonWidget(currentSelection, false);
            updateButtonWidget(newSelection, true);
        }
        currentSelection = newSelection;
        callbackTracker.invokeAllCallbacks("onSelectionChanged", currentSelection);
    }
    setLocalPointFromIndex(currentSelection);
}

function updateButtonWidget(idx, isEnabled) {
    if (idx > -1 && buttonScripts[idx]) {
        if (isEnabled) {
            buttonScripts[idx].pressDown();
        } else {
            buttonScripts[idx].pressUp();
        }
    }
}

// Return grid column
function getGridColumn() {
    if (layoutType==LayoutTypes.Grid) {
        return gridColumn;  
    }

    return null;
    
}

// Return layout type
function getLayoutType() {

    return layoutType;
}

// Return button count
function getCount() {
    return count;
}

// Return currently picked location local to Palette
function getCurrentSelection() {
    return currentSelection;
}

function setCurrentSelection(newSelection) {
    updateValue(newSelection);

}

// Return true if Color Picker is currently interactable, false otherwise
function isInteractable() {
    return interactable;
}

function updateWidgetInteractable(widget) {
    if (widget) {
        if (interactable) {
            widget.enableInteractable();
        } else {
            widget.disableInteractable();
        }
    }
}

// Disable this Picker
function disableInteractable() {
    if (!interactable) {
        return;
    }
    interactable = false;

    callbackTracker.invokeAllCallbacks("onDisableInteractable");

    printDebug("Disabled!");
}

// Enable this  Picker
function enableInteractable() {

    if (interactable) {
        return;
    }
    interactable = true;

    for (var b in buttonScripts) {
        updateWidgetInteractable(b);
    }
    updateValue(currentSelection);
    callbackTracker.invokeAllCallbacks("onEnableInteractable");

    printDebug("Enabled!");
}

// Print debug messages
function printDebug(message) {
    if (script.printDebugStatements) {
        print("UIDiscretePicker " + sceneObject.name + " - " + message);
    }
}

// Print warning message
function printWarning(message) {
    if (script.printWarningStatements) {
        print("UIDiscretePicker " + sceneObject.name + " - WARNING, " + message);
    }
}
