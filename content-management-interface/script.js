const electron = require('electron')
const ipc = electron.ipcRenderer;

var formJSON;
var sortedJSON;

function handleFormSubmit(event) {
    event.preventDefault();
    
    const data = new FormData(event.target);
    
    formJSON = Object.fromEntries(data.entries());

    sortedJSON = {};
    sortedJSON.questions = [];
    sortedJSON.responses = [];
    sortedJSON.questions.push(formJSON.q1, formJSON.q2, formJSON.q3);
    sortedJSON.responses.push(formJSON.q1responses, formJSON.q2responses, formJSON.q3responses);

    var i;
    var tempArray = [];
    for (i = 0; i < 3; i++) {
        
        //sortedJSON.responses[i] = sortedJSON.responses[i].split(","); //splits string into an array based on comma
        sortedJSON.responses[i] = sortedJSON.responses[i].split(/\r?\n/); //splits string into an array based on line breaks '\n'
        tempArray.push([]);
        
        var j;
        for (j = 0; j < sortedJSON.responses[i].length; j++) {
            tempArray[i].push(
                sortedJSON.responses[i][j].replace(/^[ ]+|[ ]+$/g, '') //remove trailing and leading spaces.
            );
        }
        sortedJSON.responses[i] =  tempArray[i].filter(item => item); //remove empty string items ("") that resulted from empty lines.
        
        if (sortedJSON.responses[i].length === 0) {
            sortedJSON.responses[i] = ""; //change array to empty string if no data is entered.
        }
    } 

    var formResponses = { formJSON, sortedJSON };

    const results = document.querySelector('.results pre');
    results.innerText = JSON.stringify(formResponses, null, 2);

    /* for storage of JSON appdata */
    // Calling the ipcRenderer.send() to send the formResponses object asynchronously
    ipc.send('updateResponses', formResponses);

}
  
const form = document.querySelector('.contact-form');
form.addEventListener('submit', handleFormSubmit);

/* for populating the form's previous responses */
var q1 = document.getElementById('q1');
var q2 = document.getElementById('q2');
var q3 = document.getElementById('q3');
var q1responses = document.getElementById('q1responses');
var q2responses = document.getElementById('q2responses');
var q3responses = document.getElementById('q3responses');

function populateForm(JSON) {
    q1.value = JSON.q1;
    q2.value = JSON.q2;
    q3.value = JSON.q3;
    q1responses.value = JSON.q1responses;
    q2responses.value = JSON.q2responses;
    q3responses.value = JSON.q3responses;
}

// Request the configured responses from main.js
ipc.invoke('requestResponses').then((result) => {
    //console.log(result);
    populateForm(result.formJSON);
})