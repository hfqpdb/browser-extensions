console.log('Starting background process.');
const priceCheck = (returnPort, payload) => {
    let xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            let data = JSON.parse(this.responseText);
            console.log('Sending coupon data ' + this.responseText + ' for ' + payload.item);
            returnPort.postMessage({
                action: 'couponData',
                data: data,
                item: payload.item
            });
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
        console.log('Message received:', message);
        if (message.action === 'priceCheck') {
            priceCheck(port, message.payload);

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
    callback({installed: true});
});

// Trigger update of the overlay on a change to the browser history.
chrome.webNavigation['onHistoryStateUpdated'].addListener(function (data) {
    if (typeof data) {
        Object.getOwnPropertyNames(ports).forEach((port) => {
            console.log('Sending port ' + port + ' updateContent message.');
            ports[port].postMessage({action: "updateContent"});
        });
    }
});