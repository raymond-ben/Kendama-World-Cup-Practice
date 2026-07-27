import { loadTricks } from "./data.js";

import {
    displayTricks,
    updateSelectedCount,
    showTableError
} from "./ui.js";


const homeScreen = document.querySelector("#home-screen");
const selectionScreen = document.querySelector("#selection-screen");

const modeButtons = document.querySelectorAll(".mode-card");
const backHomeButton = document.querySelector("#back-home-button");

const selectionTitle = document.querySelector("#selection-title");
const selectionDescription = document.querySelector(
    "#selection-description"
);


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
        return allTricks.filter((trick) => trick.qualifier);
    }

    if (mode === "finals") {
        return allTricks.filter((trick) => trick.finals);
    }

    return [];
}


function handleTrickSelection(trick, isSelected) {
    if (isSelected) {
        selectedTrickIds.add(trick.id);
    } else {
        selectedTrickIds.delete(trick.id);
    }

    updateSelectedCount(selectedTrickIds.size);
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

    displayTricks(
        availableTricks,
        selectedTrickIds,
        handleTrickSelection
    );

    updateSelectedCount(0);
    showScreen(selectionScreen);
}


function returnHome() {
    currentMode = null;
    selectedTrickIds.clear();
    updateSelectedCount(0);

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