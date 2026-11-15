const quizEditorView = document.getElementById('quizEditorView');
const quizEditorTopicsElement = document.getElementById('quizEditorTopics');
const quizEditorError = document.getElementById('quizEditorError');
const quizEditorStatus = document.getElementById('quizEditorStatus');
const quizEditorFileInput = document.getElementById('quizEditorFileInput');

const EDITOR_ANSWER_LETTERS = ['a', 'b', 'c', 'd'];

let editorTopics = [];

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

function createEditorTopic() {
    return {
        name: 'New Topic',
        questions: [createEditorQuestion(0)]
    };
}

function openQuizEditor() {
    if (editorTopics.length === 0) {
        editorTopics.push(createEditorTopic());
    }

    document.getElementById('openingView').style.display = 'none';
    document.getElementById('controlsView').style.display = 'none';
    quizEditorView.style.display = 'flex';

    setQuizEditorError('');
    setQuizEditorStatus('Build your quiz here, then export it as JSON. Changes stay in this tab until exported. Images can be an images/ filename, a relative path, or a web URL.');
    renderQuizEditor();
}

function closeQuizEditor() {
    quizEditorView.style.display = 'none';
    document.getElementById('controlsView').style.display = '';
    document.getElementById('openingView').style.display = 'flex';
}

function addEditorTopic() {
    editorTopics.push({
        name: `Topic ${editorTopics.length + 1}`,
        questions: [createEditorQuestion(0)]
    });
    setQuizEditorError('');
    renderQuizEditor();
}

function removeEditorTopic(topicIndex) {
    editorTopics.splice(topicIndex, 1);
    setQuizEditorError('');
    renderQuizEditor();
}

function addEditorQuestion(topicIndex) {
    const topic = editorTopics[topicIndex];
    const previousQuestion = topic.questions[topic.questions.length - 1];
    const question = createEditorQuestion(topic.questions.length);

    const previousScore = Number(previousQuestion ? previousQuestion.score : NaN);
    question.score = Number.isFinite(previousScore)
        ? previousScore + 100
        : (topic.questions.length + 1) * 100;

    topic.questions.push(question);
    setQuizEditorError('');
    renderQuizEditor();
}

function removeEditorQuestion(topicIndex, questionIndex) {
    editorTopics[topicIndex].questions.splice(questionIndex, 1);
    setQuizEditorError('');
    renderQuizEditor();
}

function renderQuizEditor() {
    quizEditorTopicsElement.replaceChildren();

    if (editorTopics.length === 0) {
        const emptyState = document.createElement('p');
        emptyState.className = 'editorEmptyState';
        emptyState.textContent = 'No topics yet. Add a topic below to start building your quiz.';
        quizEditorTopicsElement.appendChild(emptyState);
        return;
    }

    editorTopics.forEach((topic, topicIndex) => {
        quizEditorTopicsElement.appendChild(buildEditorTopicCard(topic, topicIndex));
    });
}

function buildEditorTopicCard(topic, topicIndex) {
    const topicCard = document.createElement('section');
    topicCard.className = 'editorTopic';

    const header = document.createElement('div');
    header.className = 'editorTopicHeader';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'editorTopicName';
    nameInput.placeholder = 'Topic name';
    nameInput.value = topic.name;
    nameInput.setAttribute('aria-label', `Topic ${topicIndex + 1} name`);
    nameInput.addEventListener('input', () => {
        topic.name = nameInput.value;
    });

    const actions = document.createElement('div');
    actions.className = 'editorTopicActions';
    actions.appendChild(createEditorButton('+ Add Question', () => addEditorQuestion(topicIndex)));
    actions.appendChild(createEditorButton('Remove Topic', () => removeEditorTopic(topicIndex), 'editorDangerButton'));

    header.append(nameInput, actions);

    const questionList = document.createElement('div');
    questionList.className = 'editorQuestions';

    if (topic.questions.length === 0) {
        const emptyState = document.createElement('p');
        emptyState.className = 'editorEmptyState';
        emptyState.textContent = 'This topic has no questions yet.';
        questionList.appendChild(emptyState);
    }

    topic.questions.forEach((question, questionIndex) => {
        questionList.appendChild(buildEditorQuestionCard(question, topicIndex, questionIndex));
    });

    topicCard.append(header, questionList);
    return topicCard;
}

function buildEditorQuestionCard(question, topicIndex, questionIndex) {
    const questionCard = document.createElement('article');
    questionCard.className = 'editorQuestion';

    const header = document.createElement('div');
    header.className = 'editorQuestionHeader';

    const title = document.createElement('h3');
    title.textContent = `Question ${questionIndex + 1}`;

    const removeButton = createEditorButton(
        'Remove Question',
        () => removeEditorQuestion(topicIndex, questionIndex),
        'editorDangerButton'
    );

    header.append(title, removeButton);

    const fields = document.createElement('div');
    fields.className = 'editorFields';

    const headingInput = createEditorTextInput(question.heading, 'Question heading', value => {
        question.heading = value;
    });
    fields.appendChild(createEditorField('Heading', headingInput));

    const scoreInput = document.createElement('input');
    scoreInput.type = 'number';
    scoreInput.value = question.score;
    scoreInput.placeholder = '100';
    scoreInput.step = '10';
    scoreInput.addEventListener('input', () => {
        question.score = scoreInput.value;
    });
    fields.appendChild(createEditorField('Score', scoreInput));

    const imageInput = createEditorTextInput(
        question.image,
        'images/picture.png, ./images/picture.png, or https://...',
        value => {
            question.image = value;
        }
    );
    const imageField = createEditorField('Image (optional)', imageInput);

    const imagePreview = document.createElement('div');
    imagePreview.className = 'editorImagePreview';
    imageField.appendChild(imagePreview);
    fields.appendChild(imageField);

    let previewTimeout;
    imageInput.addEventListener('input', () => {
        clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => {
            updateEditorImagePreview(imagePreview, imageInput.value);
        }, 500);
    });
    imageInput.addEventListener('change', () => {
        clearTimeout(previewTimeout);
        updateEditorImagePreview(imagePreview, imageInput.value);
    });
    updateEditorImagePreview(imagePreview, question.image);

    const paragraphInput = createEditorTextarea(question.paragraph, 'The question the players will read', value => {
        question.paragraph = value;
    });
    fields.appendChild(createEditorField('Question text', paragraphInput, 'editorFieldWide'));

    const choices = document.createElement('div');
    choices.className = 'editorChoices';
    EDITOR_ANSWER_LETTERS.forEach(letter => {
        const choiceInput = createEditorTextInput(question[letter], `Choice ${letter.toUpperCase()}`, value => {
            question[letter] = value;
        });
        choices.appendChild(createEditorField(letter.toUpperCase(), choiceInput));
    });
    fields.appendChild(choices);

    const answerSelect = document.createElement('select');
    EDITOR_ANSWER_LETTERS.forEach(letter => {
        const option = document.createElement('option');
        option.value = letter;
        option.textContent = letter.toUpperCase();
        answerSelect.appendChild(option);
    });
    answerSelect.value = question.answer;
    answerSelect.addEventListener('change', () => {
        question.answer = answerSelect.value;
    });
    fields.appendChild(createEditorField('Correct answer', answerSelect));

    const answerParagraphInput = createEditorTextarea(
        question.answerParagraph,
        'Explanation shown after the question is answered',
        value => {
            question.answerParagraph = value;
        }
    );
    fields.appendChild(createEditorField('Answer explanation', answerParagraphInput, 'editorFieldWide'));

    questionCard.append(header, fields);
    return questionCard;
}

function createEditorButton(label, onClick, extraClass) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    if (extraClass) {
        button.classList.add(extraClass);
    }
    button.addEventListener('click', onClick);
    return button;
}

function createEditorField(labelText, input, extraClass) {
    const label = document.createElement('label');
    label.className = 'editorField';
    if (extraClass) {
        label.classList.add(extraClass);
    }

    const labelSpan = document.createElement('span');
    labelSpan.className = 'editorFieldLabel';
    labelSpan.textContent = labelText;

    label.append(labelSpan, input);
    return label;
}

function createEditorTextInput(value, placeholder, onInput) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value || '';
    input.placeholder = placeholder || '';
    input.addEventListener('input', () => onInput(input.value));
    return input;
}

function createEditorTextarea(value, placeholder, onInput) {
    const textarea = document.createElement('textarea');
    textarea.value = value || '';
    textarea.placeholder = placeholder || '';
    textarea.rows = 3;
    textarea.addEventListener('input', () => onInput(textarea.value));
    return textarea;
}

function updateEditorImagePreview(container, imageValue) {
    container.replaceChildren();
    container.classList.remove('editorImagePreviewError', 'editorImagePreviewEmpty');

    const imageSource = resolveImageSource(imageValue);
    if (!imageSource) {
        container.classList.add('editorImagePreviewEmpty');
        container.textContent = 'No image';
        return;
    }

    const loading = document.createElement('span');
    loading.textContent = 'Loading image...';
    container.appendChild(loading);

    const image = new Image();
    image.alt = 'Question image preview';
    image.onload = () => {
        container.replaceChildren(image);
    };
    image.onerror = () => {
        container.replaceChildren();
        container.classList.add('editorImagePreviewError');
        container.textContent = 'Image could not be loaded.';
    };
    image.src = imageSource;
}

function setQuizEditorError(message) {
    quizEditorError.textContent = message || '';
}

function setQuizEditorStatus(message) {
    quizEditorStatus.textContent = message || '';
}

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

            EDITOR_ANSWER_LETTERS.forEach(letter => {
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

    const reader = new FileReader();
    reader.onload = function (loadEvent) {
        try {
            const data = JSON.parse(loadEvent.target.result);
            const normalizedTopics = normalizeQuiz(data);

            editorTopics = normalizedTopics.map(topic => ({
                name: topic.name,
                questions: topic.questions.map(question => ({
                    heading: question.heading || '',
                    image: question.image || '',
                    paragraph: question.paragraph || '',
                    a: question.a,
                    b: question.b,
                    c: question.c,
                    d: question.d,
                    answer: question.answer,
                    score: question.score,
                    answerParagraph: question.answerParagraph || ''
                }))
            }));

            setQuizEditorError('');
            setQuizEditorStatus('Quiz loaded into the editor. Make your changes, then export it as JSON.');
            renderQuizEditor();
        } catch (error) {
            setQuizEditorError(error instanceof SyntaxError
                ? 'That file is not valid JSON.'
                : error.message);
        } finally {
            input.value = '';
        }
    };

    reader.onerror = function () {
        setQuizEditorError('The file could not be read.');
        input.value = '';
    };

    reader.readAsText(file);
}

quizEditorFileInput.addEventListener('change', loadQuizForEditing);
