requestIdleCallback polyfill
============================

An article about RIC https://developers.google.com/web/updates/2015/08/27/using-requestidlecallback?hl=en

Polyfill is build around the principe that janks are most harmful to UX when user is continously interacting with app. So we are basically preventing operation from being executed while user performing some actions on interface. Currently this implies scrolls, taps, clicks, mouse and touch movements. The condition is pretty simple - if there were no interactions for 100 msec there is a huge chance that we are in idle.

