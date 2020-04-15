$(document).ready(function() {
    var stock1 = document.getElementById('stock1');
    var stock2 = document.getElementById('stock2');
    var stock3 = document.getElementById('stock3');
    var stock1Data = stock1.firstElementChild.innerHTML;
    var stock2Data = stock2.firstElementChild.innerHTML;
    var stock3Data = stock3.firstElementChild.innerHTML;

    console.log(stock1);
    console.log(stock2);
    console.log(stock3);
    $(stock1).click(function() {
        alert(stock1Data);
    });

    $(stock2).click(function() {
        console.log(stock2);
        alert(stock2Data);
    });

    $(stock3).click(function() {
        console.log(stock3Data);
        alert(stock3Data);
    });
});