let items = [];
let comparisonsMade = 0;
let comparisonQueue = [];
let sortedItems = [];
let currentComparison = null;
let history = []; // To keep track of previous states for undo

// Function to calculate the number of comparisons for a tournament ranking
function calculateTournamentComparisons(numItems) {
    return (numItems - 1) * 2; // Adjusted for the tournament ranking system
}

// Function to start the sorting process
function sortAlgo() {
    const inputText = document.getElementById('man-item-input').value;
    items = inputText.split('\n').filter(item => item.trim() !== ''); // Get the list items
    sortedItems = items.slice(); // Clone the items list for sorting

    comparisonsMade = 0;

    const numItems = items.length;
    const numComparisons = calculateTournamentComparisons(numItems);

    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `
        <p><strong>Number of Items:</strong> ${numItems}&emsp;&emsp;&emsp;&emsp;<strong>Estimated Comparisons:</strong> ${numComparisons}</p>
    `;

    // Initialize comparison queue
    initializeComparisonQueue();

    // Start the comparison process
    startComparisons();
}

// Function to initialize the comparison queue with item pairs
function initializeComparisonQueue() {
    comparisonQueue = [];
    
    // Generate all possible pairs of items
    for (let i = 0; i < sortedItems.length; i++) {
        for (let j = i + 1; j < sortedItems.length; j++) {
            comparisonQueue.push([sortedItems[i], sortedItems[j]]);
        }
    }
}

// Function to start the comparison process
function startComparisons() {
    if (comparisonQueue.length === 0 || sortedItems.length <= 1) {
        finishSorting();
        return;
    }

    // Show the next pair in the comparison queue
    const [item1, item2] = comparisonQueue.shift();
    currentComparison = [item1, item2]; // Store the current comparison

    const comparisonInterface = document.getElementById('comparisoninterface');
    comparisonInterface.innerHTML = `
        <h3>Select your preference:</h3>
        <button class="comparison" onclick="selectItem('${item1}')">${item1}</button>
        <button class="comparison" onclick="selectItem('${item2}')">${item2}</button>
        </br>
        <button class="undo" onclick="undoLastComparison()">Undo</button>
    `;
}

// Function to handle the selection of an item during comparison
function selectItem(selectedItem) {
    if (!currentComparison) return;

    const [item1, item2] = currentComparison;
    comparisonsMade++;

    // Save the current state to history for undo
    history.push({
        sortedItems: [...sortedItems],
        comparisonQueue: [...comparisonQueue],
        comparisonsMade: comparisonsMade,
        currentComparison: currentComparison
    });

    // Swap the items if necessary
    if (selectedItem === item2) {
        const index1 = sortedItems.indexOf(item1);
        const index2 = sortedItems.indexOf(item2);
        if (index1 !== -1 && index2 !== -1) {
            [sortedItems[index1], sortedItems[index2]] = [sortedItems[index2], sortedItems[index1]];
        }
    }

    // Continue with the next comparison
    currentComparison = null;
    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `
        <p><strong>Comparisons Made:</strong> ${comparisonsMade}</p>
    `;

    startComparisons();
}

// Function to undo the last comparison
function undoLastComparison() {
    if (history.length === 0) return;

    // Revert to the last saved state in history
    const lastState = history.pop();
    sortedItems = lastState.sortedItems;
    comparisonQueue = lastState.comparisonQueue;
    comparisonsMade = lastState.comparisonsMade;
    currentComparison = lastState.currentComparison;

    // Continue with the next comparison
    startComparisons();
}

// Function to finish the sorting process
function finishSorting() {
    const comparisonInterface = document.getElementById('comparisoninterface');
    comparisonInterface.innerHTML = ' ';

    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML += `
        <h3>Sorted List:</h3>
        <ul>${sortedItems.map(item => `<li>${item}</li>`).join('')}</ul>
        <p><strong>Total Comparisons Made:</strong> ${comparisonsMade}</p>
    `;
}
