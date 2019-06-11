const dataUrl = "https://poloniex.com/public?command=returnOrderBook&currencyPair=BTC_ETH&depth=50";

d3.json(dataUrl).then(data => {
  let cumVol = 0,
      askData = [],
      bidData = [];

  // Parse Ask Data
  for (let i = 0; i < data.asks.length; i++) {
    cumVol += data.asks[i][1];
    askData.push({
      value: Number(data.asks[i][0]),
      vol: data.asks[i][1],
      cVol: cumVol
    });
  }

  cumVol = 0;

  //Parse Bid Data
  for (let i = 0; i < data.bids.length; i++) {
    cumVol += data.bids[i][1];
    bidData.unshift({
      value: Number(data.bids[i][0]),
      vol: data.bids[i][1],
      cVol: cumVol
    });
  }

  //Set up canvas
  let width = document.getElementById('chart').clientWidth,
      height = document.getElementById('chart').clientHeight,
      maxWidth = 0.9 * width,
      minWidth = 0.1 * width,
      maxHeight = 0.9 * height,
      minHeight = 0.1 * height;

  //X Axis: Ranges from smallest bid value to largest ask value
  let valueScale = d3.scaleLinear()
    .domain([d3.min(bidData, d => d.value), d3.max(askData, d => d.value)])
    .range([minWidth, maxWidth]);

  let valueAxis = d3.axisBottom()
    .scale(valueScale);

  //Y Axis: Ranges from 0 to the largest cumulative volume
  let volumeScale = d3.scaleLinear()
    .domain([0, Math.max(d3.max(askData, d => d.cVol), d3.max(bidData, d => d.cVol))])
    .range([maxHeight, minHeight]);

  let volumeAxis = d3.axisLeft()
    .scale(volumeScale);

  let canvas = d3.select('.chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  //Draw chart for bid volume
  let bidPath = d3.path(),
      currX = minWidth,
      currY = maxHeight;

  bidPath.moveTo(currX, currY);

  for (let i = 0; i < bidData.length; i++) {
    currX = valueScale(bidData[i]['value']);
    bidPath.lineTo(currX, currY);
    currY = volumeScale(bidData[i]['cVol']);
    bidPath.lineTo(currX, currY);
    // console.log(volumeScale(askData[i]['cVol']));
    // console.log(`currY: ${currY}, currX: ${currX}`);
  }

  bidPath.lineTo(currX, maxHeight);

  //Draw chart for ask volume
  let askPath = d3.path();
  currX = valueScale(askData[0]['value']);
  currY = maxHeight;

  askPath.moveTo(currX, currY);

  for (let i = 0; i < askData.length; i++) {
    currY = volumeScale(askData[i]['cVol']);
    askPath.lineTo(currX, currY);
    currX = valueScale(askData[i]['value']);
    askPath.lineTo(currX, currY);
    console.log(`currY: ${currY}, currX: ${currX}`);
  }

  askPath.lineTo(currX, maxHeight);

  canvas.append('path')
    .attr('d', askPath)
    .attr('fill', 'green')
    .attr('stroke', 'green')
    .attr('stroke-width', 2);

  canvas.append('path')
    .attr('d', bidPath)
    .attr('fill', 'red')
    .attr('stroke', 'red')
    .attr('stroke-width', 2);

  //Axes and Labels
  canvas.append('g')
    .attr('transform', `translate(0, ${maxHeight})`)
    .call(valueAxis);

  canvas.append('g')
    .attr('transform', `translate(${width / 2}, ${maxHeight + 50})`)
    .append('text')
    .attr('text-anchor', 'middle')
    .text('Price (BTC/ETH)');

  canvas.append('g')
    .attr('transform', `translate(${minWidth}, 0)`)
    .call(volumeAxis);

  canvas.append('g')
    .attr('transform', `translate(${minWidth - 50}, ${height / 2})`)
    .append('text')
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(-90)')
    .text('Volume');

});

