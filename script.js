const openingView = document.getElementById('openingView');
const gameboardView = document.getElementById('gameboardView');
const questionView = document.getElementById('questionView');
const gameoverView = document.getElementById('gameoverView');

const startGameButton = document.getElementById('startGameButton');
const quizFileInput = document.getElementById('quizFileInput');
const customIndicator = document.getElementById('customIndicator');
const customGameError = document.getElementById('customGameError');

const gameboardTable = gameboardView.querySelector('table');
const subjectNames = document.getElementById('subjectNames');

const playersView = document.getElementById('players');

const questionID = document.getElementById('questionID');
const questionHeading = document.getElementById('questionHeading');
const questionImage = document.getElementById('questionImage');
const questionParagraph = document.getElementById('questionParagraph');
const questionAnswerTable = document.getElementById('questionAnswerTable');
const questionAnswerA = document.getElementById('questionAnswerA');
const questionAnswerB = document.getElementById('questionAnswerB');
const questionAnswerC = document.getElementById('questionAnswerC');
const questionAnswerD = document.getElementById('questionAnswerD');
const questionAnswer = document.getElementById('questionAnswer');
const answerQuestionButton = document.getElementById('answerQuestionButton');
const returnGameboardButton = document.getElementById('returnGameboardButton');

const winnerName = document.getElementById('winnerName');
const winnerScore = document.getElementById('winnerScore');
const gameTime = document.getElementById('gameTime');

let topics = [];
let players = [];
let startTime;
let currentQuestion;
let preloadedImages = [];

function showElement(element) {
    element.hidden = false;
}

function hideElement(element) {
    element.hidden = true;
}

function initialize() {
    startGameButton.disabled = true;

    // Add listener to load custom game button
    quizFileInput.addEventListener('change', loadCustomGame);

    // Load topics from data
    loadTopics(DATA);
}

function selectPlayerCount(button, playerCount) {
    // Remove the activated class from all player count buttons
    document.querySelectorAll('.playerCountButton').forEach(playerCountButton => {
        playerCountButton.classList.remove('activated');
    });
    button.classList.add('activated');

    // Reset players
    players = [];
    playersView.replaceChildren();

    // Build the player elements and initialize players
    for (let i = 0; i < playerCount; i++) {
        const playerElement = document.createElement('div');
        playerElement.id = `player${i + 1}`;
        playerElement.className = 'player';

        const playerNameInput = document.createElement('input');
        playerNameInput.className = 'player-name';
        playerNameInput.type = 'text';
        playerNameInput.placeholder = `Player ${i + 1}...`;
        playerNameInput.addEventListener('change', () => {
            players[i].name = playerNameInput.value;
        });

        const playerScore = document.createElement('div');
        playerScore.className = 'player-score';
        playerScore.textContent = '0';

        const table = document.createElement('table');
        for (let row = 0; row < 2; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 2; col++) {
                const letter = ANSWER_LETTERS[row * 2 + col];
                const td = document.createElement('td');
                const answerButton = document.createElement('button');

                answerButton.className = 'answer-button';
                answerButton.dataset.letter = letter;
                answerButton.textContent = letter.toUpperCase();
                answerButton.addEventListener('click', () => {
                    playerSelectAnswer(answerButton, players[i], letter);
                });

                td.appendChild(answerButton);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        playerElement.append(playerNameInput, playerScore, table);
        playersView.appendChild(playerElement);
        players.push(new Player(`Player ${i + 1}`, playerElement));
    }

    players.forEach(player => player.disableControls());

    startGameButton.disabled = false;
}

function startGame() {
    resetGameProgress();

    hideElement(openingView);
    showElement(gameboardView);

    startTime = Date.now();
    players[0].chooseQuestion();
}

// Prepare the current quiz and players for a fresh game. This runs when a game
// starts and when the player returns to the main menu from the final screen.
function resetGameProgress() {
    topics.forEach(topic => {
        topic.questions.forEach(question => {
            question.completed = false;
        });
    });

    gameboardView.querySelectorAll('tbody button').forEach(button => {
        button.disabled = false;
    });

    players.forEach(player => {
        player.score = 0;
        player.currentAnswer = null;
        player.removeChooser();
        player.updateView();
        player.disableControls();
        player.element.classList.remove('correctPlayer', 'incorrectPlayer');
    });

    clearQuestionView();
    currentQuestion = null;
}

function selectQuestion(button, topicNumber, questionNumber) {
    // Disable the selected question's button on the gameboard
    button.disabled = true;

    const question = topics[topicNumber].questions[questionNumber];
    currentQuestion = question;

    hideElement(gameboardView);
    showElement(questionView);

    showElement(answerQuestionButton);
    answerQuestionButton.disabled = true;
    answerQuestionButton.style.opacity = 0;
    hideElement(returnGameboardButton);
    returnGameboardButton.style.opacity = 0;

    questionID.textContent = `${topics[topicNumber].name} for ${question.score}`;

    // Set the image source (images are optional)
    const imageSource = resolveImageSource(question.image);
    if (imageSource) {
        questionImage.alt = question.heading || 'Question image';
        questionImage.onerror = () => hideElement(questionImage);
        questionImage.src = imageSource;
        showElement(questionImage);
    } else {
        questionImage.removeAttribute('src');
        questionImage.alt = '';
        hideElement(questionImage);
    }

    // Construct the question view text content with typing effect
    typeText(question.heading, questionHeading, () => {
        typeText(question.paragraph, questionParagraph, () => {
            questionAnswerTable.style.opacity = 1;
            typeText(`A: ${question.a}`, questionAnswerA, () => {
                typeText(`B: ${question.b}`, questionAnswerB, () => {
                    typeText(`C: ${question.c}`, questionAnswerC, () => {
                        typeText(`D: ${question.d}`, questionAnswerD, () => {
                            // The highlighted team answers first, so only they can
                            // use their controls until they have picked an answer.
                            answerQuestionButton.style.opacity = 1;
                            players.forEach(player => {
                                if (player.isChooser) {
                                    player.enableControls();
                                } else {
                                    player.disableControls();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}

// Function to simulate typing effect
function typeText(text, element, callback) {
    let index = 0;
    const intervalId = setInterval(() => {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
        } else {
            clearInterval(intervalId);
            if (callback) callback();
        }
    }, 10);
}

// Show the highlighted team's answer in yellow on every other team's answer
// buttons, so it is obvious which answer counts as copying.
function highlightChooserAnswer(selection) {
    players.forEach(player => {
        if (player.isChooser) {
            return;
        }

        player.element.querySelectorAll('.answer-button').forEach(answerButton => {
            answerButton.classList.toggle(
                'chooserAnswer',
                answerButton.dataset.letter === selection
            );
        });
    });
}

function playerSelectAnswer(button, player, selection) {
    const chooser = players.find(otherPlayer => otherPlayer.isChooser);

    // The highlighted team must pick first. Everyone else can only answer
    // once that team has committed to an answer.
    if (!player.isChooser && (!chooser || chooser.currentAnswer === null)) {
        return;
    }

    // Remove the activated class from all of the player's answer buttons
    player.element.querySelectorAll('.answer-button').forEach(answerButton => {
        answerButton.classList.remove('activated');
    });

    button.classList.add('activated');

    player.currentAnswer = selection;

    // Now that the highlighted team has answered, let the other teams answer
    // too (or copy the highlighted team's answer).
    if (player.isChooser) {
        highlightChooserAnswer(selection);

        players.forEach(otherPlayer => {
            if (otherPlayer !== player) {
                otherPlayer.enableControls();
            }
        });
    }

    // Only the highlighted team has to answer, so the question can be marked
    // as soon as they have picked something.
    answerQuestionButton.disabled = !chooser || chooser.currentAnswer === null;
}

function answerQuestion() {
    // Disable/change controls
    hideElement(answerQuestionButton);
    answerQuestionButton.style.opacity = 0;
    showElement(returnGameboardButton);
    returnGameboardButton.disabled = true;
    returnGameboardButton.style.opacity = 0;
    players.forEach(player => player.disableControls());

    // Teams that copy the highlighted team's answer get half points when
    // correct, but lose twice as many points when incorrect.
    const chooser = players.find(player => player.isChooser);
    const chooserAnswer = chooser ? chooser.currentAnswer : null;

    // Determine who won, assign scores and update view
    players.forEach(player => {
        // Only the highlighted team has to answer; anyone who passed is skipped.
        if (player.currentAnswer === null) {
            return;
        }

        const copiedChooser = player !== chooser
            && chooserAnswer !== null
            && player.currentAnswer === chooserAnswer;

        if (currentQuestion.answer === player.currentAnswer) {
            player.score += copiedChooser
                ? currentQuestion.score / 2
                : currentQuestion.score;
            player.element.classList.add('correctPlayer');
        } else {
            player.score -= copiedChooser
                ? currentQuestion.score * 2
                : currentQuestion.score;
            player.element.classList.add('incorrectPlayer');
        }
        player.currentAnswer = null;
        player.updateView();
    });

    // Highlight the correct answer
    const correctAnswerElement = document.getElementById(
        `questionAnswer${currentQuestion.answer.toUpperCase()}`
    );
    correctAnswerElement.classList.add('correctAnswer');

    // Load/animate answer
    typeText(currentQuestion.answerParagraph, questionAnswer, () => {
        returnGameboardButton.disabled = false;
        returnGameboardButton.style.opacity = 1;
    });
}

function clearQuestionView() {
    questionHeading.textContent = '';
    questionImage.removeAttribute('src');
    questionImage.alt = '';
    hideElement(questionImage);
    questionParagraph.textContent = '';
    questionAnswerTable.style.opacity = 0;
    questionAnswerA.textContent = '';
    questionAnswerB.textContent = '';
    questionAnswerC.textContent = '';
    questionAnswerD.textContent = '';
    questionAnswer.textContent = '';
    hideElement(answerQuestionButton);
    hideElement(returnGameboardButton);
    answerQuestionButton.style.opacity = 0;
    returnGameboardButton.style.opacity = 0;

    document.querySelectorAll('.answer').forEach(answerElement => {
        answerElement.classList.remove('correctAnswer');
    });
}

function returnToGameboard() {
    clearQuestionView();

    players.forEach(player => {
        player.element.classList.remove('correctPlayer', 'incorrectPlayer');
    });

    hideElement(questionView);
    showElement(gameboardView);

    currentQuestion.completed = true;

    // Check if the game is over
    const gameover = topics.every(topic =>
        topic.questions.every(question => question.completed)
    );

    if (gameover) {
        gameOver();
        return;
    }

    // Select the next question chooser
    const currentIndex = players.findIndex(player => player.isChooser);
    players[currentIndex].removeChooser();
    players[(currentIndex + 1) % players.length].chooseQuestion();
}

function gameOver() {
    hideElement(gameboardView);
    showElement(gameoverView);

    const winner = players.reduce((best, player) =>
        player.score > best.score ? player : best
    );

    winnerName.textContent = winner.name;
    winnerScore.textContent = winner.score;

    const totalTimeInSeconds = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(totalTimeInSeconds / 60);
    const seconds = totalTimeInSeconds % 60;

    gameTime.textContent = `${minutes} minutes ${seconds} seconds`;
}

function returnToMainMenu() {
    resetGameProgress();

    hideElement(gameoverView);
    hideElement(gameboardView);
    hideElement(questionView);
    showElement(openingView);
}

function loadCustomGame(event) {
    const input = event.target;
    const file = input.files[0];
    if (!file) {
        return;
    }

    readJsonFile(file, data => {
        loadTopics(data);

        // Make the user aware a custom game is in progress
        showElement(customIndicator);
        startGameButton.innerHTML = '<h2>Start CUSTOM Game</h2>';
        setCustomGameError('');
        alert('Enjoy Your Custom Game!');
    }, error => {
        // Keep the current game intact and show a helpful message instead.
        setCustomGameError(formatJsonFileError(error));
    });

    input.value = '';
}

function setCustomGameError(message) {
    customGameError.textContent = message;
}

function loadTopics(data) {
    // Normalize first so an invalid quiz leaves the current topics untouched.
    topics = normalizeQuiz(data);

    const tbody = gameboardTable.querySelector('tbody');

    subjectNames.replaceChildren();
    tbody.replaceChildren();

    const headerRow = document.createElement('tr');
    topics.forEach(topic => {
        const th = document.createElement('th');
        th.textContent = topic.name;
        headerRow.appendChild(th);
    });
    subjectNames.appendChild(headerRow);

    // Topics may have different numbers of questions.
    const rowCount = Math.max(0, ...topics.map(topic => topic.questions.length));

    // Tell the grid how many columns and rows to lay out.
    gameboardTable.style.setProperty('--topic-count', topics.length);
    gameboardTable.style.setProperty('--row-count', rowCount);

    for (let questionIndex = 0; questionIndex < rowCount; questionIndex++) {
        const row = document.createElement('tr');

        topics.forEach((topic, topicIndex) => {
            const cell = document.createElement('td');
            const question = topic.questions[questionIndex];

            if (question) {
                const button = document.createElement('button');
                button.textContent = String(question.score);
                button.addEventListener('click', () => {
                    selectQuestion(button, topicIndex, questionIndex);
                });
                cell.appendChild(button);
            }

            row.appendChild(cell);
        });

        tbody.appendChild(row);
    }

    preloadImages();
}

function preloadImages() {
    // Keep references so the browser does not garbage-collect the preloaded images.
    preloadedImages = [];
    topics.forEach(topic => {
        topic.questions.forEach(question => {
            const imageSource = resolveImageSource(question.image);
            if (!imageSource) {
                return;
            }
            const img = new Image();
            img.src = imageSource;
            preloadedImages.push(img);
        });
    });
}

// Call the initialize function to set up the game
initialize();
