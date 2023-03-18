chrome.runtime.sendMessage({ action: "getBitcoinPrice" }, (response) => {
    document.getElementById("price").textContent = response.price;
    document.getElementById("price").style.color = response.color;
  });
  
  chrome.runtime.sendMessage({ action: "getBitcoinPriceHistory" }, (response) => {
    const priceHistory = response.priceHistory;
    const labels = priceHistory.map((pricePoint) => pricePoint.time);
    const data = priceHistory.map((pricePoint) => pricePoint.price);
  
    const chartData = {
      labels: labels,
      datasets: [
        {
          label: "Bitcoin Price (USD)",
          data: data,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 2,
        },
      ],
    };
  
    const chartOptions = {
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: "Time",
          },
        },
        y: {
          display: true,
          title: {
            display: true,
            text: "Price (USD)",
          },
        },
      },
    };
  
    const ctx = document.getElementById("price-chart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: chartData,
      options: chartOptions,
    });
  });
  
  