onmessage = function(event) {
    let searchQuery = event.data;
    let delayInMilliseconds = 1000; //delay for search

    this.setTimeout(function() {
        if (searchQuery.length > 0){
            //get link to alphavantage api
            var apiKey = "KA26ULAWH85VJQEN";
            var apiLink = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=${apiKey}`;
            console.log(apiLink);

            //build search results based on data from api
            fetch(apiLink)
            .then((resp) => resp.json())
            .then(function(data) { // success
                console.log(data);
                postMessage(data.bestMatches);
            })
            .catch(function(error) { //error reading api
                console.log(error);
            });
        }
    
    }, delayInMilliseconds);
};
