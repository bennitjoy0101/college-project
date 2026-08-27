// Maximum value the gauge scale represents (kg CO2e/year).
// Based on the highest possible score from the quiz answers.
const MAX_VALUE = 10000;

const meterContainer = document.getElementById("meterContainer");
const noData = document.getElementById("noData");

const needle = document.getElementById("needle");

const totalValueEl = document.getElementById("totalValue");
const tonnesValueEl = document.getElementById("tonnesValue");
const statusBadgeEl = document.getElementById("statusBadge");

const transportValueEl = document.getElementById("transportValue");
const flightsValueEl = document.getElementById("flightsValue");
const foodValueEl = document.getElementById("foodValue");


// Read the results saved by the quiz page
const raw = sessionStorage.getItem("carbonResults");

if (!raw) {

    // No quiz data found - show fallback message
    meterContainer.style.display = "none";
    noData.style.display = "block";

} else {

    const results = JSON.parse(raw);

    renderMeter(results);
}


function renderMeter(results) {

    const total = results.total || 0;
    const tonnes = results.tonnes || (total / 1000);

    // Clamp the value so the needle never goes past either end
    const clamped = Math.min(Math.max(total, 0), MAX_VALUE);
    const percent = clamped / MAX_VALUE;

    // Rotate the needle: -90deg (min) to +90deg (max),
    // pivoting around the gauge center (100,100)
    const rotation = -90 + (180 * percent);

    // Small delay so the transition animates on load
    requestAnimationFrame(() => {
        needle.setAttribute(
            "transform",
            `rotate(${rotation} 100 100)`
        );
    });

    // Text values
    totalValueEl.textContent =
        `${total.toFixed(1)} kg CO₂e/year`;

    tonnesValueEl.textContent =
        `${tonnes.toFixed(2)} tonnes CO₂e/year`;

    transportValueEl.textContent =
        `${(results.transport || 0).toFixed(1)} kg`;

    flightsValueEl.textContent =
        `${(results.flights || 0).toFixed(1)} kg`;

    foodValueEl.textContent =
        `${(results.food || 0).toFixed(1)} kg`;

    // Status badge based on which third of the gauge we're in
    let statusText = "Low Impact";
    let statusClass = "low";

    if (percent > 0.66) {
        statusText = "High Impact";
        statusClass = "high";
    } else if (percent > 0.33) {
        statusText = "Moderate Impact";
        statusClass = "moderate";
    }

    statusBadgeEl.textContent = statusText;
    statusBadgeEl.classList.add(statusClass);
}
