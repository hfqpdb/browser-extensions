const findPrices = () => {
    let prices = document.body.querySelectorAll('.price-box');

    if (!prices.length) {
        prices = document.body.querySelectorAll("div[class^='price__info']");
    }

    return prices;
};

const updateContent = () => {
    findPrices().forEach((price) => {
        findCoupon(itemNumberFor(price), price, addCoupon);
    });
};

const itemNumberFor = (price) => {
    // TODO Try single item page
    // TODO Try wishlist items
    // TODO Try normal list items

    return item;
};

const findCoupon = (item, price, callback) => {
    port.sendMessage(
        {
            action: "priceCheck",
            payload: {
                item: item
            }
        },
        (response) => {
            // TODO If we received good data.
            callback(price, response);
        }
    );
};

const addCoupon = (price, data) => {
    // TODO Build the new element
    // TODO Insert the element into the DOM
};

// Make the connection to the extension listening in the background.
let port = chrome.runtime.connect({name: Math.random().toString(36).slice(-5)});
port.onMessage.addListener((message) => {
    if (message.action && {}.toString.call(message.action) === '[object Function]') {
        let name = message.action;
        name();
    }
});