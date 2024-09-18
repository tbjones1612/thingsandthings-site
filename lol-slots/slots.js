const symbols = ['🍋‍🟩', '🍋', '🍊', '👽', '😎', '🔥', '💎'];
const reelCount = 5;
const symbolHeight = 100;
const spinDuration = 1000;
const displayedSymbolsCount = 3;
const symbolsPerReel = 75; // Generate 75 items per reel
const minScrollSymbols = 10; // Scroll at least 10 symbols
const maxScrollSymbols = 65; // Scroll at most 65 symbols

let reelStates = Array(reelCount).fill([]);

window.addEventListener('load', createReels);

function createReels() {
    const reels = document.querySelectorAll('.reel');
    reels.forEach((reel, index) => {
        const strip = document.createElement('div');
        strip.className = 'strip';
        reelStates[index] = [];

        for (let i = 0; i < symbolsPerReel; i++) {
            const symbol = document.createElement('div');
            symbol.className = 'symbol';

            if (reelStates[index][i]) {
                symbol.textContent = reelStates[index][i];
            } else {
                const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                symbol.textContent = randomSymbol;
                reelStates[index].push(randomSymbol);
            }

            strip.appendChild(symbol);
        }
        reel.appendChild(strip);
    });
}

function spin() {
    const reels = document.querySelectorAll('.reel');
    reels.forEach((reel, index) => {
        const strip = reel.querySelector('.strip');
        const symbolCount = strip.children.length;

        strip.innerHTML = '';

        const startingSymbols = reelStates[index];
        startingSymbols.forEach(symbol => {
            const symbolDiv = document.createElement('div');
            symbolDiv.className = 'symbol';
            symbolDiv.textContent = symbol;
            strip.appendChild(symbolDiv);
        });

        for (let i = startingSymbols.length; i < symbolsPerReel; i++) {
            const symbol = document.createElement('div');
            symbol.className = 'symbol';
            symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            strip.appendChild(symbol);
        }

        strip.style.transition = 'none';
        strip.style.transform = 'translateY(0)';

        setTimeout(() => {
            strip.style.transition = `transform ${spinDuration}ms cubic-bezier(.5,0,.5,1)`;

            const randomOffset = Math.floor(Math.random() * (maxScrollSymbols - minScrollSymbols + 1)) + minScrollSymbols;
            const finalPosition = -(randomOffset + displayedSymbolsCount) * symbolHeight;

            strip.style.transform = `translateY(${finalPosition}px)`;
            updateReelState(strip, index, randomOffset + displayedSymbolsCount);
        }, 50 * index);
    });

    setTimeout(() => {
        document.querySelector('button').disabled = false;
        displayFloatingSymbols();
    }, spinDuration + 100);
}

function updateReelState(strip, reelIndex, startIndex) {
    const symbolsInStrip = strip.children;
    const visibleSymbols = [];

    for (let i = 0; i < displayedSymbolsCount; i++) {
        const symbolIndex = (startIndex + i) % symbolsInStrip.length;
        visibleSymbols.push(symbolsInStrip[symbolIndex].textContent);
    }

    reelStates[reelIndex] = visibleSymbols;
}

function displayFloatingSymbols() {
    const visibleSymbols = reelStates.flat();
    const container = document.getElementById('floating-symbols-container');

    container.innerHTML = '';

    visibleSymbols.forEach(symbol => {
        const floatingSymbol = document.createElement('div');
        floatingSymbol.className = 'floating-symbol';
        floatingSymbol.textContent = symbol;

        const left = Math.random() * 100;
        const top = Math.random() * 100;

        floatingSymbol.style.left = `${left}%`;
        floatingSymbol.style.top = `${top}%`;

        container.appendChild(floatingSymbol);

        setTimeout(() => {
            floatingSymbol.classList.add('fade-out');
            setTimeout(() => {
                floatingSymbol.remove();
            }, 2500);
        }, 50);
    });
}

let autoSpinInterval;

document.querySelector('#auto-spin-checkbox').addEventListener('change', function () {
    if (this.checked) {
        autoSpinInterval = setInterval(() => {
            document.querySelector('button').click();
        }, 2000);
    } else {
        clearInterval(autoSpinInterval);
    }
});


document.querySelector('button').addEventListener('click', function () {
    this.disabled = true;
    spin();
});
