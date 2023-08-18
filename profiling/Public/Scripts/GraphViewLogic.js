//@input Component.ScriptComponent perfManager
//@input vec2 xDim
//@input vec2 yDim
//@input vec4 lineColor = {1, 1, 1, 1} {"widget":"color"}
//@input int graphType {"widget":"combobox", "values":[{"label":"CPU", "value":0}, {"label":"GPU", "value":1}, {"label":"Total", "value":2}]}
//@input Asset.ObjectPrefab linePrefab
//@input int numLines
//@input Asset.Material mat

script.createEvent("UpdateEvent").bind(update);

const width = 1.0 / script.numLines;
const mathUtils = global.MathUtils;
const mat = script.mat.clone();
var _lines = [];
mat.mainPass.baseColor = script.lineColor;

for (var i = 0; i < script.numLines; ++i) {
    var line = script.linePrefab.instantiate(script.getSceneObject());
    var image = line.getComponents("Component.Image");
    image[1].clearMaterials();
    image[1].addMaterial(mat);
    _lines.push(line.getComponent("Component.ScriptComponent"));
}
_lines[_lines.length - 1].pointA = vec2.zero();
_lines[_lines.length - 1].pointB = vec2.zero();
function update() {
    var window = getWindowFromType(script.graphType);
    var numUpdate = Math.min(window.length, _lines.length);
    var maxValue = getWindowMax(window);
    for (var i = 0; i < numUpdate - 1; ++i) {
        var line = _lines[i];
        var normalizedWindowVal = window[i] / maxValue;
        var nextWindowVal = window[i + 1] / maxValue;
        line.script.pointA.x = mathUtils.remap(i * width, 0, 1, script.xDim.x, script.xDim.y);
        line.script.pointB.x = mathUtils.remap((i + 1) * width, 0, 1, script.xDim.x, script.xDim.y);
        line.script.pointA.y = mathUtils.remap(normalizedWindowVal, 0, 1, script.yDim.x, script.yDim.y);
        line.script.pointB.y = mathUtils.remap(nextWindowVal, 0, 1, script.yDim.x, script.yDim.y);;
    }
}

function getWindowMax(window) {
    var maxVal = 0.0;
    for (var i = 0; i < window.length; ++i) {
        var val = window[i];
        if (val > maxVal) {
            maxVal = val;
        }
    }
    return maxVal;
}

function getWindowFromType(type) {
    switch (type) {
        case 0: return script.perfManager.getCpuWindow();
        case 1: return script.perfManager.getGpuWindow();
        case 2: return script.perfManager.getTotalWindow();
    }
}