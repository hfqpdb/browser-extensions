const isFunction = (name) => {
    return name && {}.toString.call(name) === '[object Function]';
};

const priceCheck = (callback, payload) => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            let data = JSON.parse(this.responseText);
            callback(data);
        }
    };
    xhr.open("GET", "https://www.hfqpdb.com/price_check/" + payload.item);
    xhr.send();
};

let ports = {};

// Accept connections from the content scripts.
chrome.runtime.onConnect.addListener((port) => {
    ports[port.name] = port;
    port.onMessage.addListener((message) => {
        let action = message.action;
        if (isFunction(action)) {
            action(port.postMessage, message.payload);

            return true;
        } else {
            port.postMessage({error: "Invalid action."});
        }
    });
    port.onDisconnect.addListener(() => {
        delete ports[this.name];
    });
});

// Accept messages from allowed sites to check for the extension.
chrome.runtime.onMessageExternal.addListener((message, sender, callback) => {
    let action = message.action;
    if (isFunction(action)) {
        action(callback, message.payload);

        return true;
    } else {
        callback({installed: true});
    }
});

// Trigger update of the overlay on a change to the browser history.
chrome.webNavigation['onHistoryStateUpdated'].addListener(function (data) {
    if (typeof data) {
        ports.forEach((port) => {
            port.postMessage({action: "updateContent"});
        });
    }
});