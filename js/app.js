import { loadTricks } from "./data.js";

import {
    displayTricks,
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
            Selected:
            <strong id="selected-count">
                ${selectedTotal}
            </strong>
            / ${rules.maximum}
        `;
    }

    if (currentMode === "finals") {
        selectionCounter.innerHTML = `
            Selected:
            <strong id="selected-count">${selectedTotal}</strong>
            / ${rules.maximum} (Minimum ${rules.minimum})
        `;
    }

        const validSelection =
            selectedTotal >= rules.minimum &&
            selectedTotal <= rules.maximum;

        startPracticeButton.disabled = !validSelection;
    }

let currentMode = null;
let allTricks = [];
let selectedTrickIds = new Set();


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


function handleTrickSelection(trick, isSelected) {
    const rules = getSelectionRules();

    if (
        isSelected &&
        selectedTrickIds.size >= rules.maximum
    ) {
        return;
    }

    if (isSelected) {
        selectedTrickIds.add(trick.id);
    } else {
        selectedTrickIds.delete(trick.id);
    }

    const availableTricks = getTricksForMode(currentMode);

    displayTricks(
        availableTricks,
        selectedTrickIds,
        handleTrickSelection,
        rules.maximum
    );

    updateSelectionControls();
}


function openSelectionScreen(mode) {
    currentMode = mode;
    selectedTrickIds.clear();

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

    const availableTricks = getTricksForMode(mode);

    const rules = getSelectionRules();

    displayTricks(
        availableTricks,
        selectedTrickIds,
        handleTrickSelection,
        rules.maximum
    );

    updateSelectionControls();
    showScreen(selectionScreen);
}


function returnHome() {
    currentMode = null;
    selectedTrickIds.clear();
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
    const selectedTricks = allTricks.filter((trick) =>
        selectedTrickIds.has(trick.id)
    );

    console.log("Starting practice with:", selectedTricks);
});