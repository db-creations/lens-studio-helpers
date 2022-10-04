//@input int numFramesAverage
//@input int perfWindowSize

var _currFrameStart = 0.0;
var _currFrameEnd = 0.0;

var _cpuDelta = 0.0;
var _gpuDelta = 0.0;
var _cpuDeltaAverage = 0.0;
var _gpuDeltaAverage = 0.0;
var _totalDeltaAverage = 0.0;

var _averageWindowCpu = new Array();
var _averageWindowGpu = new Array();
var _averageWindowTotal = new Array();

function registerStartFrame() {
    var currTime = (new Date).getTime();
    _gpuDelta = currTime - _currFrameEnd;
    _currFrameStart = currTime;

    addToAverageWindow(_gpuDelta, _averageWindowGpu);
    _gpuDeltaAverage = calcAverage(_averageWindowGpu);
}

function registerEndFrame() {
    _currFrameEnd = (new Date).getTime();
    _cpuDelta = _currFrameEnd - _currFrameStart;

    addToAverageWindow(_cpuDelta, _averageWindowCpu);
    _cpuDeltaAverage = calcAverage(_averageWindowCpu);

    addToAverageWindow(getDeltaTime() * 1000, _averageWindowTotal);
    _totalDeltaAverage = calcAverage(_averageWindowTotal);
}

function addToAverageWindow(value, window) {
    if (window.length == script.perfWindowSize) {
        window.splice(0, 1);
    }
    window.push(value);
}

function calcAverage(window) {
    var avg = 0.0;
    for (var i = (window.length - script.numFramesAverage); i < window.length; ++i) {
        avg += window[i];
    }
    avg /= script.numFramesAverage;
    return avg;
}

script.registerStartFrame = registerStartFrame;
script.registerEndFrame = registerEndFrame;

script.getCpuExecutionTime = function() {
    return _cpuDelta;
}

script.getGpuExecutionTime = function() {
    return _gpuDelta;
}

script.getAverageCpuExecutionTime = function() {
    return _cpuDeltaAverage;
}

script.getAverageGpuExecutionTime = function() {
    return _gpuDeltaAverage;
}

script.getAverageTotalExecutionTime = function() {
    return _totalDeltaAverage;
}

script.getCpuWindow = function() {
    return _averageWindowCpu;
}

script.getGpuWindow = function() {
    return _averageWindowGpu;
}

script.getTotalWindow = function() {
    return _averageWindowTotal;
}