/**
 * Created by Denis Radin aka PixelsCommander
 * http://pixelscommander.com
 *
 * Polyfill is build around the principe that janks are most harmful to UX when user is continously interacting with app.
 * So we are basically preventing operation from being executed while user interacts with interface.
 * Currently this implies scrolls, taps, clicks, mouse and touch movements.
 * The condition is pretty simple - if there were no interactions for 300 msec there is a huge chance that we are in idle.
 */

var applyPolyfill = function () {
    //By default we may assume that user stopped interaction if we are idle for 300 miliseconds
    var IDLE_ENOUGH_DELAY = 300;
    var timeout = null;
    var callbacks = [];
    var lastInteractionTime = Date.now();
    var deadline = {
        timeRemaining: IDLE_ENOUGH_DELAY
    };

    var isFree = function () {
        return timeout === null;
    }

    var onContinousInteraction = function (interactionName) {
        deadline.timeRemaining = 0;
        lastInteractionTime = Date.now();

        if (!timeout) {
            timeout = setTimeout(timeoutCompleted, IDLE_ENOUGH_DELAY);
        }
    }

    //Consider categorizing last interaction timestamp in order to add cancelling events like touchend, touchleave, touchcancel, mouseup, mouseout, mouseleave
    document.addEventListener('keydown', onContinousInteraction.bind(this, 'keydown'));
    document.addEventListener('mousedown', onContinousInteraction.bind(this, 'mousedown'));
    document.addEventListener('touchstart', onContinousInteraction.bind(this, 'touchstart'));
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
        var expectedEndTime = lastInteractionTime + IDLE_ENOUGH_DELAY;
        var delta = expectedEndTime - Date.now();

        if (delta > 0) {
            timeout = setTimeout(timeoutCompleted, delta);
        } else {
            onContinousInteractionEnd();
        }
    }

    var addCallback = function (callback, timeout) {
        callbacks.push({
            callback: callback,
            timeout: timeout !== undefined ? setTimeout(executeCallback.bind(this, {callback: callback}), timeout) : undefined
        });
    }

    var executeCallback = function (callbackObject) {
        var callbackIndex = callbacks.indexOf(callbackObject);

        if (callbackIndex !== -1) {
            callbacks.splice(callbacks.indexOf(callbackObject), 1);
        }

        callbackObject.callback(deadline);

        if (callbackObject.timeout) {
            clearTimeout(callbackObject.timeout);
            callbackObject.timeout = null;
        }
    }

    return function (callback, timeout) {
        if (isFree()) {
            executeCallback({
                callback: callback,
                timeout: timeout
            });
        } else {
            addCallback(callback, timeout);
        }
    };
};

window.requestIdleUICallback = applyPolyfill();
window.requestIdleCallback = window.requestIdleCallback || applyPolyfill();