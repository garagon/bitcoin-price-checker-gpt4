const getPrice = () => {
    return fetch("https://api.coindesk.com/v1/bpi/currentprice/BTC.json")
      .then((response) => response.json())
      .then((data) => parseFloat(data.bpi.USD.rate.replace(/,/g, "")));
  };
  
  const getPriceHistory = () => {
    const to = Math.floor(Date.now() / 1000);
    const from = to - 86400; // 24 hours ago
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/market_chart/range?vs_currency=usd&from=${from}&to=${to}`;
  
    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        const history = data.prices.map((pricePoint) => {
          const time = new Date(pricePoint[0]).toLocaleTimeString();
          const price = pricePoint[1].toFixed(2);
          return { time, price };
        });
        return history;
      });
  };
  
  let previousPrice = null;
  let currentPrice = null;
  

  const updatePrice = async () => {
    previousPrice = currentPrice;
    currentPrice = await getPrice();
    if (currentPrice !== null) {
      if (previousPrice !== null) {
        chrome.action.setBadgeBackgroundColor({
          color: currentPrice > previousPrice ? "green" : "red",
        });
        chrome.action.setBadgeText({
          text: currentPrice.toFixed(2),
        });
  
        const color = currentPrice > previousPrice ? "green" : "red";
        const notificationOptions = {
          type: "basic",
          title: "Bitcoin Price Update",
          message: `Bitcoin price is now ${currentPrice.toFixed(
            2
          )} USD (${color.toUpperCase()})`,
          iconUrl: "icon128.png",
        };
  
        chrome.notifications.create("priceUpdate", notificationOptions);
        chrome.windows.create({
          url: "sound_popup.html",
          type: "popup",
          width: 1,
          height: 1,
          focused: false,
        });
      }
    }
  };
  
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getBitcoinPrice") {
      sendResponse({
        price: currentPrice.toFixed(2),
        color: currentPrice > previousPrice ? "green" : "red",
      });
    }
    if (request.action === "getBitcoinPriceHistory") {
      getPriceHistory().then((priceHistory) => {
        sendResponse({ priceHistory });
      });
      return true;
    }
  });
  
  chrome.alarms.create("updatePrice", { periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "updatePrice") {
      updatePrice();
    }
  });
  
  updatePrice();
  