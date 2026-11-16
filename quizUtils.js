// Shared quiz helpers used by both the game (script.js) and the quiz editor
// (quizEditor.js). Loaded with defer, before either of those scripts.

const ANSWER_LETTERS = ['a', 'b', 'c', 'd'];

// Fallback images used when a question image cannot be loaded. A "dicebag"
// approach is used: each image is drawn once in random order until all have
// been used, then the bag is refilled and shuffled draws continue.
const FALLBACK_IMAGE_SOURCES = ['images/1.jpg', 'images/2.jpg', 'images/3.jpg'];
let fallbackImageDicebag = [];

function drawFallbackImageSource() {
    if (fallbackImageDicebag.length === 0) {
        fallbackImageDicebag = FALLBACK_IMAGE_SOURCES.slice();
    }

    const index = Math.floor(Math.random() * fallbackImageDicebag.length);
    return fallbackImageDicebag.splice(index, 1)[0];
}

// Set an image source with a random fallback if loading fails. The fallback is
// attempted once to avoid an infinite error loop if the fallback is unavailable.
function setImageWithFallback(imageElement, source) {
    imageElement.onerror = () => {
        imageElement.onerror = null;
        imageElement.src = drawFallbackImageSource();
    };
    imageElement.src = source;
}

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

// Read a user-selected JSON file and hand back the parsed data. Parse errors
// and validation errors are both reported through the same callback.
function readJsonFile(file, onSuccess, onError) {
    const reader = new FileReader();

    reader.onload = event => {
        let data;
        try {
            data = JSON.parse(event.target.result);
        } catch (error) {
            onError(error);
            return;
        }

        try {
            onSuccess(data);
        } catch (error) {
            onError(error);
        }
    };

    reader.onerror = () => onError(new Error('The file could not be read.'));
    reader.readAsText(file);
}

function formatJsonFileError(error) {
    return error instanceof SyntaxError
        ? 'That file is not valid JSON.'
        : error.message;
}

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
