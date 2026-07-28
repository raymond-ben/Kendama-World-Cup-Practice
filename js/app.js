import { loadTricks } from "./data.js";

import {
    displayTricks,
    displayLevelFilters,
    showTableError
} from "./ui.js";


/* --------------------------------------------------
   DOM elements
-------------------------------------------------- */

const homeScreen = document.querySelector("#home-screen");
const selectionScreen = document.querySelector("#selection-screen");
const practiceScreen = document.querySelector("#practice-screen");

const modeButtons = document.querySelectorAll(".mode-card");
const backHomeButton = document.querySelector("#back-home-button");

const selectionTitle = document.querySelector("#selection-title");
const selectionDescription = document.querySelector(
    "#selection-description"
);
const selectionCounter = document.querySelector("#selection-counter");
const startPracticeButton = document.querySelector(
    "#start-practice-button"
);
const clearSelectionButton = document.querySelector(
    "#clear-selection-button"
);

const practiceModeLabel = document.querySelector(
    "#practice-mode-label"
);
const practiceRoundTitle = document.querySelector(
    "#practice-round-title"
);
const practiceTimer = document.querySelector("#practice-timer");
const practiceMessage = document.querySelector(
    "#practice-message"
);
const practiceTrickList = document.querySelector(
    "#practice-trick-list"
);

const startTimerButton = document.querySelector(
    "#start-timer-button"
);
const nextRoundButton = document.querySelector(
    "#next-round-button"
);
const exitPracticeButton = document.querySelector(
    "#exit-practice-button"
);


/* --------------------------------------------------
   Application state
-------------------------------------------------- */

let currentMode = null;
let allTricks = [];

let selectedTrickIds = new Set();
let selectedLevels = new Set();

let preliminaryRoundOneIds = new Set();
let preliminaryRoundTwoIds = new Set();

let currentPracticeRound = 1;
let currentPracticeTricks = [];

let countdownInterval = null;
let roundTimerInterval = null;
let goTimeout = null;
let timerIsRunning = false;


/* --------------------------------------------------
   Screen navigation
-------------------------------------------------- */

function showScreen(screenToShow) {
    homeScreen.classList.remove("active");
    selectionScreen.classList.remove("active");
    practiceScreen.classList.remove("active");

    screenToShow.classList.add("active");
}


/* --------------------------------------------------
   Selection rules and counters
-------------------------------------------------- */

function getSelectionRules() {
    if (currentMode === "preliminary") {
        return {
            minimum: 10,
            maximum: 10
        };
    }

    if (currentMode === "finals") {
        return {
            minimum: 10,
            maximum: 30
        };
    }

    return {
        minimum: 0,
        maximum: 0
    };
}


function updateSelectionControls() {
    const rules = getSelectionRules();
    const selectedTotal = selectedTrickIds.size;

    if (currentMode === "preliminary") {
        selectionCounter.innerHTML = `
            <span>
                Round 1:
                <strong>
                    ${preliminaryRoundOneIds.size} / 5
                </strong>
            </span>

            <span>
                Round 2:
                <strong>
                    ${preliminaryRoundTwoIds.size} / 5
                </strong>
            </span>
        `;
    }

    if (currentMode === "finals") {
        selectionCounter.innerHTML = `
            Selected:
            <strong>${selectedTotal}</strong>
            / ${rules.maximum}
            (Minimum ${rules.minimum})
        `;
    }

    let validSelection = false;

    if (currentMode === "preliminary") {
        validSelection =
            preliminaryRoundOneIds.size === 5 &&
            preliminaryRoundTwoIds.size === 5;
    }

    if (currentMode === "finals") {
        validSelection =
            selectedTotal >= rules.minimum &&
            selectedTotal <= rules.maximum;
    }

    startPracticeButton.disabled = !validSelection;
}


/* --------------------------------------------------
   Trick filtering
-------------------------------------------------- */

function getTricksForMode(mode) {
    if (mode === "preliminary") {
        return allTricks;
    }

    if (mode === "finals") {
        return allTricks.filter((trick) => trick.finals);
    }

    return [];
}


function getVisibleTricks() {
    const availableTricks = getTricksForMode(currentMode);

    if (selectedLevels.size === 0) {
        return availableTricks;
    }

    return availableTricks.filter((trick) =>
        selectedLevels.has(trick.level)
    );
}


function handleLevelToggle(level) {
    if (selectedLevels.has(level)) {
        selectedLevels.delete(level);
    } else {
        selectedLevels.add(level);
    }

    renderSelectionScreen();
}


/* --------------------------------------------------
   Trick selection
-------------------------------------------------- */

function handleTrickSelection(trick, isSelected) {
    const rules = getSelectionRules();

    if (
        isSelected &&
        selectedTrickIds.size >= rules.maximum
    ) {
        return;
    }

    if (currentMode === "preliminary") {
        if (isSelected) {
            selectedTrickIds.add(trick.id);

            if (preliminaryRoundOneIds.size < 5) {
                preliminaryRoundOneIds.add(trick.id);
            } else if (preliminaryRoundTwoIds.size < 5) {
                preliminaryRoundTwoIds.add(trick.id);
            }
        } else {
            selectedTrickIds.delete(trick.id);
            preliminaryRoundOneIds.delete(trick.id);
            preliminaryRoundTwoIds.delete(trick.id);
        }
    }

    if (currentMode === "finals") {
        if (isSelected) {
            selectedTrickIds.add(trick.id);
        } else {
            selectedTrickIds.delete(trick.id);
        }
    }

    renderSelectionScreen();
}


function renderSelectionScreen() {
    const rules = getSelectionRules();
    const availableTricks = getTricksForMode(currentMode);
    const visibleTricks = getVisibleTricks();

    const levels = [
        ...new Set(
            availableTricks.map((trick) => trick.level)
        )
    ].sort((a, b) => a - b);

    displayLevelFilters(
        levels,
        selectedLevels,
        handleLevelToggle
    );

    displayTricks(
        visibleTricks,
        selectedTrickIds,
        handleTrickSelection,
        rules.maximum,
        currentMode
    );

    updateSelectionControls();
}


/* --------------------------------------------------
   Selection screen setup
-------------------------------------------------- */

function openSelectionScreen(mode) {
    clearPracticeTimers();

    currentMode = mode;

    selectedTrickIds.clear();
    selectedLevels.clear();

    preliminaryRoundOneIds.clear();
    preliminaryRoundTwoIds.clear();

    if (mode === "preliminary") {
        selectionTitle.textContent =
            "Preliminary Round Practice";

        selectionDescription.textContent =
            "Select five tricks for Round 1 and five tricks for Round 2.";
    }

    if (mode === "finals") {
        selectionTitle.textContent =
            "Finals Practice";

        selectionDescription.textContent =
            "Select between 10 and 30 tricks for your three-minute round.";
    }

    renderSelectionScreen();
    showScreen(selectionScreen);
}


function returnHome() {
    clearPracticeTimers();

    currentMode = null;

    selectedTrickIds.clear();
    selectedLevels.clear();

    preliminaryRoundOneIds.clear();
    preliminaryRoundTwoIds.clear();

    startPracticeButton.disabled = true;

    showScreen(homeScreen);
}
function clearSelections() {
    selectedTrickIds.clear();

    preliminaryRoundOneIds.clear();
    preliminaryRoundTwoIds.clear();

    renderSelectionScreen();
}

/* --------------------------------------------------
   Practice trick helpers
-------------------------------------------------- */

function getTricksFromIds(trickIds) {
    return [...trickIds]
        .map((trickId) =>
            allTricks.find((trick) => trick.id === trickId)
        )
        .filter(Boolean);
}


function displayPracticeTricks(tricks) {
    practiceTrickList.innerHTML = "";

    tricks.forEach((trick) => {
        const item = document.createElement("li");
        item.className = "practice-trick-item";

        const name = document.createElement("span");
        name.className = "practice-trick-name";
        name.textContent = trick.name;

        const level = document.createElement("span");
        level.className = "practice-trick-level";
        level.textContent = `Level ${trick.level}`;

        item.append(name, level);
        practiceTrickList.appendChild(item);
    });
}


/* --------------------------------------------------
   Timer helpers
-------------------------------------------------- */

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${seconds
        .toString()
        .padStart(2, "0")}`;
}


function clearPracticeTimers() {
    if (countdownInterval !== null) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    if (roundTimerInterval !== null) {
        clearInterval(roundTimerInterval);
        roundTimerInterval = null;
    }

    if (goTimeout !== null) {
        clearTimeout(goTimeout);
        goTimeout = null;
    }

    timerIsRunning = false;
}


/* --------------------------------------------------
   Five-second preparation countdown
-------------------------------------------------- */

function startPreparationCountdown() {
    if (timerIsRunning) {
        return;
    }

    clearPracticeTimers();

    timerIsRunning = true;

    startTimerButton.disabled = true;
    exitPracticeButton.disabled = true;

    practiceTimer.classList.add("countdown");
    practiceTimer.classList.remove("finished");

    practiceMessage.textContent = "Get ready!";

    let countdownSeconds = 5;

    practiceTimer.textContent = countdownSeconds;

    countdownInterval = setInterval(() => {
        countdownSeconds -= 1;

        if (countdownSeconds > 0) {
            practiceTimer.textContent = countdownSeconds;
            return;
        }

        clearInterval(countdownInterval);
        countdownInterval = null;

        practiceTimer.textContent = "GO!";
        practiceMessage.textContent = "Round in progress.";

        goTimeout = window.setTimeout(() => {
            goTimeout = null;
            startRoundTimer();
        }, 700);
    }, 1000);
}


/* --------------------------------------------------
   Three-minute round timer
-------------------------------------------------- */

function startRoundTimer() {
    let remainingSeconds = 10;

    practiceTimer.classList.remove(
        "countdown",
        "finished"
    );

    practiceTimer.textContent = formatTime(remainingSeconds);

    roundTimerInterval = setInterval(() => {
        remainingSeconds -= 1;

        practiceTimer.textContent =
            formatTime(remainingSeconds);

        if (remainingSeconds <= 0) {
            finishPracticeRound();
        }
    }, 1000);
}


/* --------------------------------------------------
   End-of-round behavior
-------------------------------------------------- */

function finishPracticeRound() {
    if (roundTimerInterval !== null) {
        clearInterval(roundTimerInterval);
        roundTimerInterval = null;
    }

    timerIsRunning = false;

    practiceTimer.textContent = "Time!";
    practiceTimer.classList.add("finished");

    exitPracticeButton.disabled = false;

    if (
        currentMode === "preliminary" &&
        currentPracticeRound === 1
    ) {
        practiceMessage.textContent =
            "Round 1 complete. Continue when you are ready for Round 2.";

        startTimerButton.classList.add("hidden");
        nextRoundButton.classList.remove("hidden");

        return;
    }

    if (
        currentMode === "preliminary" &&
        currentPracticeRound === 2
    ) {
        practiceMessage.textContent =
            "Preliminary practice complete.";

        startTimerButton.classList.add("hidden");
        nextRoundButton.classList.add("hidden");

        return;
    }

    practiceMessage.textContent =
        "Finals practice complete.";

    startTimerButton.classList.add("hidden");
    nextRoundButton.classList.add("hidden");
}


/* --------------------------------------------------
   Practice screen setup
-------------------------------------------------- */

function openPracticeRound(roundNumber, tricks) {
    clearPracticeTimers();

    currentPracticeRound = roundNumber;
    currentPracticeTricks = tricks;

    practiceTimer.textContent = "3:00";
    practiceTimer.classList.remove(
        "countdown",
        "finished"
    );

    startTimerButton.disabled = false;
    exitPracticeButton.disabled = false;

    startTimerButton.classList.remove("hidden");
    nextRoundButton.classList.add("hidden");

    if (currentMode === "preliminary") {
        practiceModeLabel.textContent =
            "Preliminary Practice";

        practiceRoundTitle.textContent =
            `Round ${roundNumber}`;

        startTimerButton.textContent =
            `Start Round ${roundNumber}`;
    }

    if (currentMode === "finals") {
        practiceModeLabel.textContent =
            "Finals Practice";

        practiceRoundTitle.textContent =
            "Selected Tricks";

        startTimerButton.textContent =
            "Start Timer";
    }

    practiceMessage.textContent =
        "Review your tricks, then start the timer when ready.";

    displayPracticeTricks(currentPracticeTricks);
    showScreen(practiceScreen);
}


/* --------------------------------------------------
   Event listeners
-------------------------------------------------- */

modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        openSelectionScreen(button.dataset.mode);
    });
});


backHomeButton.addEventListener(
    "click",
    returnHome
);

clearSelectionButton.addEventListener(
    "click",
    clearSelections
);

startPracticeButton.addEventListener("click", () => {
    if (currentMode === "preliminary") {
        const roundOneTricks = getTricksFromIds(
            preliminaryRoundOneIds
        );

        openPracticeRound(1, roundOneTricks);
        return;
    }

    const finalsTricks = getTricksFromIds(
        selectedTrickIds
    );

    openPracticeRound(1, finalsTricks);
});


startTimerButton.addEventListener(
    "click",
    startPreparationCountdown
);


nextRoundButton.addEventListener("click", () => {
    const roundTwoTricks = getTricksFromIds(
        preliminaryRoundTwoIds
    );

    openPracticeRound(2, roundTwoTricks);
});


exitPracticeButton.addEventListener("click", () => {
    clearPracticeTimers();

    renderSelectionScreen();
    showScreen(selectionScreen);
});


/* --------------------------------------------------
   Start application
-------------------------------------------------- */

async function startApp() {
    try {
        allTricks = await loadTricks();
    } catch (error) {
        console.error(error);

        showTableError(
            "There was a problem loading the trick database."
        );
    }
}


startApp();