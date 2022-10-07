const CM = require("CoroutineManager");

const initialCooldownTime = 1;
const fallOffMultiplier = 2;
const totalRetries = 10;

var Retry = (function() {
    function Retry(callbackFunc, args) {
        this.retryCounter = 0;
        this.cooldownTime = 0;
        this.callbackFunc = callbackFunc;
        this.args = args;
    }

    Retry.prototype.fire = function() {
        if (this.retryCounter <= totalRetries) {
            var coroutine = new CM.Coroutine();
            coroutine.waitForSeconds(this.cooldownTime)
            coroutine.addActionArgs(this.callbackFunc, this.args);
            CM.CoroutineManager.runCoroutine(coroutine);

            if (this.retryCounter == 0) {
                this.cooldownTime = initialCooldownTime
            } else {
                print("cooldown: " + this.cooldownTime);
                this.cooldownTime *= fallOffMultiplier;
            }
            ++this.retryCounter;
        } else {
            print("Error: retry timed out");
        }
    }

    Retry.prototype.reset = function() {
        this.retryCounter = 0;
    }

    return Retry;
}());

module.exports = Retry;