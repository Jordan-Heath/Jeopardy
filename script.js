let playerViews = document.querySelectorAll(".player");

let topics = [];
let players = [];
let starttime;
let currentQuestion;
let preloadedImages = [];

// Images can be bare filenames from the images folder, paths relative to the
// app ("./pictures/foo.png"), or remote URLs ("https://example.com/foo.png").
function resolveImageSource(image) {
    const value = typeof image === 'string' ? image.trim() : '';
    if (!value) {
        return null;
    }

    // Allow "www.example.com/picture.jpg" as a convenience.
    if (/^www\./i.test(value)) {
        return `https://${value}`;
    }

    // Absolute URLs (https:, http:, data:, blob:, ...) and protocol-relative URLs.
    if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) {
        return value;
    }

    // Root-relative paths and explicitly relative paths are used as-is.
    if (value.startsWith('/') || value.startsWith('./') || value.startsWith('../')) {
        return value;
    }

    // Older quizzes may already include the images folder in the path.
    if (value.toLowerCase().startsWith('images/')) {
        return value;
    }

    return `images/${value}`;
}

function initialize() {
    startGameButton.disabled = true;

    // add listener to load custom game button
    quizFileInput.addEventListener('change', loadCustomGame);

    // Load topics from data
    loadTopics(DATA);
}

function selectPlayerCount(button, playerCount) {
    // Remove the activated class from all player count buttons
    const buttons = document.querySelectorAll('.playerCountButton');
    buttons.forEach(btn => btn.classList.remove('activated'));
    button.classList.add("activated");

    // Reset Players
    players = [];

    // Get the players container
    const playersContainer = document.getElementById('players');
    playersContainer.innerHTML = ''; // Clear existing player elements

    // Build the player elements and initialize players
    for (let i = 0; i < playerCount; i++) {
        // Create player element
        const playerElement = document.createElement('div');
        playerElement.id = `player${i + 1}`;
        playerElement.className = 'player';

        // Create input for player name
        const playerNameInput = document.createElement('input');
        playerNameInput.className = 'player-name';
        playerNameInput.type = 'text';
        playerNameInput.placeholder = `Player ${i + 1}...`;
        playerNameInput.onchange = function() {
            players[i].name = this.value;
        };

        // Create player score display
        const playerScore = document.createElement('div');
        playerScore.className = 'player-score';
        playerScore.textContent = '0';

        // Create answer buttons table
        const table = document.createElement('table');
        const answerButtons = ['a', 'b', 'c', 'd'];
        for (let row = 0; row < 2; row++) {
            const tr = document.createElement('tr');
            for (let col = 0; col < 2; col++) {
                const td = document.createElement('td');
                const button = document.createElement('button');
                button.className = 'answer-button';
                button.textContent = answerButtons[row * 2 + col].toUpperCase();
                button.onclick = function() {
                    playerSelectAnswer(this, players[i], answerButtons[row * 2 + col]);
                };
                td.appendChild(button);
                tr.appendChild(td);
            }
            table.appendChild(tr);
        }

        // Append elements to playerElement
        playerElement.appendChild(playerNameInput);
        playerElement.appendChild(playerScore);
        playerElement.appendChild(table);

        // Append playerElement to players container
        playersContainer.appendChild(playerElement);

        // Initialize player
        players.push(new Player(`Player ${i + 1}`, playerElement));
    }

    // Disable controls for all players
    players.forEach(player => player.disableControls());

    // Enable the start game button
    startGameButton.disabled = false;

    playerViews = document.querySelectorAll(".player");
}

function startGame() {
    resetGameProgress();

    // Navigate to gameboard-view
    openingView.style.display = 'none';
    gameboardView.style.display = 'flex';

    starttime = Date.now();

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
    // Disable selected question's button on gameboard-view
    button.disabled = true;

    // Load selected question from topic
    const question = topics[topicNumber].questions[questionNumber];
    currentQuestion = question;

    // Navigate to question view
    gameboardView.style.display = 'none';
    questionView.style.display = 'flex';
    answerQuestionButton.style.display = 'block';
    answerQuestionButton.disabled = true;
    

    // Set the image source (images are optional)
    questionID.innerHTML = `${topics[topicNumber].name} for ${question.score}`;
    const imageSource = resolveImageSource(question.image);
    if (imageSource) {
        questionImage.alt = question.heading || 'Question image';
        questionImage.onerror = () => {
            questionImage.style.display = 'none';
        };
        questionImage.src = imageSource;
        questionImage.style.display = 'block';
    } else {
        questionImage.removeAttribute('src');
        questionImage.alt = '';
        questionImage.style.display = 'none';
    }
    
    // Construct the question view text content with typing effect
    typeText(question.heading, questionHeading, () => {
        typeText(question.paragraph, questionParagraph, () => {
            questionAnswerTable.style.opacity = 1;
            typeText(`A: ${question.a}`, questionAnswerA, () => {
                typeText(`B: ${question.b}`, questionAnswerB, () => {
                    typeText(`C: ${question.c}`, questionAnswerC, () => {
                        typeText(`D: ${question.d}`, questionAnswerD, () => {
                            // Enable controls for players to answer
                            answerQuestionButton.style.opacity = 1;
                            players.forEach(player => player.enableControls());
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
    }, 10); // Adjust typing speed as needed
}

function playerSelectAnswer(button, player, selection) {
    // Remove the activated class from all player count buttons
    const buttons = player.element.querySelectorAll('.answer-button');
    buttons.forEach(btn => btn.classList.remove('activated'));

    // Add the activated class to the clicked button
    button.classList.add("activated");

    player.currentAnswer = selection;
    answerQuestionButton.disabled = false;

    players.forEach(player => {
        if (player.currentAnswer === null)
            answerQuestionButton.disabled = true;
    });
}

function answerQuestion() {
    // Disable/change controls
    answerQuestionButton.style.display = 'none';
    answerQuestionButton.style.opacity = 0;
    returnGameboardButton.style.display = 'block';
    returnGameboardButton.disabled = true;
    players.forEach(player => player.disableControls());

    // Determine who won, assign scores and update view
    players.forEach(player => {
        if (currentQuestion.answer === player.currentAnswer) {
            player.score += currentQuestion.score;
            player.element.classList.add('correctPlayer');
        } else {
            player.score -= currentQuestion.score;
            player.element.classList.add('incorrectPlayer');
        }
        player.currentAnswer = null;
        player.updateView();
    });

    // Highlight the correct answer
    const correctAnswerElement = document.getElementById(`questionAnswer${currentQuestion.answer.toUpperCase()}`);
    correctAnswerElement.classList.add('correctAnswer');

    // Load/animate answer
    typeText(currentQuestion.answerParagraph, questionAnswer, () => {
        // Enable controls to return to gameboard
        returnGameboardButton.disabled = false;
        returnGameboardButton.style.opacity = 1;
    });
}

function clearQuestionView() {
    questionHeading.textContent = '';
    questionImage.removeAttribute('src');
    questionImage.alt = '';
    questionImage.style.display = 'none';
    questionParagraph.textContent = '';
    questionAnswerTable.style.opacity = 0;
    questionAnswerA.textContent = '';
    questionAnswerB.textContent = '';
    questionAnswerC.textContent = '';
    questionAnswerD.textContent = '';
    questionAnswer.textContent = '';
    document.querySelectorAll('.answer').forEach(answerElement => {
        answerElement.classList.remove('correctAnswer');
    });
}

function returnToGameboard() {
    // clear question page
    clearQuestionView();

    // Clear Player Correct/Incorrect
    players.forEach(player => {
        player.element.classList.remove('correctPlayer');
        player.element.classList.remove('incorrectPlayer');
    });

    // Change question chooser
    returnGameboardButton.style.display = 'none';
    returnGameboardButton.style.opacity = 0;
    questionView.style.display = 'none';
    gameboardView.style.display = 'flex';

    currentQuestion.completed = true;

    // Check if the game is over
    let gameover = topics.every(topic => topic.questions.every(question => question.completed));

    if (gameover) {
        gameOver();
    } else {
        // Select the next question chooser
        let currentIndex = players.findIndex(player => player.isChooser);
        players[currentIndex].removeChooser(); // Remove .chooser from current chooser
        currentIndex = (currentIndex + 1) % players.length;
        players[currentIndex].chooseQuestion(); // Add .chooser to the next chooser
    }
}

function gameOver() {
    // Navigate to endscreen
    gameboardView.style.display = 'none';
    gameoverView.style.display = 'flex';

    // Determine who won
    let winner = players.reduce((max, player) => player.score > max.score ? player : max, players[0]);

    // Print winner details
    winnerName.innerHTML = winner.name;
    winnerScore.innerHTML = winner.score;

    // Calculate game time in minutes and seconds
    let totalTimeInSeconds = Math.floor((Date.now() - starttime) / 1000);
    let minutes = Math.floor(totalTimeInSeconds / 60);
    let seconds = totalTimeInSeconds % 60;

    // Display game time
    gameTime.innerHTML = `${minutes} minutes ${seconds} seconds`;
}

function returnToMainMenu() {
    resetGameProgress();

    gameoverView.style.display = 'none';
    openingView.style.display = 'flex';
    gameboardView.style.display = 'none';
    questionView.style.display = 'none';
}

function loadCustomGame(event) {
    const input = event.target;
    const file = input.files[0];
    if (!file) {
        return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            loadTopics(data);

            //make user aware custom game is in progress
            customIndicator.style.display = "block";
            startGameButton.innerHTML = '<h2>Start CUSTOM Game</h2>';
            setCustomGameError('');
            alert('Enjoy Your Custom Game!');
        } catch (error) {
            // Keep the current game intact and show a helpful message instead of reloading.
            setCustomGameError(error instanceof SyntaxError
                ? 'That file is not valid JSON.'
                : error.message);
        } finally {
            // Allow the same file to be selected again.
            input.value = '';
        }
    };
    reader.onerror = function() {
        setCustomGameError('The file could not be read.');
        input.value = '';
    };
    reader.readAsText(file);
}

function setCustomGameError(message) {
    customGameError.textContent = message;
}

const ANSWER_LETTERS = ['a', 'b', 'c', 'd'];

// Validate and normalize imported quiz data so a slightly-off custom quiz
// reports a clear error instead of breaking partway through a game.
function normalizeQuiz(data) {
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        throw new Error('The quiz must be a JSON object whose keys are topic names.');
    }

    const topicNames = Object.keys(data);
    if (topicNames.length === 0) {
        throw new Error('The quiz does not contain any topics.');
    }

    return topicNames.map(topicName => {
        const rawQuestions = data[topicName];
        if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
            throw new Error(`Topic "${topicName}" must be a non-empty array of questions.`);
        }

        const questions = rawQuestions.map((raw, questionIndex) => {
            const label = `Topic "${topicName}", question ${questionIndex + 1}`;
            if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
                throw new Error(`${label} must be an object.`);
            }

            const choices = {};
            ANSWER_LETTERS.forEach(letter => {
                const choice = raw[letter];
                if (typeof choice !== 'string' || choice.trim() === '') {
                    throw new Error(`${label} is missing choice "${letter}".`);
                }
                choices[letter] = choice;
            });

            return new Question(
                typeof raw.heading === 'string' ? raw.heading : '',
                typeof raw.image === 'string' && raw.image.trim() !== '' ? raw.image.trim() : null,
                typeof raw.paragraph === 'string' ? raw.paragraph : '',
                choices.a,
                choices.b,
                choices.c,
                choices.d,
                normalizeAnswer(raw.answer, choices, label),
                normalizeScore(raw.score, questionIndex, label),
                typeof raw.answerParagraph === 'string' ? raw.answerParagraph : ''
            );
        });

        return new Topic(topicName, questions);
    });
}

function normalizeAnswer(value, choices, label) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`${label} is missing an "answer" (a, b, c, or d).`);
    }

    // Accept "C", " c ", or the full text of one of the choices.
    const normalized = value.trim().toLowerCase();
    if (ANSWER_LETTERS.includes(normalized)) {
        return normalized;
    }

    const matchingLetter = ANSWER_LETTERS.find(letter =>
        choices[letter].trim().toLowerCase() === normalized
    );
    if (matchingLetter) {
        return matchingLetter;
    }

    throw new Error(`${label} has answer "${value}"; it must be a, b, c, or d.`);
}

function normalizeScore(value, questionIndex, label) {
    // Fall back to the conventional 100/200/300... scale when no score is given.
    if (value === undefined || value === null || value === '') {
        return (questionIndex + 1) * 100;
    }

    const score = Number(value);
    if (!Number.isFinite(score)) {
        throw new Error(`${label} has an invalid score "${value}".`);
    }
    return score;
}

function loadTopics(data) {
    // Normalize first so an invalid quiz leaves the current topics untouched.
    topics = normalizeQuiz(data);

    // Dynamically build the gameboard
    const tbody = gameboardView.querySelector('tbody');

    // Clear existing headers and questions
    subjectNames.innerHTML = '';
    tbody.innerHTML = '';

    // Create the header row
    const headerRow = document.createElement('tr');
    topics.forEach((topic) => {
        const th = document.createElement('th');
        th.textContent = `${topic.name}`;
        headerRow.appendChild(th);
    });
    subjectNames.appendChild(headerRow);

    // Create the question rows (topics may have different numbers of questions)
    const rowCount = Math.max(0, ...topics.map(topic => topic.questions.length));

    // Tell the grid how many columns and rows to lay out.
    const boardTable = gameboardView.querySelector('table');
    boardTable.style.setProperty('--topic-count', topics.length);
    boardTable.style.setProperty('--row-count', rowCount);

    for (let i = 0; i < rowCount; i++) {
        const row = document.createElement('tr');
        topics.forEach((topic, topicIndex) => {
            const cell = document.createElement('td');
            const question = topic.questions[i];
            if (question) {
                const button = document.createElement('button');
                button.textContent = `${question.score}`;
                button.addEventListener('click', () => selectQuestion(button, topicIndex, i));
                cell.appendChild(button);
            }
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    }

    // Preload images
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