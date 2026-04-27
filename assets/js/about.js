/*
 * GRACE M. STEELE - about.js
 * TIMBUKTU LLC, 2026
 *
 * Handles all interactivity for pages/about.html.
 *
 * HOW TO CUSTOMIZE
 * ----------------
 * Quiz questions:   Edit the QUIZ_DATA array below.
 * Quiz results:     Edit the QUIZ_RESULTS object below.
 * Word scramble:    Edit the WORD_LIST array below.
 *
 * Sections
 * --------
 * 1. Gallery Lightbox
 * 2. Quiz
 * 3. Word Scramble Game
 */


(function () {
    'use strict';


    /* ============================================================
       1. GALLERY LIGHTBOX
       ============================================================
       Clicking any .gallery-item opens the lightbox with the full
       image and its data-caption attribute as the caption text.
       Escape key and clicking outside the image close the lightbox.
       ============================================================ */

    var lightbox        = document.getElementById('lightbox');
    var lightboxImg     = document.getElementById('lightbox-img');
    var lightboxCaption = document.getElementById('lightbox-caption');
    var lightboxClose   = document.getElementById('lightbox-close');
    var galleryItems    = document.querySelectorAll('.gallery-item');

    function openLightbox(imgSrc, imgAlt, caption) {
        if (!lightbox || !lightboxImg) { return; }
        lightboxImg.src         = imgSrc;
        lightboxImg.alt         = imgAlt || '';
        lightboxCaption.textContent = caption || '';
        lightbox.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
        lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightbox) { return; }
        lightbox.setAttribute('hidden', '');
        lightboxImg.src = '';
        document.body.style.overflow = '';
    }

    galleryItems.forEach(function (item) {
        item.addEventListener('click', function () {
            var img     = item.querySelector('.gallery-item__img');
            var caption = item.getAttribute('data-caption') || '';
            if (img) {
                openLightbox(img.src, img.alt, caption);
            }
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) { closeLightbox(); }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox && !lightbox.hasAttribute('hidden')) {
            closeLightbox();
        }
    });


    /* ============================================================
       2. QUIZ
       ============================================================
       Edit QUIZ_DATA to change questions and answers.
       Each answer object has a "value" key that maps to a result
       in QUIZ_RESULTS. The result with the most matching values wins.
       ============================================================ */

    /*
     * QUIZ DATA
     * ---------
     * Each question has:
     *   q        - The question text
     *   answers  - Array of { text, value } objects
     *              value maps to a key in QUIZ_RESULTS
     */
    var QUIZ_DATA = [
        {
            q: '[Input content here]',
            answers: [
                { text: '[Input content here]', value: 'fiction'    },
                { text: '[Input content here]', value: 'nonfiction' },
                { text: '[Input content here]', value: 'fiction'    },
                { text: '[Input content here]', value: 'nonfiction' }
            ]
        },
        {
            q: '[Input content here]',
            answers: [
                { text: '[Input content here]', value: 'fiction'    },
                { text: '[Input content here]', value: 'nonfiction' },
                { text: '[Input content here]', value: 'fiction'    },
                { text: '[Input content here]', value: 'nonfiction' }
            ]
        },
        {
            q: '[Input content here]',
            answers: [
                { text: '[Input content here]', value: 'fiction'    },
                { text: '[Input content here]', value: 'nonfiction' },
                { text: '[Input content here]', value: 'fiction'    },
                { text: '[Input content here]', value: 'nonfiction' }
            ]
        },
        {
            q: '[Input content here]',
            answers: [
                { text: '[Input content here]', value: 'fiction'    },
                { text: '[Input content here]', value: 'nonfiction' },
                { text: '[Input content here]', value: 'fiction'    },
                { text: '[Input content here]', value: 'nonfiction' }
            ]
        }
    ];

    /*
     * QUIZ RESULTS
     * ------------
     * Keys must match the "value" strings used in QUIZ_DATA above.
     * Each result has:
     *   title  - The work title or category name shown to the user
     *   desc   - A short description of why this is their match
     *   link   - Optional href for the Read It button (leave as portfolio.html if unsure)
     */
    var QUIZ_RESULTS = {
        fiction: {
            title: '[Input content here]',
            desc:  '[Input content here]'
        },
        nonfiction: {
            title: '[Input content here]',
            desc:  '[Input content here]'
        }
    };

    /* Quiz state */
    var quizCurrentIndex = 0;
    var quizScores       = {};

    /* Quiz elements */
    var quiz            = document.getElementById('quiz');
    var quizStep        = document.getElementById('quiz-step');
    var quizQuestion    = document.getElementById('quiz-question');
    var quizAnswers     = document.getElementById('quiz-answers');
    var quizProgressBar = document.getElementById('quiz-progress-bar');
    var quizQuestionWrap = document.getElementById('quiz-question-wrap');
    var quizResult      = document.getElementById('quiz-result');
    var quizResultTitle = document.getElementById('quiz-result-title');
    var quizResultDesc  = document.getElementById('quiz-result-desc');
    var quizRestart     = document.getElementById('quiz-restart');

    function quizRenderQuestion(index) {
        if (!QUIZ_DATA[index]) { return; }

        var data     = QUIZ_DATA[index];
        var total    = QUIZ_DATA.length;
        var progress = Math.round(((index) / total) * 100);

        if (quizStep)        { quizStep.textContent = 'Question ' + (index + 1) + ' of ' + total; }
        if (quizQuestion)    { quizQuestion.textContent = data.q; }
        if (quizProgressBar) {
            quizProgressBar.style.width = progress + '%';
            quizProgressBar.setAttribute('aria-valuenow', progress);
        }

        /* Clear and rebuild answer buttons */
        if (quizAnswers) {
            quizAnswers.innerHTML = '';
            data.answers.forEach(function (answer) {
                var btn = document.createElement('button');
                btn.className   = 'quiz__answer';
                btn.type        = 'button';
                btn.textContent = answer.text;
                btn.setAttribute('data-value', answer.value);
                btn.addEventListener('click', function () {
                    quizSelectAnswer(answer.value, btn);
                });
                quizAnswers.appendChild(btn);
            });
        }
    }

    function quizSelectAnswer(value, btn) {
        /* Highlight selected */
        var allBtns = quizAnswers ? quizAnswers.querySelectorAll('.quiz__answer') : [];
        allBtns.forEach(function (b) { b.classList.remove('is-selected'); b.disabled = true; });
        btn.classList.add('is-selected');

        /* Tally score */
        quizScores[value] = (quizScores[value] || 0) + 1;

        /* Short delay then advance */
        setTimeout(function () {
            quizCurrentIndex++;
            if (quizCurrentIndex < QUIZ_DATA.length) {
                quizRenderQuestion(quizCurrentIndex);
            } else {
                quizShowResult();
            }
        }, 420);
    }

    function quizShowResult() {
        /* Find the key with the highest score */
        var winner    = null;
        var topScore  = -1;

        Object.keys(quizScores).forEach(function (key) {
            if (quizScores[key] > topScore) {
                topScore = quizScores[key];
                winner   = key;
            }
        });

        var result = QUIZ_RESULTS[winner] || { title: '[Input content here]', desc: '[Input content here]' };

        if (quizProgressBar) {
            quizProgressBar.style.width = '100%';
            quizProgressBar.setAttribute('aria-valuenow', 100);
        }

        if (quizResultTitle) { quizResultTitle.textContent = result.title; }
        if (quizResultDesc)  { quizResultDesc.textContent  = result.desc;  }

        if (quizQuestionWrap) { quizQuestionWrap.setAttribute('hidden', ''); }
        if (quizResult)       { quizResult.removeAttribute('hidden'); }
    }

    function quizReset() {
        quizCurrentIndex = 0;
        quizScores       = {};

        if (quizProgressBar) {
            quizProgressBar.style.width = '0%';
            quizProgressBar.setAttribute('aria-valuenow', 0);
        }

        if (quizResult)       { quizResult.setAttribute('hidden', ''); }
        if (quizQuestionWrap) { quizQuestionWrap.removeAttribute('hidden'); }

        quizRenderQuestion(0);
    }

    if (quizRestart) {
        quizRestart.addEventListener('click', quizReset);
    }

    /* Initialize quiz on load */
    if (quiz) {
        quizReset();
    }


    /* ============================================================
       3. WORD SCRAMBLE GAME
       ============================================================
       Edit WORD_LIST to add, remove, or change words and hints.
       Each entry has:
         word  - The correct answer (case-insensitive check)
         hint  - The clue shown above the scrambled letters
       ============================================================ */

    var WORD_LIST = [
        { word: '[Input content here]', hint: 'Hint: [Input content here]' },
        { word: '[Input content here]', hint: 'Hint: [Input content here]' },
        { word: '[Input content here]', hint: 'Hint: [Input content here]' },
        { word: '[Input content here]', hint: 'Hint: [Input content here]' },
        { word: '[Input content here]', hint: 'Hint: [Input content here]' },
        { word: '[Input content here]', hint: 'Hint: [Input content here]' },
        { word: '[Input content here]', hint: 'Hint: [Input content here]' },
        { word: '[Input content here]', hint: 'Hint: [Input content here]' }
    ];

    /* Game state */
    var gameScore       = 0;
    var gameCurrentWord = null;

    /* Game elements */
    var gameScrambled = document.getElementById('game-scrambled');
    var gameClue      = document.getElementById('game-clue');
    var gameInput     = document.getElementById('game-input');
    var gameSubmit    = document.getElementById('game-submit');
    var gameFeedback  = document.getElementById('game-feedback');
    var gameSkip      = document.getElementById('game-skip');
    var gameScoreEl   = document.getElementById('game-score');

    /* Shuffle a string's characters */
    function scramble(word) {
        var letters = word.split('');
        var attempts = 0;
        var shuffled;

        do {
            for (var i = letters.length - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = letters[i];
                letters[i] = letters[j];
                letters[j] = tmp;
            }
            shuffled = letters.join('');
            attempts++;
        } while (shuffled === word && attempts < 20);

        return shuffled;
    }

    /* Pick a random word from the list */
    function gamePickWord() {
        var entry = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
        gameCurrentWord = entry;

        if (gameScrambled) {
            gameScrambled.textContent = scramble(entry.word).toUpperCase();
        }

        if (gameClue) {
            gameClue.textContent = entry.hint;
        }

        if (gameInput) {
            gameInput.value = '';
            gameInput.focus();
        }

        setFeedback('', '');
    }

    function setFeedback(text, type) {
        if (!gameFeedback) { return; }
        gameFeedback.textContent = text;
        gameFeedback.classList.remove('is-correct', 'is-wrong');
        if (type) { gameFeedback.classList.add(type); }
    }

    function gameCheckAnswer() {
        if (!gameCurrentWord || !gameInput) { return; }

        var guess   = gameInput.value.trim().toLowerCase();
        var correct = gameCurrentWord.word.toLowerCase();

        if (!guess) { return; }

        if (guess === correct) {
            gameScore++;
            if (gameScoreEl) { gameScoreEl.textContent = gameScore; }
            setFeedback('Correct!', 'is-correct');
            setTimeout(gamePickWord, 900);
        } else {
            setFeedback('Not quite, try again.', 'is-wrong');
            gameInput.select();
        }
    }

    if (gameSubmit) {
        gameSubmit.addEventListener('click', gameCheckAnswer);
    }

    if (gameInput) {
        gameInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { gameCheckAnswer(); }
        });
    }

    if (gameSkip) {
        gameSkip.addEventListener('click', function () {
            setFeedback('The word was: ' + (gameCurrentWord ? gameCurrentWord.word.toUpperCase() : ''), 'is-wrong');
            setTimeout(gamePickWord, 1100);
        });
    }

    /* Initialize game on load */
    if (document.getElementById('word-game')) {
        gamePickWord();
    }


}());