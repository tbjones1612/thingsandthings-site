// Global variables
let selectedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
let startHour = 7;
let endHour = 19;
let unavailableTimes = {};

// DOM Elements
const hourRangeForm = document.getElementById('hour-range-form');
const weekdayRangeForm = document.getElementById('weekday-range-form');
const customHourContainer = document.getElementById('custom-hour-container');
const customDayContainer = document.getElementById('custom-day-container');
const unavailableTimesContainer = document.getElementById('unavailable-times-container');
const applyButton = document.getElementById('apply-button');
const showAvailableCheckbox = document.getElementById('ShowAvailable');
const createReportCheckbox = document.getElementById('CreateReport');
const scheduleContainer = document.getElementById('schedule-container');

// Event Listeners
hourRangeForm.addEventListener('change', handleHourRangeChange);
weekdayRangeForm.addEventListener('change', handleWeekdayRangeChange);
applyButton.addEventListener('click', generateSchedule);
showAvailableCheckbox.addEventListener('change', toggleAvailableTimes);
createReportCheckbox.addEventListener('change', createReport);

// Custom input for hour range
function handleHourRangeChange(e) {
    customHourContainer.innerHTML = '';
    if (e.target.value === 'custom') {
        customHourContainer.innerHTML = `
            <input type="number" id="customStartHour" min="0" max="23" value="${startHour}">
            <input type="number" id="customEndHour" min="0" max="23" value="${endHour}">
        `;
    } else if (e.target.value === '24hr') {
        startHour = 0;
        endHour = 23;
    } else if (e.target.value === '7to7') {
        startHour = 7;
        endHour = 19;
    }
    updateUnavailableInputs();
}

// Custom input for weekday range
function handleWeekdayRangeChange(e) {
    customDayContainer.innerHTML = '';
    if (e.target.value === 'custom') {
        customDayContainer.innerHTML = `
            <input type="checkbox" id="monday" checked><label for="monday">Mon</label>
            <input type="checkbox" id="tuesday" checked><label for="tuesday">Tue</label>
            <input type="checkbox" id="wednesday" checked><label for="wednesday">Wed</label>
            <input type="checkbox" id="thursday" checked><label for="thursday">Thu</label>
            <input type="checkbox" id="friday" checked><label for="friday">Fri</label><br/>
            <input type="checkbox" id="saturday"><label for="saturday">Sat</label>
            <input type="checkbox" id="sunday"><label for="sunday">Sun</label>
        `;
        customDayContainer.addEventListener('change', updateSelectedDays);
    } else if (e.target.value === '7day') {
        selectedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    } else if (e.target.value === 'MtoF') {
        selectedDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    }
    updateUnavailableInputs();
}

function updateSelectedDays() {
    selectedDays = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        const checkbox = document.getElementById(day);
        if (checkbox && checkbox.checked) {
            selectedDays.push(day.charAt(0).toUpperCase() + day.slice(1));
        }
    });
    updateUnavailableInputs();
}

// Update unavailable time inputs based on selected days
function updateUnavailableInputs() {
    unavailableTimesContainer.innerHTML = '';
    selectedDays.forEach(day => {
        const timeInput = document.createElement('div');
        timeInput.className = 'time-input';
        timeInput.innerHTML = `
            ${day}: <input type="time" step="900" class="start-time"> - 
            <input type="time" step="900" class="end-time">
        `;
        unavailableTimesContainer.appendChild(timeInput);
    });
}

// Generate the schedule
function generateSchedule() {
    updateHourRange();
    scheduleContainer.innerHTML = '';
    
    const table = document.createElement('table');
    const headerRow = table.insertRow();
    headerRow.insertCell(); // Empty cell for the corner
    
    selectedDays.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        headerRow.appendChild(th);
    });
    
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 15) {
            const row = table.insertRow();
            const timeCell = row.insertCell();
            if (minute === 0) {
                timeCell.textContent = `${hour}:00`;
                timeCell.classList.add('hour-start');
            } else {
                timeCell.textContent = `${hour}:${minute.toString().padStart(2, '0')}`;
                timeCell.classList.add('quarter-hour');
            }
            
            selectedDays.forEach(day => {
                const cell = row.insertCell();
                cell.dataset.day = day;
                cell.dataset.hour = hour;
                cell.dataset.minute = minute;
                if (minute === 0) {
                    cell.classList.add('hour-start');
                } else {
                    cell.classList.add('quarter-hour');
                }
            });
        }
    }
    
    scheduleContainer.appendChild(table);
    applyUnavailableTimes();
    toggleAvailableTimes();
}

function updateHourRange() {
    const customStartHour = document.getElementById('customStartHour');
    const customEndHour = document.getElementById('customEndHour');
    if (customStartHour && customEndHour) {
        startHour = parseInt(customStartHour.value);
        endHour = parseInt(customEndHour.value);
    }
}

// Apply unavailable times to the schedule
function applyUnavailableTimes() {
    const timeInputs = document.querySelectorAll('.time-input');
    unavailableTimes = {};
    
    timeInputs.forEach(input => {
        const day = input.textContent.split(':')[0].trim();
        const start = input.querySelector('.start-time').value;
        const end = input.querySelector('.end-time').value;
        
        if (start && end) {
            if (!unavailableTimes[day]) unavailableTimes[day] = [];
            unavailableTimes[day].push({ start, end });
        }
    });
    
    const cells = document.querySelectorAll('td[data-day]');
    cells.forEach(cell => {
        const day = cell.dataset.day;
        const hour = parseInt(cell.dataset.hour);
        const minute = parseInt(cell.dataset.minute);
        
        if (unavailableTimes[day]) {
            unavailableTimes[day].forEach(time => {
                const [startHour, startMinute] = time.start.split(':').map(Number);
                const [endHour, endMinute] = time.end.split(':').map(Number);
                
                const cellTime = hour * 60 + minute;
                const startTime = startHour * 60 + startMinute;
                const endTime = endHour * 60 + endMinute;
                
                if (cellTime >= startTime && cellTime < endTime) {
                    cell.classList.add('unavailable');
                }
            });
        }
    });
}

// Toggle available times
function toggleAvailableTimes() {
    const cells = document.querySelectorAll('td[data-day]');
    cells.forEach(cell => {
        if (!cell.classList.contains('unavailable')) {
            cell.classList.toggle('available', showAvailableCheckbox.checked);
        }
    });
}

// Create report
function createReport() {
    let reportContainer = document.getElementById('report-container');
    if (!reportContainer) {
        reportContainer = document.createElement('div');
        reportContainer.id = 'report-container';
        scheduleContainer.appendChild(reportContainer);
    }
    
    if (!createReportCheckbox.checked) {
        reportContainer.innerHTML = '';
        return;
    }
    
    let report = "Times Available:\n";
    
    selectedDays.forEach(day => {
        report += `${day}: `;
        let availableTimes = [];
        let start = null;
        
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const cell = document.querySelector(`td[data-day="${day}"][data-hour="${hour}"][data-minute="${minute}"]`);
                if (cell && !cell.classList.contains('unavailable')) {
                    if (start === null) start = `${hour}:${minute.toString().padStart(2, '0')}`;
                } else {
                    if (start !== null) {
                        availableTimes.push(`${start}-${hour}:${minute.toString().padStart(2, '0')}`);
                        start = null;
                    }
                }
            }
        }
        
        if (start !== null) {
            availableTimes.push(`${start}-${endHour + 1}:00`);
        }
        
        report += availableTimes.join(', ') + '\n';
    });
    
    reportContainer.innerHTML = `
        <textarea readonly>${report}</textarea>
        <button id="copy-report">Copy Report</button>
    `;
    
    document.getElementById('copy-report').addEventListener('click', () => {
        const textarea = reportContainer.querySelector('textarea');
        textarea.select();
        document.execCommand('copy');
    });
}

// Initialize the page
updateUnavailableInputs();
generateSchedule();