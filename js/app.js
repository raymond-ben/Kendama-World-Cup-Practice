import { loadTricks } from "./data.js";

import {
    displayTricks,
    displayLevelFilters,
    showTableError
} from "./ui.js";


const homeScreen = document.querySelector("#home-screen");
const selectionScreen = document.querySelector("#selection-screen");

const modeButtons = document.querySelectorAll(".mode-card");
const backHomeButton = document.querySelector("#back-home-button");

const selectionTitle = document.querySelector("#selection-title");
const selectionDescription = document.querySelector("#selection-description");

const selectionCounter = document.querySelector("#selection-counter");
const startPracticeButton = document.querySelector("#start-practice-button");

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
                <strong>${preliminaryRoundOneIds.size} / 5</strong>
             </span>

            <span>
                Round 2:
                <strong>${preliminaryRoundTwoIds.size} / 5</strong>
            </span>
        `;
    }

    if (currentMode === "finals") {
        selectionCounter.innerHTML = `
            Selected:
            <strong id="selected-count">${selectedTotal}</strong>
            / ${rules.maximum} (Minimum ${rules.minimum})
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

let currentMode = null;
let allTricks = [];
let selectedTrickIds = new Set();
let selectedLevels = new Set();

let preliminaryRoundOneIds = new Set();
let preliminaryRoundTwoIds = new Set();


function showScreen(screenToShow) {
    homeScreen.classList.remove("active");
    selectionScreen.classList.remove("active");

    screenToShow.classList.add("active");
}


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
            } else {
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


function openSelectionScreen(mode) {
    currentMode = mode;
    selectedTrickIds.clear();
    selectedLevels.clear();
    preliminaryRoundOneIds.clear();
    preliminaryRoundTwoIds.clear();

    if (mode === "preliminary") {
        selectionTitle.textContent =
            "Preliminary Round Practice";

        selectionDescription.textContent =
            "Select exactly 10 tricks for your three-minute round.";
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
    currentMode = null;
    selectedTrickIds.clear();
    selectedLevels.clear();
    preliminaryRoundOneIds.clear();
    preliminaryRoundTwoIds.clear();

   startPracticeButton.disabled = true;

    showScreen(homeScreen);
}


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


modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        openSelectionScreen(button.dataset.mode);
    });
});


backHomeButton.addEventListener("click", returnHome);


startApp();

startPracticeButton.addEventListener("click", () => {
    if (currentMode === "preliminary") {
        const roundOneTricks = [...preliminaryRoundOneIds].map(
            (trickId) =>
                allTricks.find((trick) => trick.id === trickId)
        );

        const roundTwoTricks = [...preliminaryRoundTwoIds].map(
            (trickId) =>
                allTricks.find((trick) => trick.id === trickId)
        );

        console.log("Round 1:", roundOneTricks);
        console.log("Round 2:", roundTwoTricks);

        return;
    }

    const selectedTricks = allTricks.filter((trick) =>
        selectedTrickIds.has(trick.id)
    );

    console.log("Finals:", selectedTricks);
});