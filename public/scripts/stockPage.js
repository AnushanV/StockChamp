//referenced https://www.d3-graph-gallery.com/graph/line_cursor.html

window.onload = function(){
   
    //get values needed for api link
    var apiSymbol = "TD";    
    var apiInterval = "1min";
    var apiOutputSize = "compact";
    var apiKey = "KA26ULAWH85VJQEN";

    //build daily interval graph by default
    var apiLink = getApiLink(apiSymbol, apiInterval, apiOutputSize, apiKey);
    this.buildGraphColumn(apiLink, apiInterval, apiSymbol);

    //build news column
    this.buildNewsColumn(apiSymbol);

    //buttons to change graph
    var minButton = document.getElementById('minButton');
    var hourButton = document.getElementById('hourButton');
    var dayButton = document.getElementById('dayButton');
    var weekButton = document.getElementById('weekButton');
    var monthButton = document.getElementById('monthButton');

    //change graph based on interval pressed
    $(minButton).click(function() {
        apiInterval = '1min';
        apiLink = getApiLink(apiSymbol, apiInterval, apiOutputSize, apiKey);
        buildGraphColumn(apiLink, apiInterval, apiSymbol);
    });
    $(hourButton).click(function() {
        apiInterval = '60min';
        apiLink = getApiLink(apiSymbol, apiInterval, apiOutputSize, apiKey);
        buildGraphColumn(apiLink, apiInterval, apiSymbol);
        console.log(apiLink);
    });
    $(dayButton).click(function() {
        apiInterval = 'Daily';
        apiLink = getApiLink(apiSymbol, apiInterval, apiOutputSize, apiKey);
        buildGraphColumn(apiLink, apiInterval, apiSymbol);
    });
    $(weekButton).click(function() {
        apiInterval = 'Weekly';
        apiLink = getApiLink(apiSymbol, apiInterval, apiOutputSize, apiKey);
        buildGraphColumn(apiLink, apiInterval, apiSymbol);
    });
    $(monthButton).click(function() {
        apiInterval = 'Monthly';
        apiLink = getApiLink(apiSymbol, apiInterval, apiOutputSize, apiKey);
        buildGraphColumn(apiLink, apiInterval, apiSymbol);
    });

};


/**
 * Returns the Alphavantage api link when given parameters
 * @param {*} apiSymbol - symbol for the stock
 * @param {*} apiInterval - time between prices
 * @param {*} apiOutputSize - determines compact or full output
 * @param {*} apiKey - the api key
 */
var getApiLink = function(apiSymbol, apiInterval, apiOutputSize, apiKey){
    
    //determine which api function to use
    var apiFunction;
    if (apiInterval == "Daily"){
        apiFunction = "TIME_SERIES_DAILY";
    }
    else if(apiInterval == "1min" || apiInterval == "60min"){
        apiFunction = "TIME_SERIES_INTRADAY";
    }
    else if(apiInterval == "Weekly"){
        apiFunction = "TIME_SERIES_WEEKLY";
    }
    else if(apiInterval == "Monthly"){
        apiFunction = "TIME_SERIES_MONTHLY";
    }

    //determine link based on function
    if (apiFunction == "TIME_SERIES_DAILY"){
        return `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${apiSymbol}&outputsize=${apiOutputSize}&apikey=${apiKey}`;
    }
    else if (apiFunction == "TIME_SERIES_INTRADAY"){
        return `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${apiSymbol}&interval=${apiInterval}&outputsize=${apiOutputSize}&apikey=${apiKey}`;
    }
    else if(apiFunction == "TIME_SERIES_WEEKLY"){
        return `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${apiSymbol}&apikey=${apiKey}`;
    }
    else if(apiFunction == "TIME_SERIES_MONTHLY"){
        return `https://www.alphavantage.co/query?function=${apiFunction}&symbol=${apiSymbol}&apikey=${apiKey}`;
    }

}

/**
 * Builds the stock graph and the info table
 * @param {*} apiLink - link to the api
 * @param {*} apiInterval - time between prices
 */
var buildGraphColumn = function(apiLink, apiInterval, apiSymbol){
    
    //remove stock chart
    stockChart.innerHTML = "";

    var chartColumn = document.getElementById("chartColumn");
    var stockInfo = document.getElementById("stockInfo");

    //store stock info
    var stockData = [];
    var stockInfo = [];

    //get table cells
    var selectedDate = document.getElementById("selectedDate");
    var openCell = document.getElementById("openCell");
    var closeCell = document.getElementById("closeCell");
    var highCell = document.getElementById("highCell");
    var lowCell = document.getElementById("lowCell");
    var volumeCell = document.getElementById("volumeCell");

    //find dimensions of graph
    var margin = {top: 20, right: 60, bottom: 30, left: 80},
    width = chartColumn.offsetWidth - margin.left - margin.right,
    height = window.outerHeight/2.5 - margin.top - margin.bottom;
    
    var graphClicked = false; //used to check if the graph has been clicked

    //set ranges of axes
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    //line definition
    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.close); });

    //add svg object to page
    var svg = d3.select("#stockChart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // chart title
    svg.append('text')
        .attr('x', (width) / 2)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .text(`${apiSymbol} Stock Closing Prices`);

    //read data from Alphavantage api
    fetch(apiLink)
    .then((resp) => resp.json())
    .then(function(data) { // success
        
        //find the key depending on time interval
        var dataKey = `Time Series (${apiInterval})`;
        if (apiInterval == 'Weekly'){
            dataKey = 'Weekly Time Series';
        }
        else if(apiInterval == 'Monthly'){
            dataKey = 'Monthly Time Series';
        }

        //get all the stock info
        dataPoints = data[dataKey];

        var count = 0; //used to end loop if it goes over 100
        var avgClose = 0; //average close value
        //loop through all states
        for (let [key, value] of Object.entries(dataPoints)){
            
            if (count > 100){
                break;
            }

            //turn the date into a number
            key = Date.parse(key);

            //store the stock closing price and info
            var newEntry = {'date': key, 'close': parseFloat(value['4. close'])};
            avgClose += newEntry['close'];
            stockData.push(newEntry);
            newEntry = {'date': key, 'info':value};
            stockInfo.push(newEntry);
            
            count ++;
        }

        //find average close value
        avgClose /= stockData.length;
        console.log(avgClose);
        
        // Scale the range of the data
        x.domain(d3.extent(stockData, function(d) { return d.date; }));
        y.domain(d3.extent(stockData, function(d) { return d.close; }));
        
        //add x axis and label to graph
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append('text')
            .attr('x', width / 2)
            .attr('y', height + 30)
            .attr('text-anchor', 'middle')
            .text('Time');

        //add y axis and label to graph
        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append('text')
            .attr('x', -height/2)
            .attr('y', -40)
            .attr('transform', 'rotate(-90)')
            .attr('text-anchor', 'middle')
            .text('Price (USD)');

        //create gradient for graph (green -> white -> red)
        var linearGradient = svg.append("linearGradient")
            .attr("id", "linear-gradient")
            .attr("gradientTransform", "rotate(90)");
        linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "green");
        linearGradient.append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "white");
        linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "red");

        //add the path.
        svg.append("path")
            .data([stockData])
            .attr("opacity", 0.3)
            .attr("fill", "url(#linear-gradient)")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("d", line)
        
        //create circle to show details
        var focus = svg.append('g')
            .append('circle')
            .style("fill", "blue")
            .attr("stroke", "black")
            .attr('r', 3.5)
            .style("opacity", 0)

        //create line to show details
        var focusLineX = svg.append('line')
            .style("stroke", "blue")
            .style("stroke-dasharray", 5);
        var focusLineY = svg.append('line')
            .style("stroke", "blue")
            .style("stroke-dasharray", 5);

        //show text details
        var focusText = svg
            .append('g')
            .append('text')
            .style("opacity", 0)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle");

        //create rectangle over graph for mouse events
        svg.append('rect')
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', showDetails)
            .on('mousemove', followCursor)
            .on('mouseout', hideDetails)
            .on('mousedown', pauseCursor);
        
        //used to find circle placement
        var bisect = d3.bisector(function(d) { return d.date; }).left;
        //sort by date for bisecting
        stockData.sort(function(a, b) { return a.date - b.date; });
        stockInfo.sort(function(a, b) { return a.date - b.date; });

        //display details at current mouse location 
        function followCursor() {
            if (!graphClicked){
                
                //find closest point to cursor
                var x0 = x.invert(d3.mouse(this)[0]);
                x0 = Date.parse(x0);
                var i = bisect(stockData, x0, 1);
                
                //store the info to display
                selectedData = stockData[i];
                var date = new Date(selectedData.date);
                var dateString = date.toString().substring(0,16);

                //change location of text depending on position so it does not get cut off
                var xMod = (i > stockData.length/2) ? -200 : 10;
                var yModDate;
                var yModClose;
                var fillColour = "black";
                if (selectedData.close > avgClose){
                    yModDate = 40;
                    yModClose = 25;
                }
                else{
                    yModDate = -20;
                    yModClose = -35;
                }
                
                //store x and y of text
                var xCoord = x(selectedData.date) + xMod;
                var yCoord = y(selectedData.close);

                //move the circle
                focus.attr("cx", x(selectedData.date))
                    .attr("cy", y(selectedData.close));

                //move the line
                focusLineX.attr("x1", width)
                    .attr("y1", y(selectedData.close))
                    .attr("x2", 0)
                    .attr("y2", y(selectedData.close));

                //move the line
                focusLineY.attr("x1", x(selectedData.date))
                    .attr("y1", 0)
                    .attr("x2", x(selectedData.date))
                    .attr("y2", height);
                
                //move the text
                var focusHTML = `<tspan x=${xCoord} y=${yCoord + yModDate} fill = ${fillColour}>Date:${dateString}</tspan> <tspan x=${xCoord} y=${yCoord + yModClose} fill = ${fillColour}>Closing Price: ${selectedData.close} USD</tspan>`;

                focusText.html(focusHTML);

                //add to info table
                selectedDate.innerHTML = "Stock Info for " + date.toString();
                openCell.innerHTML = stockInfo[i].info['1. open'];
                highCell.innerHTML = stockInfo[i].info['2. high'];
                lowCell.innerHTML = stockInfo[i].info['3. low'];
                closeCell.innerHTML = stockInfo[i].info['4. close'];
                volumeCell.innerHTML = stockInfo[i].info['5. volume'];

            }
        }

        //make text and circle when mouse is over the graph
        function showDetails() {
            focus.style("opacity", 1);
            focusText.style("opacity",1);
            focusLineX.style("opacity", 1);
            focusLineY.style("opacity", 1);
        }
        
        //hide details when mouse leaves graph
        function hideDetails() {
            if (!graphClicked){
                focus.style("opacity", 0);
                focusText.style("opacity", 0);
                focusLineX.style("opacity", 0);
                focusLineY.style("opacity", 0);
            }
        }

        function pauseCursor(){
            if (graphClicked){
                graphClicked = false;
            }
            else{
                graphClicked = true;
            }
        }

    })
    .catch(function(error) { //error reading api
        console.log(error);
    });   
}

var buildNewsColumn = function(apiSymbol){
    var newsColumn = document.getElementById("newsColumn");
    newsColumn.innerHTML = ""; //reset news column

    var newsHeader = document.createElement('h1');
    newsHeader.id = 'newsHeader';
    newsHeader.className = 'title is-2';
    newsHeader.innerHTML = `Popular News Mentioning ${apiSymbol}`;

    newsColumn.appendChild(newsHeader);

    var newsApiKey = "9bb0a6bee065460a81bd1cfd3940951e";
    //search stock symbol at business category
    var newsApiLink = `http://newsapi.org/v2/everything?q=${apiSymbol}&sortBy=popularity&apiKey=${newsApiKey}`;

    //fetch news data from api
    fetch(newsApiLink)
    .then((resp) => resp.json())
    .then(function(data) { // success

        var articles = data.articles; //get the articles

        var maxArticles = 10; //maximum number of articles to display
        var count = 0; //current article being displayed
        
        //loop through articles (max 10)
        for (var i = 0; i < articles.length; i++){

            //break if max articles amount has been reached
            if (count >= maxArticles){
                break;
            }

            //create card for each article
            var newsCard = document.createElement('div');
            newsCard.className = "card";

            //create card image
            var newsCardImage = document.createElement('div');
            newsCardImage.className = "card-image";
            var newsFigure = document.createElement("figure");
            newsFigure.className = "image is-3by1";
            var newsImage = document.createElement("img");
            newsImage.src = articles[i].urlToImage;
            newsImage.alt = "No Image Found";

            //insert card image
            newsFigure.appendChild(newsImage);
            newsCardImage.appendChild(newsFigure);
            newsCard.appendChild(newsCardImage);

            //create card title
            var cardTitle = document.createElement("div");
            cardTitle.className = "card-content";
            var mediaContent = document.createElement("div");
            mediaContent.className = "media-content";
            var articleTitle = document.createElement("a");
            articleTitle.className = "title";
            articleTitle.href = articles[i].url;
            articleTitle.target = "_blank";
            articleTitle.innerHTML = articles[i].title;
            
            //insert card title
            mediaContent.appendChild(articleTitle);
            cardTitle.appendChild(mediaContent);
            newsCard.appendChild(cardTitle);

            //create card subtitle
            var cardSubtitle = document.createElement("div");
            cardSubtitle.className = "content";
            var subtitleContent = document.createElement("p");
            subtitleContent.className = "subtitle is-6";
            subtitleContent.innerHTML = `${articles[i].author}, Source: ${articles[i].source.name}`;

            //insert card subtitle
            cardSubtitle.appendChild(subtitleContent);
            newsCard.appendChild(cardSubtitle);

            //create card content
            var cardContent = document.createElement("div");
            cardContent.className = "content";
            var contentDescription = document.createElement("p");
            contentDescription.innerHTML = articles[i].description;
            var contentPublish = document.createElement("p");
            contentPublish.innerHTML = `Published: ${articles[i].publishedAt.substring(0, 10)}`;

            //insert card content
            cardContent.appendChild(contentDescription);
            cardContent.appendChild(contentPublish);
            newsCard.appendChild(cardContent);
            
            newsColumn.appendChild(newsCard);

            count++;
        }

    })
    .catch(function(error) { // error
        console.log(error);
    });    


}