const trickTableBody = document.querySelector("#trick-table-body");
const tableMessage = document.querySelector("#table-message");
const levelFilterOptions = document.querySelector("#level-filter-options");

export function displayTricks(
    tricks,
    selectedTrickIds,
    onSelectionChange,
    maximumSelections,
    currentMode
) {
    trickTableBody.innerHTML = "";

    if (tricks.length === 0) {
        tableMessage.textContent =
            "No tricks are available for this practice mode.";
        return;
    }

    tableMessage.textContent = "";

    tricks.forEach((trick) => {
        const row = document.createElement("tr");

        const selectCell = document.createElement("td");
        const checkbox = document.createElement("input");

        checkbox.type = "checkbox";
        checkbox.className = "trick-checkbox";
        checkbox.value = trick.id;
        checkbox.checked = selectedTrickIds.has(trick.id);

        const selectionLimitReached =
            selectedTrickIds.size >= maximumSelections;

        checkbox.disabled =
            selectionLimitReached &&
            !selectedTrickIds.has(trick.id);

        checkbox.setAttribute(
            "aria-label",
            `Select ${trick.name}`
        );

        checkbox.addEventListener("change", () => {
            onSelectionChange(trick, checkbox.checked);
        });

        selectCell.appendChild(checkbox);

        const levelCell = document.createElement("td");
        levelCell.textContent = trick.level;

        const numberCell = document.createElement("td");
        numberCell.textContent = trick.trickNumber;

        const nameCell = document.createElement("td");
        nameCell.textContent = trick.name;

        const pointsCell = document.createElement("td");
        pointsCell.textContent =
            currentMode === "finals"
                ? trick.finalsPoints
                : trick.points;

        row.append(
            selectCell,
            levelCell,
            numberCell,
            nameCell,
            pointsCell
        );

        trickTableBody.appendChild(row);
    });
}

export function displayLevelFilters(
    levels,
    selectedLevels,
    onLevelToggle
) {
    levelFilterOptions.innerHTML = "";

    levels.forEach((level) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "level-filter-button";
        button.textContent = `Level ${level}`;

        if (selectedLevels.has(level)) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {
            onLevelToggle(level);
        });

        levelFilterOptions.appendChild(button);
    });
}

export function showTableError(message) {
    trickTableBody.innerHTML = "";
    tableMessage.textContent = message;
}