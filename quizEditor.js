const menuView = document.getElementById('openingView');
const controlsView = document.getElementById('controlsView');
const quizEditorView = document.getElementById('quizEditorView');
const quizEditorBoardView = document.getElementById('quizEditorBoardView');
const quizEditorQuestionView = document.getElementById('quizEditorQuestionView');
const quizEditorBoardEmpty = document.getElementById('editorBoardEmpty');
const editorBoardTable = document.getElementById('editorBoardTable');
const editorBoardTopics = document.getElementById('editorBoardTopics');
const editorBoardQuestions = document.getElementById('editorBoardQuestions');
const editorBoardActions = document.getElementById('editorBoardActions');
const quizEditorError = document.getElementById('quizEditorError');
const quizEditorStatus = document.getElementById('quizEditorStatus');
const quizEditorFileInput = document.getElementById('quizEditorFileInput');

const IMAGE_PREVIEW_DELAY = 500;

const QUESTION_EDITOR_TEMPLATE = `
    <div id="editorQuestionHeader">
        <div id="editorQuestionID">
            <span id="editorQuestionTopicLabel"></span>
            <span class="editorQuestionFor">for</span>
            <input type="number" id="editorQuestionScoreInput" step="10" aria-label="Question score">
        </div>
        <div id="editorQuestionHeadingShell">
            <div id="editorQuestionHeadingInput" contenteditable="true" role="textbox" aria-label="Question heading" data-placeholder="Question heading"></div>
        </div>
    </div>
    <div id="editorQuestionBody">
        <div id="editorQuestionImageColumn">
            <div id="editorQuestionImagePreview" title="Click to edit the image path"></div>
            <input type="text" id="editorQuestionImageInput" placeholder="Image filename, relative path, or web URL" aria-label="Question image">
        </div>
        <div id="editorQuestionBodyContent">
            <textarea id="editorQuestionParagraphInput" rows="3" placeholder="Question text" aria-label="Question text"></textarea>
            <table id="editorAnswerTable">
                <tr>
                    <td data-letter="a">
                        <div class="editorAnswerCell">
                            <button type="button" class="editorAnswerMarker" data-letter="a" title="Mark choice A as correct">A</button>
                            <textarea class="editorAnswerInput" data-letter="a" rows="2" placeholder="Choice A" aria-label="Choice A"></textarea>
                        </div>
                    </td>
                    <td data-letter="b">
                        <div class="editorAnswerCell">
                            <button type="button" class="editorAnswerMarker" data-letter="b" title="Mark choice B as correct">B</button>
                            <textarea class="editorAnswerInput" data-letter="b" rows="2" placeholder="Choice B" aria-label="Choice B"></textarea>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td data-letter="c">
                        <div class="editorAnswerCell">
                            <button type="button" class="editorAnswerMarker" data-letter="c" title="Mark choice C as correct">C</button>
                            <textarea class="editorAnswerInput" data-letter="c" rows="2" placeholder="Choice C" aria-label="Choice C"></textarea>
                        </div>
                    </td>
                    <td data-letter="d">
                        <div class="editorAnswerCell">
                            <button type="button" class="editorAnswerMarker" data-letter="d" title="Mark choice D as correct">D</button>
                            <textarea class="editorAnswerInput" data-letter="d" rows="2" placeholder="Choice D" aria-label="Choice D"></textarea>
                        </div>
                    </td>
                </tr>
            </table>
            <textarea id="editorQuestionAnswerParagraphInput" rows="2" placeholder="Answer explanation" aria-label="Answer explanation"></textarea>
            <p class="editorQuestionHint">Click a letter circle to set the correct answer. Ctrl+Enter saves and exits.</p>
            <div id="editorQuestionActions">
                <button type="button" id="saveQuestionButton">Save &amp; Exit</button>
                <button type="button" id="discardQuestionButton" class="subtleLink">Discard &amp; Return</button>
                <button type="button" id="deleteQuestionButton" class="subtleLink editorDeleteQuestion">Delete Question</button>
            </div>
        </div>
    </div>
`;

let editorTopics = [];
let editorQuestionContext = null;

// ---------- Editor data ----------

function createEditorTopic() {
    return {
        name: `Topic ${editorTopics.length + 1}`,
        questions: []
    };
}

function createEditorQuestion(questionIndex) {
    return {
        heading: '',
        image: '',
        paragraph: '',
        a: '',
        b: '',
        c: '',
        d: '',
        answer: 'a',
        score: (questionIndex + 1) * 100,
        answerParagraph: ''
    };
}

// Convert a Question (from normalizeQuiz) into the plain shape used here.
function toEditorQuestion(question) {
    return {
        heading: question.heading || '',
        image: question.image || '',
        paragraph: question.paragraph || '',
        a: question.a || '',
        b: question.b || '',
        c: question.c || '',
        d: question.d || '',
        answer: question.answer || 'a',
        score: question.score,
        answerParagraph: question.answerParagraph || ''
    };
}

function cloneEditorQuestion(question) {
    return { ...question };
}

function getEditorQuestionScore(question, questionIndex) {
    return normalizeEditorScore(question.score, questionIndex);
}

function normalizeEditorScore(value, questionIndex) {
    if (value === '' || value === null || value === undefined) {
        return (questionIndex + 1) * 100;
    }

    const score = Number(value);
    return Number.isFinite(score) ? score : (questionIndex + 1) * 100;
}

// ---------- View switching ----------

function openQuizEditor() {
    if (editorTopics.length === 0) {
        editorTopics.push(createEditorTopic());
    }

    hideElement(menuView);
    hideElement(controlsView);
    showElement(quizEditorView);
    showQuizBoard();

    setQuizEditorError('');
    setQuizEditorStatus('Select a question to edit it, or add a question at the bottom of a topic. Changes stay in this tab until exported.');
}

function closeQuizEditor() {
    clearQuestionEditor();
    hideElement(quizEditorView);
    showElement(controlsView);
    showElement(menuView);
    setQuizEditorError('');
}

function showQuizBoard() {
    clearQuestionEditor();
    showElement(quizEditorBoardView);
    renderQuizBoard();
}

function openQuestionEditor(topicIndex, questionIndex) {
    const question = editorTopics[topicIndex]?.questions[questionIndex];
    if (!question) {
        return;
    }

    clearQuestionEditor();
    editorQuestionContext = {
        topicIndex: topicIndex,
        questionIndex: questionIndex,
        draft: cloneEditorQuestion(question),
        previewTimeout: null
    };

    hideElement(quizEditorBoardView);
    showElement(quizEditorQuestionView);
    setQuizEditorError('');
    renderQuestionEditor();
}

function clearQuestionEditor() {
    if (editorQuestionContext) {
        clearTimeout(editorQuestionContext.previewTimeout);
    }

    editorQuestionContext = null;
    quizEditorQuestionView.onkeydown = null;
    hideElement(quizEditorQuestionView);
    quizEditorQuestionView.replaceChildren();
}

// ---------- Editor board ----------

function renderQuizBoard() {
    editorBoardTopics.replaceChildren();
    editorBoardQuestions.replaceChildren();
    editorBoardActions.replaceChildren();

    if (editorTopics.length === 0) {
        hideElement(editorBoardTable);
        showElement(quizEditorBoardEmpty);
        return;
    }

    showElement(editorBoardTable);
    hideElement(quizEditorBoardEmpty);

    const maxQuestions = Math.max(0, ...editorTopics.map(topic => topic.questions.length));
    const rowCount = Math.max(1, maxQuestions);

    editorBoardTable.style.setProperty('--editor-topic-count', editorTopics.length);
    editorBoardTable.style.setProperty('--editor-question-count', rowCount);

    const headerRow = document.createElement('tr');
    editorTopics.forEach((topic, topicIndex) => {
        headerRow.appendChild(buildEditorTopicHeader(topic, topicIndex));
    });
    editorBoardTopics.appendChild(headerRow);

    for (let questionIndex = 0; questionIndex < rowCount; questionIndex++) {
        const row = document.createElement('tr');

        editorTopics.forEach((topic, topicIndex) => {
            const cell = document.createElement('td');
            const question = topic.questions[questionIndex];

            if (question) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'editorBoardQuestionButton';
                button.textContent = String(getEditorQuestionScore(question, questionIndex));
                button.title = `Edit ${topic.name} for ${button.textContent}`;
                button.addEventListener('click', () => openQuestionEditor(topicIndex, questionIndex));
                cell.appendChild(button);
            } else {
                cell.className = 'editorBoardEmptyCell';
            }

            row.appendChild(cell);
        });

        editorBoardQuestions.appendChild(row);
    }

    const actionsRow = document.createElement('tr');
    editorTopics.forEach((topic, topicIndex) => {
        const cell = document.createElement('td');
        const addButton = document.createElement('button');
        addButton.type = 'button';
        addButton.className = 'editorAddQuestionButton';
        addButton.textContent = '+ Add Question';
        addButton.addEventListener('click', () => addEditorQuestion(topicIndex));
        cell.appendChild(addButton);
        actionsRow.appendChild(cell);
    });
    editorBoardActions.appendChild(actionsRow);
}

function buildEditorTopicHeader(topic, topicIndex) {
    const cell = document.createElement('th');
    cell.className = 'editorBoardTopicHeader';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'editorBoardTopicName';
    nameInput.placeholder = 'Topic name';
    nameInput.value = topic.name;
    nameInput.setAttribute('aria-label', `Topic ${topicIndex + 1} name`);
    nameInput.addEventListener('input', () => {
        topic.name = nameInput.value;
    });

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'editorTopicRemoveButton';
    removeButton.textContent = '×';
    removeButton.title = 'Remove topic';
    removeButton.setAttribute('aria-label', `Remove topic ${topicIndex + 1}`);
    removeButton.addEventListener('click', () => removeEditorTopic(topicIndex));

    cell.append(nameInput, removeButton);
    return cell;
}

function addEditorTopic() {
    editorTopics.push(createEditorTopic());
    setQuizEditorError('');
    renderQuizBoard();

    const topicInputs = editorBoardTopics.querySelectorAll('.editorBoardTopicName');
    const newestInput = topicInputs[topicInputs.length - 1];
    if (newestInput) {
        newestInput.focus();
        newestInput.select();
    }
}

function removeEditorTopic(topicIndex) {
    const topic = editorTopics[topicIndex];
    const topicName = topic.name.trim() || `Topic ${topicIndex + 1}`;

    if (!window.confirm(`Remove "${topicName}" and all of its questions?`)) {
        return;
    }

    editorTopics.splice(topicIndex, 1);
    setQuizEditorError('');
    setQuizEditorStatus('Topic removed.');
    renderQuizBoard();
}

function addEditorQuestion(topicIndex) {
    const topic = editorTopics[topicIndex];
    const previousQuestion = topic.questions[topic.questions.length - 1];
    const question = createEditorQuestion(topic.questions.length);

    question.score = previousQuestion
        ? getEditorQuestionScore(previousQuestion, topic.questions.length - 1) + 100
        : 100;

    topic.questions.push(question);
    setQuizEditorError('');
    openQuestionEditor(topicIndex, topic.questions.length - 1);
}

// ---------- Question editor ----------

function renderQuestionEditor() {
    const context = editorQuestionContext;
    if (!context) {
        return;
    }

    const draft = context.draft;
    const topic = editorTopics[context.topicIndex];

    quizEditorQuestionView.innerHTML = QUESTION_EDITOR_TEMPLATE;
    document.getElementById('editorQuestionTopicLabel').textContent = topic.name;

    const scoreInput = document.getElementById('editorQuestionScoreInput');
    scoreInput.value = draft.score;
    scoreInput.addEventListener('input', () => {
        draft.score = scoreInput.value;
    });

    const headingInput = document.getElementById('editorQuestionHeadingInput');
    headingInput.textContent = draft.heading || '';
    headingInput.addEventListener('input', () => {
        draft.heading = headingInput.textContent;
    });

    bindDraftInput(document.getElementById('editorQuestionParagraphInput'), 'paragraph');

    const answerParagraphInput = document.getElementById('editorQuestionAnswerParagraphInput');
    bindDraftInput(answerParagraphInput, 'answerParagraph');

    quizEditorQuestionView.querySelectorAll('.editorAnswerInput').forEach(input => {
        bindDraftInput(input, input.dataset.letter);
    });

    bindImageInput();
    bindCorrectAnswerMarkers();
    bindQuestionActions();
}

// Connect a normal input/textarea to a draft property.
function bindDraftInput(element, property) {
    const draft = editorQuestionContext.draft;
    element.value = draft[property] ?? '';
    element.addEventListener('input', () => {
        draft[property] = element.value;
    });
}

function bindImageInput() {
    const context = editorQuestionContext;
    const draft = context.draft;
    const imageInput = document.getElementById('editorQuestionImageInput');
    const imagePreview = document.getElementById('editorQuestionImagePreview');

    imageInput.value = draft.image || '';

    const refreshPreview = () => {
        context.previewTimeout = null;
        updateEditorImagePreview(imagePreview, imageInput.value);
    };

    imageInput.addEventListener('input', () => {
        draft.image = imageInput.value;
        clearTimeout(context.previewTimeout);
        context.previewTimeout = setTimeout(refreshPreview, IMAGE_PREVIEW_DELAY);
    });

    imageInput.addEventListener('change', () => {
        clearTimeout(context.previewTimeout);
        refreshPreview();
    });

    imagePreview.addEventListener('click', () => imageInput.focus());
    refreshPreview();
}

function bindCorrectAnswerMarkers() {
    const draft = editorQuestionContext.draft;
    const answerCells = Array.from(quizEditorQuestionView.querySelectorAll('#editorAnswerTable td'));
    const answerMarkers = Array.from(quizEditorQuestionView.querySelectorAll('.editorAnswerMarker'));

    function updateCorrectAnswerSelection() {
        answerCells.forEach(cell => {
            cell.classList.toggle('correctAnswer', cell.dataset.letter === draft.answer);
        });

        answerMarkers.forEach(marker => {
            const isCorrect = marker.dataset.letter === draft.answer;
            marker.classList.toggle('correct', isCorrect);
            marker.setAttribute('aria-pressed', String(isCorrect));
        });
    }

    answerMarkers.forEach(marker => {
        marker.addEventListener('click', () => {
            draft.answer = marker.dataset.letter;
            updateCorrectAnswerSelection();
        });
    });

    updateCorrectAnswerSelection();
}

function bindQuestionActions() {
    document.getElementById('saveQuestionButton').addEventListener('click', saveQuestionAndExit);
    document.getElementById('discardQuestionButton').addEventListener('click', discardQuestionAndExit);
    document.getElementById('deleteQuestionButton').addEventListener('click', deleteQuestion);

    quizEditorQuestionView.onkeydown = event => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            event.preventDefault();
            saveQuestionAndExit();
        }
    };
}

function updateEditorImagePreview(container, imageValue) {
    container.replaceChildren();
    container.classList.remove('editorImagePreviewError', 'editorImagePreviewEmpty');

    const imageSource = resolveImageSource(imageValue);
    if (!imageSource) {
        container.classList.add('editorImagePreviewEmpty');
        container.textContent = 'No image selected';
        return;
    }

    const loading = document.createElement('span');
    loading.textContent = 'Loading image...';
    container.appendChild(loading);

    const image = new Image();
    image.alt = 'Question image preview';
    image.onload = () => container.replaceChildren(image);
    image.onerror = () => {
        container.replaceChildren();
        container.classList.add('editorImagePreviewError');
        container.textContent = 'Image could not be loaded.';
    };
    image.src = imageSource;
}

function saveQuestionAndExit() {
    const context = editorQuestionContext;
    if (!context) {
        return;
    }

    context.draft.score = normalizeEditorScore(context.draft.score, context.questionIndex);
    editorTopics[context.topicIndex].questions[context.questionIndex] =
        cloneEditorQuestion(context.draft);

    setQuizEditorStatus('Question saved.');
    showQuizBoard();
}

function discardQuestionAndExit() {
    if (!editorQuestionContext) {
        return;
    }

    setQuizEditorStatus('Changes discarded.');
    showQuizBoard();
}

function deleteQuestion() {
    const context = editorQuestionContext;
    if (!context || !window.confirm('Delete this question?')) {
        return;
    }

    editorTopics[context.topicIndex].questions.splice(context.questionIndex, 1);
    setQuizEditorStatus('Question deleted.');
    showQuizBoard();
}

// ---------- Import / export ----------

function buildEditorQuiz() {
    if (editorTopics.length === 0) {
        throw new Error('Add at least one topic before exporting.');
    }

    const quiz = {};
    const topicNames = new Set();

    editorTopics.forEach((topic, topicIndex) => {
        const topicName = topic.name.trim();
        const topicLabel = topicName || `Topic ${topicIndex + 1}`;

        if (!topicName) {
            throw new Error(`Topic ${topicIndex + 1} needs a name.`);
        }

        const normalizedName = topicName.toLowerCase();
        if (topicNames.has(normalizedName)) {
            throw new Error(`There is more than one topic named "${topicName}".`);
        }
        topicNames.add(normalizedName);

        if (topic.questions.length === 0) {
            throw new Error(`"${topicLabel}" needs at least one question.`);
        }

        quiz[topicName] = topic.questions.map((question, questionIndex) => {
            const questionLabel = `"${topicLabel}", question ${questionIndex + 1}`;
            const choices = {};

            ANSWER_LETTERS.forEach(letter => {
                const choice = String(question[letter] || '').trim();
                if (!choice) {
                    throw new Error(`${questionLabel} needs choice ${letter.toUpperCase()}.`);
                }
                choices[letter] = choice;
            });

            let score = question.score;
            if (score === '' || score === null || score === undefined) {
                score = (questionIndex + 1) * 100;
            }
            score = Number(score);
            if (!Number.isFinite(score)) {
                throw new Error(`${questionLabel} has an invalid score.`);
            }

            const exportedQuestion = {
                heading: String(question.heading || '').trim(),
                image: String(question.image || '').trim(),
                paragraph: String(question.paragraph || '').trim(),
                a: choices.a,
                b: choices.b,
                c: choices.c,
                d: choices.d,
                answer: question.answer,
                score: score,
                answerParagraph: String(question.answerParagraph || '').trim()
            };

            if (!exportedQuestion.image) {
                delete exportedQuestion.image;
            }

            return exportedQuestion;
        });
    });

    return quiz;
}

function downloadEditorQuiz() {
    try {
        const quiz = buildEditorQuiz();
        const json = JSON.stringify(quiz, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = createEditorFileName(quiz);
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        setQuizEditorError('');
        setQuizEditorStatus('Quiz exported. Keep the JSON file safe and load it from the main menu when you want to play it.');
    } catch (error) {
        setQuizEditorStatus('');
        setQuizEditorError(error.message);
        quizEditorError.scrollIntoView({ block: 'nearest' });
    }
}

function createEditorFileName(quiz) {
    const firstTopic = Object.keys(quiz)[0] || 'custom-quiz';
    const slug = firstTopic
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${slug || 'custom-quiz'}-quiz.json`;
}

function loadQuizForEditing(event) {
    const input = event.target;
    const file = input.files[0];
    if (!file) {
        return;
    }

    readJsonFile(file, data => {
        editorTopics = normalizeQuiz(data).map(topic => ({
            name: topic.name,
            questions: topic.questions.map(toEditorQuestion)
        }));

        setQuizEditorError('');
        setQuizEditorStatus('Quiz loaded into the editor. Select a question to edit it, or add a new one.');
        showQuizBoard();
    }, error => {
        setQuizEditorError(formatJsonFileError(error));
    });

    input.value = '';
}

function setQuizEditorError(message) {
    quizEditorError.textContent = message || '';
}

function setQuizEditorStatus(message) {
    quizEditorStatus.textContent = message || '';
}

quizEditorFileInput.addEventListener('change', loadQuizForEditing);
