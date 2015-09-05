/**
 * Created by Denis Radin aka PixelsCommander
 * http://pixelscommander.com
 *
 * Polyfill is build around the principe that janks are most harmful to UX when user is continously interacting with app.
 * So we are basically preventing operation from being executed while user interacts with interface.
 * Currently this implies scrolls, taps, clicks, mouse and touch movements.
 * The condition is pretty simple - if there were no interactions for 100 msec there is a huge chance that we are in idle.
 */

var applyPolyfill = function () {
    //By default we may assume that user stopped interaction if we are idle for 100 miliseconds
    var IDLE_ENOUGH_DELAY = 100;
    var timeout = null;
    var callbacks = [];
    var lastInteractionTime = Date.now();
    var deadline = {
        timeRemaining: 0
    };

    var isFree = function () {
        return timeout;
    }

    var onContinousInteraction = function (interactionName) {
        lastInteractionTime = Date.now();

        if (!timeout) {
            timeout = setTimeout(timeoutCompleted, IDLE_ENOUGH_DELAY);
        }
    }

    document.addEventListener('touchmove', onContinousInteraction.bind(this, 'touchmove'));
    document.addEventListener('mousemove', onContinousInteraction.bind(this, 'mousemove'));
    document.addEventListener('scroll', onContinousInteraction.bind(this, 'scroll'));

    var onContinousInteractionEnd = function (interactionName) {
        clearTimeout(timeout);
        timeout = null;

        for (var i = 0; i < callbacks.length; i++) {
            executeCallback(callbacks[i])
        }
    }

    var timeoutCompleted = function () {
        //console.log('Timeout completed' + Date.now());
        var expectedEndTime = lastInteractionTime + IDLE_ENOUGH_DELAY;
        var delta = expectedEndTime - Date.now();

        if (delta > 0) {
            timeout = setTimeout(timeoutCompleted, delta);
        } else {
            onContinousInteractionEnd();
        }
    }

    //TODO support timeout, save pairs timeout/callbacks and remove pairs
    var addCallback = function (callback, timeout) {
        callbacks.push({
            callback: callback,
            timeout: timeout !== undefined ? setTimeout(executeCallback.bind(this, callback), timeout) : undefined
        });
    }

    var executeCallback = function (callbackObject) {
        callbackObject.callback(deadline);
        clearTimeout(callbackObject.timeout);
        callbackObject.timeout = null;
        callbackObject
    }

    return function (callback, timeout) {
        if (isFree()) {
            executeCallback(callback);
        } else {
            addCallback(callback);
        }
    };
};

window.requestIdleCallback = window.requestIdleCallback || applyPolyfill();