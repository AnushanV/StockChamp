//referenced https://www.d3-graph-gallery.com/graph/line_cursor.html

window.onload = function(){
   
    var search = document.getElementById('search');
    
    var apiFunction = "TIME_SERIES_DAILY";
    var apiSymbol = "IBM";
    var apiOutputSize = "compact";
    var apiKey = "KA26ULAWH85VJQEN";

    var apiLink = "https://www.alphavantage.co/query?function=" + apiFunction + "&symbol=" + apiSymbol 
        + "&outputsize=" + apiOutputSize + "&apikey=" + apiKey;
    console.log(apiLink);

    var stockData = [];
    var stockInfo;

    // set the dimensions and margins of the graph
    var margin = {top: 20, right: 20, bottom: 30, left: 50},
    
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    
    // set the ranges
    var x = d3.scaleTime().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    // define the line
    var line = d3.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });

    // append the svg obgect to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    var svg = d3.select("#stockChart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    //read data from api
    fetch(apiLink)
    .then((resp) => resp.json())
    .then(function(data) { // success

        stockInfo = data['Meta Data']; //store info on stock

        //store closing price for each day
        dataPoints = data['Time Series (Daily)'];
        for (let [key, value] of Object.entries(dataPoints)){
            var newEntry = {'date': key, 'close': parseFloat(value['4. close'])};
            stockData.push(newEntry);
        }

        // format the data
        stockData.forEach(function(d) {
            d.date = Date.parse(d.date);
        });

        //find average close value
        var avgClose = 0;
        for (let [key, value] of Object.entries(stockData)){
            avgClose += value.close;
        }
        avgClose /= stockData.length;

        // Scale the range of the data
        x.domain(d3.extent(stockData, function(d) { return d.date; }));
        y.domain([d3.min(stockData, function(d) { return d.close; }) - 10,
            d3.max(stockData, function(d) { return d.close; }) + 10]);
        
         // This allows to find the closest X index of the mouse:
        var bisect = d3.bisector(function(d) { return d.date; }).left;

        // Create the circle that travels along the curve of chart
        var focus = svg
            .append('g')
            .append('circle')
            .style("fill", "none")
            .attr("stroke", "black")
            .attr('r', 8.5)
            .style("opacity", 0)

        // Create the text that travels along the curve of chart
        var focusText = svg
            .append('g')
            .append('text')
            .style("opacity", 0)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle");

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
        
        // Create a rect on top of the svg area: this rectangle recovers mouse position
        svg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);
        
        var gradient = `<linearGradient id="gradient">
        <stop stop-color="red" offset="0%"/>
        <stop stop-color="white" offset="50%"/>
        <stop stop-color="green" offset="100%"/>
        </linearGradient>`;

        //add the path.
        svg.append("path")
        .data([stockData])
        .attr("class", "line")
        .attr("fill", "url(#linear-gradient)")
        .attr("opacity", 0.3)
        .attr("stroke", "black")
        .attr("stroke-width", 1.5)
        .attr("d", line)
       
        // Add the X Axis
        svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

        // Add the Y Axis
        svg.append("g")
        .call(d3.axisLeft(y));

       

         // What happens when the mouse move -> show the annotations at the right positions.
        function mouseover() {
            focus.style("opacity", 1)
            focusText.style("opacity",1)
        }

        function mousemove() {
            // recover coordinate we need
            stockData.sort(function(a, b) { return a.date - b.date; });
            var x0 = x.invert(d3.mouse(this)[0]);
            
            x0 = Date.parse(x0);
            var i = bisect(stockData, x0, 1);
            
            selectedData = stockData[i];
            var date = new Date(selectedData.date);
            var dateString = date.toString().substring(0,16);

            var xMod = (i > stockData.length/2) ? -200 : 0;
            var yModDate;
            var yModClose;
            var fillColour = "black";

            if (selectedData.close > avgClose){
                yModDate = 50;
                yModClose = 35;
            }
            else{
                yModDate = -35;
                yModClose = -50;
            }

            //console.log(avgClose);
            //console.log(selectedData.close);

            var xCoord = x(selectedData.date) + xMod;
            var yCoord = y(selectedData.close);

            var focusHTML = `<tspan x=${xCoord} y=${yCoord + yModDate} fill = ${fillColour}>Date:${dateString}</tspan> <tspan x=${xCoord} y=${yCoord + yModClose} fill = ${fillColour}>Closing Price: ${selectedData.close} USD</tspan>`;

            focus
            .attr("cx", x(selectedData.date))
            .attr("cy", y(selectedData.close))
            focusText
            .html(focusHTML)
            .attr("color", "green");
        }
        
        function mouseout() {
            focus.style("opacity", 0)
            focusText.style("opacity", 0)
        }


    })
    .catch(function(error) { //error reading api
        console.log(error);
    });   
    
};
