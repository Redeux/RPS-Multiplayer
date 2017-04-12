  // Initialize Firebase
let config = {
	apiKey: "AIzaSyDWSvyN7QpuHfzdJHZlCgByvk6fqPyFyqo",
	authDomain: "rps-multiplayer-c5028.firebaseapp.com",
	databaseURL: "https://rps-multiplayer-c5028.firebaseio.com",
	storageBucket: "rps-multiplayer-c5028.appspot.com",
	messagingSenderId: "311567494540"
	};
firebase.initializeApp(config);

$(() => {
	//Variables
	let databaseRef = {
		root: firebase.database().ref(),
		chat: firebase.database().ref('chat'),
		players: firebase.database().ref('players'),
		player1: firebase.database().ref('players/player-1'),
		player2: firebase.database().ref('players/player-2'),
		turn: firebase.database().ref('turn')
	};
	let db = firebase.database();
	let playerId;
	let winnerId;
	let player1Name;
	let player2Name;
	let choices = {
		player1: false,
		player2: false
	};


	//Click listener for login button
	$('#login-button').on('click', function(event) {
		event.preventDefault();
		if (!$(this).hasClass('disabled')) {
			let loginId = $('#login-name').val().trim();
			login(loginId);
			disableLogin();
			$('#login-name').val('');
		}
	})

	//Click listener for rock paper scissors links
	$('.rps').on('click', '.rps-option', function(event) {
		event.preventDefault();
		console.log('players/player-'+playerId);
		let choice = $(this).attr('data-id');
		db.ref('players/player-'+playerId).update({
			choice: choice
		})
	})

	//Check to see if the game is full one time on load
	databaseRef.players.once('value', (snap) => {
		if (snap.child('player-1').exists() && snap.child('player-2').exists()) {
			console.log('game is full');
			disableLogin();
		} 
	})

	//Listen for id changes
	db.ref('players/player-1/id').on('value', (snap) => {
		if (!snap.exists()) {
			$('#player1-box > h3').text('Waiting for Player 1');
			enableLogin();
		} else {
			$('#player1-box > h3').text(snap.val());
			player1Name = snap.val();
		}
	})
	db.ref('players/player-2/id').on('value', (snap) => {
		if (!snap.exists()) {
			$('#player2-box > h3').text('Waiting for Player 2');
			enableLogin();
		} else {
			$('#player2-box > h3').text(snap.val());
			player2Name = snap.val();
		}
	})

	//Listen for win changes
	db.ref('players/player-1/wins').on('value', (snap) => {
		if (!snap.exists()) {
			$('#player1-wins').text('');
		} else {
			$('#player1-wins').text('Wins: ' + snap.val());
		}
	})
	db.ref('players/player-2/wins').on('value', (snap) => {
		if (!snap.exists()) {
			$('#player2-wins').text('');
		} else {
			$('#player2-wins').text('Wins: ' + snap.val());		}
	})

	//Listen for loss changes
	db.ref('players/player-1/losses').on('value', (snap) => {
		if (!snap.exists()) {
			$('#player1-losses').text('');
		} else {
			$('#player1-losses').text('Losses: ' + snap.val());
		}
	})
	db.ref('players/player-2/losses').on('value', (snap) => {
		if (!snap.exists()) {
			$('#player2-losses').text('');
		} else {
			$('#player2-losses').text('Losses: ' + snap.val());		
		}
	})

	//Listen for RPS Choices
	db.ref('players/player-1/choice').on('value', (snap) => {
		if (snap.val() !== '') {
			choices.player1 = snap.val();
			checkAnswer(choices);
		}
	})
	db.ref('players/player-2/choice').on('value', (snap) => {
		if (snap.val() !== '') {
			choices.player2 = snap.val();
			checkAnswer(choices);
		}
	})

	function playGame() {
		//Fill in the Rock Paper Scissor choices for the appropriate player
		$('#player'+playerId+'-box > .rps').append(
			$('<a>')
			.attr({
				href: '#',
				'data-id': 'rock'
			})
			.addClass('h4 rps-option')
			.text('Rock')
		);
		$('#player'+playerId+'-box > .rps').append(
			$('<a>')
			.attr({
				href: '#',
				'data-id': 'paper'
			})
			.addClass('h4 rps-option')
			.text('Paper')
		);
		$('#player'+playerId+'-box > .rps').append(
			$('<a>')
			.attr({
				href: '#',
				'data-id': 'scissors'
			})
			.addClass('h4 rps-option')
			.text('Scissors')
		);
	}

	function login(id) {
		//Check if the player references exist in the DB and if they don't then create the appropriate player
		let existingPlayers = databaseRef.players.once('value', (snap) => {
			if (!snap.exists()) {
			//If there aren't any players create player 1
				createPlayer(1);
				playerId = 1;
				loginMessage(true);
				playGame();
			} else if (snap.child('player-1').exists() && !snap.child('player-2').exists()) {
			//If player 1 exists but player 2 doesn't create player 2
				createPlayer(2);
				playerId = 2;
				loginMessage(true);
				playGame();
			} else if (snap.child('player-2').exists() && !snap.child('player-1').exists()){
			//If player 2 exists but player 1 doesn't create player 2
				createPlayer(1)
				playerId = 1;
				loginMessage(true);
				playGame();
			} else {
			//Game is full
				console.log('too many players')
				loginMessage(false);
				disableLogin();
			}
		})
		
		function createPlayer(num) {
			if (num === 1) {
				databaseRef.player1.update({
					id: id,
					wins: 0,
					losses: 0,
					choice: ''
				})
			}
			if (num === 2) {
				databaseRef.player2.update({
					id: id,
					wins: 0,
					losses: 0,
					choice: ''
				})
			}
		}

		function loginMessage(bool) {
			if (bool) {
				$('#login-box').append(
					$('<p>')
					.addClass('text-center')
					.text('Login Sucessful!')
					.css('color', 'limegreen')
					.fadeOut(5000)
				);
			} else {
				$('#login-box').append(
					$('<p>')
					.addClass('text-center')
					.text('Login Failed - Too Many Players')
					.css('color', 'red')
				);
			}
		}
	}

	function checkAnswer(obj) {
		if (obj.player1 && obj.player2) {
			if (obj.player1 === 'rock' && obj.player2 === 'paper') {
				winnerId = 2;
			} else if (obj.player1 === 'rock' && obj.player2 === 'scissors') {
				winnerId = 1;
			} else if (obj.player1 === 'paper' && obj.player2 === 'rock') {
				winnerId = 1;
			} else if (obj.player1 === 'paper' && obj.player2 === 'scissors') {
				winnerId = 2;
			} else if (obj.player1 === 'scissors' && obj.player2 === 'rock') {
				winnerId = 2;
			} else if (obj.player1 === 'scissors' && obj.player2 === 'paper') {
				winnerId = 1;
			} else {
				winnerId = 0;
			}
		}
		if (winnerId === 1) {
			//Player1 wins
			$('#results-box').html(
				$('<h3>')
				.addClass('display-3 text-center')
				.text(player1Name + ' Wins!')
			);
		} else if (winnerId === 2) {
			//Player2 wins
			$('#results-box').html(
				$('<h3>')
				.addClass('display-3 text-center')
				.text(player2Name + ' Wins!')
			);
		} else if (winnerId === 0) {
			//Tie
			$('#results-box').html(
				$('<h3>')
				.addClass('display-3 text-center')
				.text('It\'s a Tie!')
			);
		} else {
			$('#results-box').html('')
		}
	}

	function disableLogin() {
		$('#login-name').prop('disabled', true);
		$('#login-button').addClass('disabled');
	}

	function enableLogin() {
		$('#login-name').prop('disabled', false);
		$('#login-button').removeClass('disabled');
	}
})