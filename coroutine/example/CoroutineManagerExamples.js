const coroutines = require("./Scripts/CoroutineManager");

script.createEvent("UpdateEvent").bind(onUpdate);

runTest();
function runTest() {
    delayExec();
    callWithArgs();
    callWithSixArgs();
}

function delayExec() {
    var coroutine = new coroutines.Coroutine();
    coroutine.addAction(function() {
        print("here0");
    });
    coroutines.CoroutineManager.runCoroutine(coroutine);
}

function callWithArgs() {
    var coroutine = new coroutines.Coroutine();
    coroutine.addActionArgs(oneArgsCall, ["test"]);
    coroutines.CoroutineManager.runCoroutine(coroutine);
}

function callWithSixArgs() {
    var coroutine = new coroutines.Coroutine();
    coroutine.addActionArgs(oneArgsCall, [0,1,2,3,4,5]);
    coroutines.CoroutineManager.runCoroutine(coroutine);
}

function oneArgsCall(str) {
    print("called back with: " + str);
}

function sixArgsCall(args) {
    print("args: " + args);
}

function onUpdate() {
    coroutines.CoroutineManager.update();
}