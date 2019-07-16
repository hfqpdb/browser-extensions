console.log('Loaded hfqpdb extension.');
const findPrices = () => {
    let prices = document.body.querySelectorAll('.price-box');

    if (!prices.length) {
        prices = document.body.querySelectorAll("div[class^='price__info']");
    }

    if (!prices.length) {
        prices = document.body.querySelectorAll("p[class^='grid__price']");
    }

    if (!prices.length) {
        prices = document.body.querySelectorAll("div[class='cart_item_unit_price_dollars']");
    }

    console.log('Price search returned', prices);
    return prices;
};

let items = {};
const updateContent = () => {
    console.log('Scanning page content for items.');
    findPrices().forEach((price) => {
        let item = itemNumberFor(price);

        if (item) {
            items[item] = price;
            findCoupon(item);
        }
    });
};

const skuSearch = () => {
    console.log('Finding item number based on SKU.');
    let matches;
    matches = document.body.innerHTML.match(/"sku":"(\d+)"/) || [];

    return matches.length ? matches[1] : false;
};

const gridSearch = (price) => {
    console.log('Finding item number in grid element.', price);
    let itemNumber;
    let item = price.closest('[class^=grid__item]');
    let productLink = item ? item.querySelector("a[href*='product/view/id']") : false;

    if (productLink) {
        itemNumber = productLink.href
            .match(/product\/view\/id\/\d+\//)
            .pop()
            .match(/\d+/);
    } else if (item) {
        // Attempt to find this via the traditional link. Merchandising promotions use this format.
        itemNumber = item.querySelector('a[href$=html]')
            .href
            .match(/-\d+\.html/)
            .pop()
            .match(/\d+/);
    }

    return itemNumber || false;
};

const listSearch = (price) => {
    console.log('Checking for list price structure.', price);
    let item = price.closest('[id^=item_]') || false;

    if (item) {
        item = item.querySelector("a[href$='html']")
            .href
            .match(/-\d+\.html/)
            .pop()
            .match(/\d+/);
    }

    return item;
};

const cartSearch = (price) => {
    console.log('Checking for cart price structure.', price);
    let item = price.parentNode.parentNode.childNodes[3] || false;

    if (item) {
        item = item.querySelector("a[href$='html']")
            .href
            .match(/-\d+\.html/)
            .pop()
            .match(/\d+/);
    }

    return item;
};

const itemNumberFor = (price) => {
    return gridSearch(price) || skuSearch() || listSearch(price) || cartSearch(price);
};

const findCoupon = (item) => {
    console.log('Finding coupon for:', item);
    port.postMessage({
        action: "priceCheck",
        payload: {
            item: item
        }
    });
};

const addCoupon = (price, data) => {
    console.log('Adding coupon to item.');
    let itemCoupon = coupon.cloneNode(true);
    itemCoupon.href = data.url;
    itemCoupon.querySelector('.discount.text').innerText = "$" + data.bestPrice;

    price.appendChild(itemCoupon);
};

let coupon = document.createElement('a');
let couponImg = document.createElement('img');
let discountText = document.createElement('span');
couponImg.setAttribute('src', "https://www.hfqpdb.com/android-app/hfqpdb_logo.png");
couponImg.setAttribute('width', "30px");
couponImg.setAttribute(
    'style',
    "vertical-align: -8px;"
);
discountText.classList.add('discount', 'text');
coupon.appendChild(couponImg);
coupon.appendChild(discountText);
coupon.setAttribute('target', '_blank');
coupon.setAttribute(
    'style',
    "display: inline-block; border: 2px dashed #308104; color: #308104; padding: 0.5rem;"
);
coupon.title = 'Provided by hfqpdb.com';

// Make the connection to the extension listening in the background.
console.log('Starting connection to hfqpdb extension.');
let port = chrome.runtime.connect({name: Math.random().toString(36).slice(-5)});
port.onMessage.addListener((message) => {
    console.log('Message received:', message, message.action instanceof Function);
    if (message.action === 'updateContent') {
        updateContent();
    }

    if (message.action === 'couponData' && message.data.bestPrice && items[message.item]) {
        addCoupon(items[message.item], message.data);
    }

    if (message.data.error) {
        console.warn(message.data.error);
    }
});

// Perform initial page search.
updateContent();