// Global 

let items = []; // init
let comparisonsMade = 0; // init
let sortedItems = []; // init
let currentComparison = null; // init
let history = []; // prev states
let left, right; // binary search bounds
let currentItem = null; // self explanitory
let sortingFinished = false; // finished sort flag

// Calculate the estimated max needed comparisons
function calculateBinaryInsertionComparisons(numItems) {
    return Math.floor(numItems * Math.log2(numItems));
}

// Starts the process
function sortAlgo() {
    const inputText = document.getElementById('man-item-input').value;
    items = [...new Set(inputText.split('\n').filter(item => item.trim() !== ''))]; // gets unique  items
    sortedItems = [];  // clears list

    comparisonsMade = 0;
    history = [];
    currentItem = null;
    sortingFinished = false; // clears flag

    const numItems = items.length;
    const maxComparisons = calculateBinaryInsertionComparisons(numItems);

    updateDisplay(numItems, maxComparisons);

    startInsertion();
}

// Start the insertion process
function startInsertion() {
    if (items.length === 0) {
        finishSorting();
        return;
    }

    currentItem = items.shift();
    binaryInsert(currentItem);
}

// binary insertion
function binaryInsert(item) {
    if (sortedItems.length === 0) {
        sortedItems.push(item);
        startInsertion();
        return;
    }

    left = 0;
    right = sortedItems.length - 1;
    compareNextItem(item);
}

// Compares the next item
function compareNextItem(item) {
    if (left > right) {
        sortedItems.splice(left, 0, item);
        startInsertion();
        return;
    }

    const mid = Math.floor((left + right) / 2);
    currentComparison = [item, sortedItems[mid]];

    const comparisonInterface = document.getElementById('comparisoninterface');
    comparisonInterface.innerHTML = `
        <h3>Which item do you prefer?</h3>
        <button class="comparison" onclick="compareItems('${item}')" id="leftButton">${item}</button>
        <button class="comparison" onclick="compareItems('${sortedItems[mid]}')" id="rightButton">${sortedItems[mid]}</button>
        <br>
        <button class="undo" onclick="undoLastComparison()">Undo</button>
        <p>Use ↔ arrow keys to choose, ↕ for undo</p>
    `;
}

// Handle result
function compareItems(selectedItem) {
    if (!currentComparison) return;

    comparisonsMade++;

    // Save current state to history for undo
    history.push({
        items: [...items],
        sortedItems: [...sortedItems],
        comparisonsMade: comparisonsMade - 1,  
        currentComparison: currentComparison,
        left: left,
        right: right,
        currentItem: currentItem
    });

    const [item, comparedTo] = currentComparison;
    const mid = sortedItems.indexOf(comparedTo);

    if (selectedItem === item) {
        right = mid - 1;
    } else {
        left = mid + 1;
    }

    updateDisplay();
    compareNextItem(item);
}

function updateDisplay(numItems, maxComparisons) {
    const outputDiv = document.getElementById('output');
    if (numItems !== undefined && maxComparisons !== undefined) {
        outputDiv.innerHTML = `
            <p><strong>Number of Items:</strong> ${numItems} &emsp; &emsp; &emsp; <strong>Maximum Comparisons:</strong> ${maxComparisons}</p>
        `;
    } else {
        outputDiv.innerHTML = `
            <p><strong>Comparisons Made:</strong> ${comparisonsMade}</p>
        `;
    }
}

function undoLastComparison() {
    if (sortingFinished || history.length === 0) return; // no undo if you're already done

    const lastState = history.pop();
    items = lastState.items;
    sortedItems = lastState.sortedItems;
    comparisonsMade = lastState.comparisonsMade;
    currentComparison = lastState.currentComparison;
    left = lastState.left;
    right = lastState.right;
    currentItem = lastState.currentItem;

    updateDisplay();
    compareNextItem(currentItem);
}

// Function to finish
function finishSorting() {
    sortingFinished = true; // Set the flag

    const comparisonInterface = document.getElementById('comparisoninterface');
    comparisonInterface.innerHTML = '';

    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML += `
        <h3>Sorted List:</h3>
        <ul>${sortedItems.map(item => `<li>${item}</li>`).join('')}</ul>
    `;
}

// Event listener for key controls
document.addEventListener('keydown', function (event) {
    if (sortingFinished) return; // No controls if youre finished

    switch (event.key) {
        case 'ArrowLeft':
            document.getElementById('leftButton')?.click();
            break;
        case 'ArrowRight':
            document.getElementById('rightButton')?.click();
            break;
        case 'ArrowUp':
        case 'ArrowDown':
            undoLastComparison();
            break;
    }
});
