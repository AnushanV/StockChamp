//list of buttons in each stock column
var stock1Buttons = []; 
var stock2Buttons = [];
var stock3Buttons = [];

//current selected stock for each column
var stock1;
var stock2;
var stock3;

//header stock cells
var stock1Cell;
var stock2Cell;
var stock3Cell;

window.onload = function(){

    //build page based on current user data
    var fetchResult = getStoredData();
    fetchResult.then(function(value){
        console.log(value);
        stock1 = value[0].stock1;
        stock2 = value[0].stock2;
        stock3 = value[0].stock3;
        this.buildPage(value);
    });
};

/**
 * Returns the database data for the current user
 */
async function getStoredData(){
    //fetch and return data
    var response = await this.fetch('/api/getStock', {method: 'GET'});
    var data = await response.json();
    console.log(data);
    return data;
}

/**
 * Builds the whole search page
 * @param {*} userData - The database entry for the user
 */
function buildPage(userData){
    //get search bar
    var searchBar = document.getElementById("searchBar");
    var searchButton = document.getElementById("searchButton");
    var submitButton = document.getElementById("updateStock");
    var dropdownMenu = document.getElementById("searchDropdown");
    dropdownMenu.style.display = "none";

    //process search on button click
    $(searchButton).click(function() {
        processSearch(searchBar.value, userData);
        dropdownMenu.style.display = "none"; //hide dropdown
    });

    //create worker for search
    let searchWorker = new Worker('/scripts/searchWorker.js');

    searchWorker.onmessage = function(event) {
        //get worker response
        let workerResults = event.data;
        buildDropdown(workerResults);
    };

    //process search on enter press in search bar or update worker
    $(searchBar).on('keypress', function(e) {
        if (e.which == 13){
            dropdownMenu.style.display = "none";
            processSearch(searchBar.value, userData);
        }
        else{ 
            dropdownMenu.style.display = "block"; //hide dropdown
            //send worker a message with updated field
            searchWorker.postMessage(searchBar.value);
        }
    });

    

    console.log('Started worker thread.');

    //submit new stocks when submit button is clicked
    $(submitButton).click(function() {

        //stringify the new stock data
        console.log('submitting');
        var stringData = JSON.stringify(userData);
        console.log(`json string: ${stringData}`);

        //send new stock data to the database
        fetch('/updateStock', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: stringData
        })
        .then(function(response) {
            console.log('recorded');
        })
        .catch(function(error) {
            console.log(error);
        });
        
        searchWorker.terminate(); //terminate worker
        location.reload(true); //reload the page to update stocks
    });
}

/**
 * Fetches search results from alphavantage api and creates table
 * @param {*} searchQuery - The search query
 */
async function processSearch(searchQuery, userData){
    
    //get link to alphavantage api
    var apiKey = "BAHJPY9DH9YKDHZZ";
    var apiLink = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=${apiKey}`

    var searchResults = document.getElementById("searchResults");
    searchResults.innerHTML = ""; //clear table for new search
    
    //append current stocks to header
    tableHeader = document.createElement('thead');
    titleCell = document.createElement('th');
    titleCell.innerHTML = `Currently Selected`;
    stock1Cell = document.createElement('th');
    stock1Cell.innerHTML = (stock1 == '') ? 'None' : stock1;
    stock2Cell = document.createElement('th');
    stock2Cell.innerHTML = (stock2 == '') ? 'None' : stock2;
    stock3Cell = document.createElement('th');
    stock3Cell.innerHTML = (stock3 == '') ? 'None' : stock3;

    tableHeader.appendChild(titleCell);
    tableHeader.appendChild(stock1Cell);
    tableHeader.appendChild(stock2Cell);
    tableHeader.appendChild(stock3Cell);

    searchResults.appendChild(tableHeader);

    //append header to table
    var tableHeader = document.createElement('thead');
    var titleCell = document.createElement('th');
    titleCell.innerHTML = `Search Results for ${searchQuery}`;
    var titleCell2 = document.createElement('th');
    titleCell2.innerHTML = "Stock 1";
    var titleCell3 = document.createElement('th');
    titleCell3.innerHTML = "Stock 2";
    var titleCell4 = document.createElement('th');
    titleCell4.innerHTML = "Stock 3";

    tableHeader.appendChild(titleCell);
    tableHeader.appendChild(titleCell2);
    tableHeader.appendChild(titleCell3);
    tableHeader.appendChild(titleCell4);

    searchResults.appendChild(tableHeader);    

    var tableBody = document.createElement('tbody');
    tableBody.id = "searchBody";
    searchResults.appendChild(tableBody);

    //build search results based on data from api
    var data = await getApiData(apiLink);
    data.bestMatches.forEach(result => {
        buildResult(result);
    });

    //apply button functions
    setButtonFunction(userData);
};

/**
 * Returns the search data from alphavantage api
 * @param {*} apiLink - The link to alphavantage search
 */
async function getApiData(apiLink){
    var response = await this.fetch(apiLink);
    var data = await response.json();
    return data;
}

/**
 * Adds a row for a search result
 * @param {*} searchResult - the search result
 */
function buildResult(searchResult){
    var resultLocation = document.getElementById("searchBody");
    var resultRow = document.createElement("tr");

    //create cell with result
    var resultCell = document.createElement("td");
	// creating clickable text
	var clickableText = document.createElement("a");
	clickableText.innerHTML = `${searchResult["2. name"]} (${searchResult["1. symbol"]})`;
	clickableText.setAttribute("href", `/stockPage/${searchResult["1. symbol"]}`);
	resultCell.appendChild(clickableText);
    resultRow.appendChild(resultCell);

    //create buttons
    for (var i = 1; i < 4; i++){

        //create the button
        var stockButton = document.createElement('button');
        stockButton.className = "button is-info is-light";
        stockButton.innerHTML = `Set Stock ${i}`;

        //create one button for each stock slot
        if (i == 1){
            stock1Buttons.push([stockButton, searchResult["1. symbol"]]);
        }
        else if (i == 2){
            stock2Buttons.push([stockButton, searchResult["1. symbol"]]);
        }
        else if (i == 3){
            stock3Buttons.push([stockButton, searchResult["1. symbol"]]);
        }

        //add the button to the table
        var newCell = document.createElement("td");
        newCell.appendChild(stockButton);
        resultRow.appendChild(newCell);
        
    }

    resultLocation.appendChild(resultRow);
};

/**
 * Applies on click action to each stock button
 * @param {*} userData - The current database entry for the user
 */
function setButtonFunction(userData){

    //apply click function to stock1 column
    stock1Buttons.forEach(button => {
        $(button[0]).click(function(){
            unhighlightButtons(stock1Buttons);
            stock1 = button[1];
            button[0].className = "button is-info";
            //console.log(`${stock1}, ${stock2}, ${stock3}`);
            stock1Cell.innerHTML = stock1
            userData['0'].stock1 = stock1;

            console.log(userData);
        });
    });

    //apply click function to stock2 column
    stock2Buttons.forEach(button => {
        $(button[0]).click(function(){
            unhighlightButtons(stock2Buttons);
            stock2 = button[1];
            button[0].className = "button is-info";
            //console.log(`${stock1}, ${stock2}, ${stock3}`);
            stock2Cell.innerHTML = stock2;
            userData['0'].stock2 = stock2;
        });
    });

    //apply click function to stock3 column
    stock3Buttons.forEach(button => {
        $(button[0]).click(function(){
            unhighlightButtons(stock3Buttons);
            stock3 = button[1];
            button[0].className = "button is-info";
            //console.log(`${stock1}, ${stock2}, ${stock3}`);
            stock3Cell.innerHTML = stock3;
            userData['0'].stock3 = stock3;
        });
    });
};

/**
 * Unhighlights buttons in a list
 * @param {*} buttons - list of buttons to unhighlight
 */
var unhighlightButtons = function(buttons){
    buttons.forEach(button => {
        button[0].className = "button is-info is-light";
    });
};

/**
 * Builds search result dropdown menu
 * @param {*} searchResults 
 */
var buildDropdown = function(searchResults){
    var dropdownMenu = document.getElementById("searchDropdown");
    var searchBar = document.getElementById("searchBar");

    dropdownMenu.innerHTML = ""; //reset dropdown menu content

    //create a new entry for each result
    searchResults.forEach(result => {
        var newItem = document.createElement('a');
        newItem.innerHTML = result['1. symbol'];
        newItem.className = "dropdown-item";
        dropdownMenu.appendChild(newItem);

        //set searchbar value to dropdown item when clicked
        $(newItem).click(function() {
           searchBar.value = newItem.innerHTML;
           dropdownMenu.style.display = "none";
        });

    });


}