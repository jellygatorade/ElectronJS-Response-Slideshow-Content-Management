const electron = require('electron')
const ipc = electron.ipcRenderer;

function loopHeader() {
	var loopHeader = setInterval( function() { changeText(forward) }, 6000);

	// Back and forward with arrow keys
	document.addEventListener("keydown", event => {
		//console.log(event.code);
		event.stopPropagation();
		if (event.code === "ArrowLeft") {

			changeText(backward);
			clearInterval(loopHeader);
			loopHeader = setInterval( function() { changeText(forward) }, 6000);

		} else if (event.code === "ArrowRight") {

			changeText(forward);
			clearInterval(loopHeader);
			loopHeader = setInterval( function() { changeText(forward) }, 6000);

		} else {
			return;
		}
	  });

}

var loopItem = -1; // loopItem starts with value of -1 so that the initial ++ in the loop makes it 0 (rather than 0 -> 1)
var forward = "forward";
var backward = "backward";

var questionTextParagraph = document.getElementById("questionTextParagraph");
var slideTextParagraph = document.getElementById("slideTextParagraph");

var sortedJSON = {configuredResponses: "unchanged"};
var totalq1responses, totalq1q2responses, totalq1q2q3responses;
var q1responses, q2responses, q3responses;

// Request the configured responses from main.js and initiate the slideshow with loopHeader()
ipc.invoke('requestResponses').then((result) => {
	sortedJSON.configuredResponses = result.sortedJSON;

	totalq1responses = sortedJSON.configuredResponses.responses[0].length;
	totalq1q2responses = sortedJSON.configuredResponses.responses[0].length + sortedJSON.configuredResponses.responses[1].length;
	totalq1q2q3responses = sortedJSON.configuredResponses.responses[0].length + sortedJSON.configuredResponses.responses[1].length + sortedJSON.configuredResponses.responses[2].length;

	q1responses = sortedJSON.configuredResponses.responses[0];
	q2responses = sortedJSON.configuredResponses.responses[1];
	q3responses = sortedJSON.configuredResponses.responses[2];

	loopHeader();
})

function changeText(arg) {

	if (arg === "forward") {
		loopItem++;
	} else if (arg === "backward") {
		loopItem--;
	}
	
	// Start over when loopItem hits the same quantity as totalq1q2q3responses (sum of all responses stored)
	if (loopItem == totalq1q2q3responses) {
		loopItem = 0;
	} else if (loopItem < 0) {
		loopItem = totalq1q2q3responses - 1;
	}

	// As long as loopItem is under the total quantity of responses for q1:
	if (loopItem < totalq1responses) {
		questionTextParagraph.innerHTML = sortedJSON.configuredResponses.questions[0]; // Display first question as heading (questionTextParagraph)
		slideTextParagraph.innerHTML = q1responses[loopItem]; // Display first question responses until loopItem hits total responses for q1

	// Once loopItem his total responses for q1:
	} else if (loopItem >= totalq1responses && loopItem < totalq1q2responses) {
		questionTextParagraph.innerHTML = sortedJSON.configuredResponses.questions[1]; // Display second question as heading (questionTextParagraph)
		slideTextParagraph.innerHTML = q2responses[loopItem - totalq1responses]; // Display second question responses until loopItem hits total responses for q1 + q2

	// Once loopItem his total responses for q2 + q2:
	} else if (loopItem >= totalq1q2responses && loopItem < totalq1q2q3responses) {
		questionTextParagraph.innerHTML = sortedJSON.configuredResponses.questions[2]; // Display third question as heading (questionTextParagraph)
		slideTextParagraph.innerHTML = q3responses[loopItem - totalq1q2responses]; // Display third question responses until loopItem equals total responses for q1 + q2 + q3
	}

}