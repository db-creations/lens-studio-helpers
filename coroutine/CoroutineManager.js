var coroutineId = 0;

/**
 * Generic timer class
 */
var QuickTimer = (function() {
    /**
     * Generic timer class
     */
    function QuickTimer() {
        this.resetTime = 0;
    }

    /**
     * Resets the timer to given amount
     * @param {number} resetTime 
     */
    QuickTimer.prototype.reset = function(resetTime) {
        this.resetTime = resetTime;
    }

    /**
     * dT to reduce timer by
     * @param {number} dT 
     */
    QuickTimer.prototype.update = function(dT) {
        this.resetTime -= dT;
    }

    /**
     * Returns whether the timer is complete
     * @returns {boolean}
     */
    QuickTimer.prototype.isComplete = function() {
        return this.resetTime <= 0;
    }

    return QuickTimer;
}());

/**
 * Manager which handles coroutine execution
 */
var CoroutineManager = (function () {

    /**
     * Manager which handles coroutine execution
     */
    function CoroutineManager() {
        this.activeCoroutines = new Array();
    }

    /**
     * Adds a coroutine to be run by the manager
     * @param {Coroutine} coroutine 
     */
    CoroutineManager.prototype.runCoroutine = function(coroutine) {
        this.activeCoroutines.push(coroutine);
    }

    /**
     * Calling executes next sequence of coroutines
     * Recommended to call once a frame
     */
    CoroutineManager.prototype.update = function() {
        for (var i = this.activeCoroutines.length - 1; i >= 0; --i) {
            var coroutine = this.activeCoroutines[i];
            var action = coroutine.actions[coroutine.counter];
            var completed = this._callFunction(action.action, action.args);
            if (completed == undefined || completed) {
                ++coroutine.counter;
                if (coroutine.counter === coroutine.actions.length) {
                    if (coroutine.onComplete != null) {
                        coroutine.onComplete();
                    }

                    this.activeCoroutines.splice(i, 1);
                }
            }
        }
    }

    CoroutineManager.prototype._callFunction = function(action, args) {
        if (action == null) {
            global.logToScreen("no action: " + action)
        }
        return this._invokeFuncWithArgs(action, args);
    }

    CoroutineManager.prototype._invokeFuncWithArgs = function(func, args) {
        var argsLen = (args === null || args === undefined) ? 0 : args.length;
        switch (argsLen) {
            case 0: return func();
            case 1: return func(args[0]);
            case 2: return func(args[0], args[1]);
            case 3: return func(args[0], args[1], args[2]);
            case 4: return func(args[0], args[1], args[2], args[3]);
            case 5: return func(args[0], args[1], args[2], args[3], args[4]);
            default: return func(args);
        }
    }

    return CoroutineManager;
}());

/**
 * Constructs a coroutine to run in CoroutineManager
 * Each action is by default frame delayed
 */
var Coroutine = (function() {

    /**
     * Constructs a coroutine to run in CoroutineManager
     */
    function Coroutine() {
        this.actions = new Array();
        this.counter = 0;
        this.onComplete = null;
        this.coroutineId = ++coroutineId;
    }

    /**
     * Adding a void callback to be run in the coroutine
     * @param {function} action 
     */
    Coroutine.prototype.addAction = function(action) {
        this.actions.push({
            action: action,
            args: null
        });
    }

    /**
     * Adds a callback with arguments to be run in coroutine
     * If above 5 args, will send array
     * @param {function} action 
     * @param {array} args 
     */
    Coroutine.prototype.addActionArgs = function(action, args) {
        this.actions.push({
            action: action,
            args: args
        });
    }

    /**
     * Adds a one frame delay to coroutine sequence
     */
    Coroutine.prototype.addDelay = function() {
        this.actions.push({
            action: function(){},
            args: null
        });
    }

    /**
     * Runs until function returns true. Blocks successive in calls in sequence
     */
    Coroutine.prototype.runUntilTrue = function(func) {
        this.addActionArgs(this._runUntilTrue.bind(this), [func]);
    }

    /**
     * Runs until function returns false. Blocks successive in calls in sequence
     */
    Coroutine.prototype.runUntilFalse = function(func) {
        this.addActionArgs(this._runUntilFalse.bind(this), [func]);
    }

    Coroutine.prototype._runUntilTrue = function(func, addActionArgs, _runUntilTrue) {
        return func();
    }

    Coroutine.prototype._runUntilFalse = function(func, addActionArgs, _runUntilFalse) {
        return !func();
    }

    /**
     * Adds a delay to coroutine execution
     * @param {number} seconds 
     */
    Coroutine.prototype.waitForSeconds = function (seconds) {
        var timer = new QuickTimer();
        timer.reset(seconds);
        this.runUntilTrue(function() {
            timer.update(getDeltaTime());
            return timer.isComplete();
        });
    }

    /**
     * Callback for when coroutine sequence is complete
     * @param {function} action 
     */
    Coroutine.prototype.addOnCompleteCallback = function(action) {
        this.onComplete = action;
    }

    return Coroutine;
}());

module.exports.CoroutineManager = new CoroutineManager();
module.exports.Coroutine = Coroutine;
module.exports.QuickTimer = QuickTimer;