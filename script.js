'use strict';
// WEEK 12 - SCORE KEEPER

function clickTest1() {
	console.log('Test button 1 clicked');
	getHistory();
}

function clickTest2() {
	console.log('Test button 2 clicked');
}

// Initial Variables
const APIURL = 'https://64037e4d80d9c5c7bab5ad0e.mockapi.io/game-history';
let allHistoryData = []; // empty until GET from api
let scoreKeeperActive = true;
let currentPlayers = [
	['Player 1', 0, 'yellow'],
	['Player 2', 0, 'yellow'],
];
let lastSelectedColor = '';

// DOM Elements
const scoreKeeperTab = document.querySelector(`#score-keeper-tab`);
const scoreKeeperPage = document.querySelector(`#score-keeper-page`);
const scoreKeeperHolder = document.querySelector(`#score-keeper-holder`);
const historyTab = document.querySelector(`#history-tab`);
const historyPage = document.querySelector(`#history-page`);
const historyCardsHolder = document.querySelector(`#history-cards-holder`);
const chuckModal = document.querySelector(`#chuck-modal`);
const chuckModalBackdrop = document.querySelector(`#chuck-modal-backdrop`);

// INVOCATION of renders: //NOTE Might want to change location
getHistory();
renderCurrentPlayers();

function renderCurrentPlayers() {
	// clear previous player lines
	scoreKeeperHolder.innerHTML = '';

	let i = 0;
	let html = '';
	for (let player of currentPlayers) {
		const name = player[0];
		const score = player[1];
		const color = player[2];

		const playerLine = `<div class="d-flex player-${color}">
	<button class="btn" onclick="displayModalPlayerEdit(${i})">
		<i class="bi bi-pencil-fill"></i>
	</button>
	<div class="scorekeeper-text flex-grow-1 text-center">${name}</div>
	<div class="scorekeeper-text ps-4 pe-4">${score}</div>
	<button class="btn" onclick="scoreDown(${i})">
		<i class="bi bi-dash-square-fill"></i>
	</button>
	<button class="btn" onclick="scoreUp(${i})">
		<i class="bi bi-plus-square-fill"></i>
	</button>
</div>`;
		html += playerLine;
		i++;
	}
	scoreKeeperHolder.insertAdjacentHTML('beforeend', html);
}

function getHistory() {
	const errorMessage = 'Error getting data';
	fetch(APIURL, {
		method: 'GET',
		headers: { 'content-type': 'application/json' },
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
			// handle error
			console.log(errorMessage);
		})
		.then((data) => {
			// save to array, console log success message, and render all
			allHistoryData = data;
			console.log(`Successful History GET from api`);
			renderHistoryCards();
		})
		.catch((error) => {
			// handle error
			console.log(errorMessage);
		});
}

function renderHistoryCards() {
	// Clear all scorecards
	historyCardsHolder.innerHTML = '';

	// Generate and insert html for each scorecard
	let i = 0;
	let html = '';
	for (let element of allHistoryData) {
		const apiId = element.id;
		const game = element.game;
		const date = convertDateFormat(element.date);
		const scores = convertScoreboard(element.scoreboard);
		const memo = element.memo;

		const newCard = `<div class="col">
  <div class="card text-center mt-3 mb-3 border-0 shadow">
    <h5 class="card-header text-bg-primary">${game}<br>${date}</h5>
    <div class="card-body">
      <p class="card-text">${scores}</p>
      <p class="card-text">${memo}</p>
      <div class="btn-group btn-group-sm" role="group" aria-label="Small button group">
        <button type="button" class="btn btn-outline-primary" onclick="displayModalCardEdit(${i})">
          <i class="bi bi-pencil-fill"></i>
        </button>
        <button type="button" class="btn btn-outline-primary" onclick="displayModalCardDelete(${i})">
          <i class="bi bi-trash-fill"></i>
        </button>
      </div>
    </div>
  </div>
</div>`;
		html += newCard;
		i++;
	}
	historyCardsHolder.insertAdjacentHTML('beforeend', html);
}

function tabScoreKeeper() {
	if (!scoreKeeperActive) {
		scoreKeeperPage.classList.remove('hidden');
		historyPage.classList.add('hidden');

		scoreKeeperTab.classList.remove('dimmed');
		historyTab.classList.add('dimmed');

		scoreKeeperActive = true;
	}
}

function tabHistory() {
	if (scoreKeeperActive) {
		scoreKeeperPage.classList.add('hidden');
		historyPage.classList.remove('hidden');

		scoreKeeperTab.classList.add('dimmed');
		historyTab.classList.remove('dimmed');

		scoreKeeperActive = false;
	}
}

function scoreDown(index) {
	currentPlayers[index][1]--;
	renderCurrentPlayers();
}

function scoreUp(index) {
	currentPlayers[index][1]++;
	renderCurrentPlayers();
}

// Convert scoreboard objects-array to string
function convertScoreboard(scoreboardArray) {
	let newString = '';
	for (let player of scoreboardArray) {
		newString += `<br>${player.name} - ${player.score}`;
	}
	return newString.substring(4); // removes the initial <br>
}

// Convert Date format from ISO to better table format
function convertDateFormat(ISODate) {
	const convertDate = new Date(ISODate);
	const newMonth = convertDate.getMonth() + 1;
	const newDayOfMonth = convertDate.getDate();
	const newYear = convertDate.getFullYear();
	return `${newMonth}.${newDayOfMonth}.${newYear}`;
	// HINT: To convert format other direction, use toISOString()
}

function deleteCard(id) {
	console.log(`Delete Card ${id} was clicked`);

	const errorMessage = 'There was a problem deleting data';

	fetch(`${APIURL}/${id}`, {
		method: 'DELETE',
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
			// handle error
			console.log(errorMessage);
		})
		.then((data) => {
			console.log(`ID number ${data.id} sucessfully deleted`);
			getHistory();
		})
		.catch((error) => {
			// handle error
			console.log(errorMessage);
		});
	closeModal();
}

function displayModalCardEdit(index) {
	const selectedCard = allHistoryData[index];

	const game = selectedCard.game;
	const date = convertDateFormat(selectedCard.date);
	const scores = convertScoreboard(selectedCard.scoreboard);
	const oldMemo = selectedCard.memo;
	const id = selectedCard.id;

	let html = `<div class="card text-center border-0">
	<h5 class="card-header text-bg-primary">${game}<br>${date}</h5>
	<div class="card-body">
		<p class="card-text">${scores}</p>
		<label class="d-block">Memo: </label>
		<textarea id="updated-memo-text" class="d-block mb-3" rows="5" cols="33" placeholder="${oldMemo}">${oldMemo}</textarea>
		<button type="button" class="btn btn-primary" onclick="closeModal()">Cancel</button>
		<button type="button" class="btn btn-primary" onclick="cardMemoPut(${id})">Save</button>
	</div>
</div>
	`;
	chuckModal.insertAdjacentHTML('beforeend', html);
	// after html is built and inserted, reveal modal
	chuckModal.classList.remove('hidden');
	chuckModalBackdrop.classList.remove('hidden');
}

function cardMemoPut(id) {
	const updatedMemo = document.querySelector(`#updated-memo-text`).value;
	// If message is blank, simply close the modal, ELSE put to api
	if (updatedMemo === '') {
		closeModal();
	} else {
		const errorMessage = 'There was an error updating memo to API';
		fetch(`${APIURL}/${id}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ memo: updatedMemo }),
		})
			.then((res) => {
				if (res.ok) {
					return res.json();
				}
				// handle error
				console.log(errorMessage);
			})
			.then((task) => {
				// Do something with updated task
				console.log(`Memo for id: ${id} successfully updated.`);
				getHistory();
			})
			.catch((error) => {
				// handle error
				console.log(errorMessage);
			});
		closeModal();
	}
}

function displayModalCardDelete(index) {
	const selectedCard = allHistoryData[index];

	const game = selectedCard.game;
	const date = convertDateFormat(selectedCard.date);
	const id = selectedCard.id;

	let html = `<div class="card text-center border-0">
	<div class="card-body">
		<p class="card-text">Are you sure you want to delete<br>${game}, played on ${date} ?</p>
		<button type="button" class="btn btn-primary" onclick="closeModal()">Cancel</button>
		<button type="button" class="btn btn-primary" onclick="deleteCard(${id})">Delete</button>
	</div>
</div>
	`;
	chuckModal.insertAdjacentHTML('beforeend', html);
	// after html is built and inserted, reveal modal
	chuckModal.classList.remove('hidden');
	chuckModalBackdrop.classList.remove('hidden');
}

function displayModalPlayerEdit(index) {
	const name = currentPlayers[index][0];
	const currentColor = currentPlayers[index][2];

	let html = `<div class="card text-center">
	<div class="card-header pb-0"><h4>Edit Player Info</h4></div>
	<div class="card-body">
		<label>Name:</label>
		<input id="name-input" type="text" value="${name}" /><br>
		<label class="mt-3">Color:</label><br />
		<div id="color-picker" class="mb-3">
			<div class="color-selector player-yellow" onclick="selectColor('yellow')"></div>
			<div class="color-selector player-orange" onclick="selectColor('orange')"></div>
			<div class="color-selector player-red" onclick="selectColor('red')"></div>
			<div class="color-selector player-white" onclick="selectColor('white')"></div>
			<br />
			<div class="color-selector player-purple" onclick="selectColor('purple')"></div>
			<div class="color-selector player-blue" onclick="selectColor('blue')"></div>
			<div class="color-selector player-green" onclick="selectColor('green')"></div>
			<div class="color-selector player-gray" onclick="selectColor('gray')"></div>
		</div>
		<button class="btn btn-primary" onclick="removePlayer(${index})">Remove</button>
		<button class="btn btn-primary" onclick="updatePlayer(${index})">Save</button>
	</div>
</div>`;
	chuckModal.insertAdjacentHTML('beforeend', html);
	selectColor(currentColor);
	chuckModal.classList.remove('hidden');
	chuckModalBackdrop.classList.remove('hidden');
}

function selectColor(selection) {
	lastSelectedColor = selection;

	// DOM Elements
	const colorPicker = document.querySelector(`#color-picker`);
	const colorSelectors = colorPicker.querySelectorAll(`.color-selector`);

	// remove the 'selected' class from all, then add to only the selection
	for (let i of colorSelectors) i.classList.remove('selected');
	colorPicker.querySelector(`.player-${selection}`).classList.add('selected');
}

function removePlayer(index) {
	currentPlayers.splice(index, 1);
	renderCurrentPlayers();
	closeModal();
}

function updatePlayer(index) {
	// Get player name from DOM
	const updatedName = document.querySelector(`#name-input`).value;

	// Update current players array
	currentPlayers[index][0] = updatedName;
	currentPlayers[index][2] = lastSelectedColor;

	renderCurrentPlayers();
	closeModal();
}

function displayModalNewPlayer() {
	let html = `<div class="card text-center">
	<div class="card-header pb-0"><h4>New Player</h4></div>
	<div class="card-body">
		<label>Name:</label>
		<input id="name-input" type="text" /><br />
		<label class="mt-3">Color:</label><br />
		<div id="color-picker" class="mb-3">
			<div class="color-selector player-yellow" onclick="selectColor('yellow')"></div>
			<div class="color-selector player-orange" onclick="selectColor('orange')"></div>
			<div class="color-selector player-red" onclick="selectColor('red')"></div>
			<div class="color-selector player-white" onclick="selectColor('white')"></div>
			<br />
			<div class="color-selector player-purple" onclick="selectColor('purple')"></div>
			<div class="color-selector player-blue" onclick="selectColor('blue')"></div>
			<div class="color-selector player-green" onclick="selectColor('green')"></div>
			<div class="color-selector player-gray" onclick="selectColor('gray')"></div>
		</div>
		<button class="btn btn-primary" onclick="closeModal()">Cancel</button>
		<button class="btn btn-primary" onclick="addPlayer()">Add</button>
	</div>
</div>
	`;
	chuckModal.insertAdjacentHTML('beforeend', html);
	selectColor('yellow');
	chuckModal.classList.remove('hidden');
	chuckModalBackdrop.classList.remove('hidden');
}

function addPlayer() {
	// Get player name from DOM
	const newName = document.querySelector(`#name-input`).value;

	// Generate new array and push to currentPlayers array
	currentPlayers.push([newName, 0, lastSelectedColor]);
	renderCurrentPlayers();

	closeModal();
}

function closeModal() {
	chuckModal.classList.add('hidden');
	chuckModalBackdrop.classList.add('hidden');
	// clear modal holder's inner html for next use
	chuckModal.innerHTML = '';
}

function displayModalClearGame() {
	let html = `<div class="card text-center">
	<div class="card-header pb-0"><h4>Clear Game</h4></div>
	<div class="card-body">
		<label>Game:</label><br>
		<input id="game-input" type="text"/><br>

		<label class="mt-3">Memo:</label><br>
		<textarea id="memo-input" class="mb-4" cols="30" rows="5"></textarea><br>

		<button class="btn btn-primary" onclick="clearScores()">Clear without saving</button>
		<button class="btn btn-primary" onclick="saveGame()">Save to history</button>
	</div>
</div>`;
	chuckModal.insertAdjacentHTML('beforeend', html);
	chuckModal.classList.remove('hidden');
	chuckModalBackdrop.classList.remove('hidden');
}

function clearScores() {
	for (let player of currentPlayers) {
		player[1] = 0;
	}
	renderCurrentPlayers();
	closeModal();
}

function saveGame() {
	// Generate new object for saved game
	const newGameName = document.querySelector(`#game-input`).value;
	const newMemo = document.querySelector(`#memo-input`).value;
	const newDate = new Date();
	let newScoreboard = [];
	for (let player of currentPlayers) {
		newScoreboard.push({
			name: player[0],
			score: player[1],
		});
	}
	let newGameToPost = {
		game: newGameName,
		date: newDate,
		scoreboard: newScoreboard,
		memo: newMemo,
	};

	// POST to api
	fetch(APIURL, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		// Send your data in the request body as JSON
		body: JSON.stringify(newGameToPost),
	})
		.then((res) => {
			if (res.ok) {
				return res.json();
			}
			// handle error
		})
		.then((data) => {
			// do something with the new task
			console.log(`api POST successful`);
			getHistory();
		})
		.catch((error) => {
			// handle error
		});

	// Switch to history page, clear scores, and close the modal
	tabHistory();
	clearScores();
	closeModal();
}
