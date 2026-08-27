let questions = [];
let currentQuestion = 0;
let answers = {};

const questionText = document.getElementById("question");
const optionsContainer = document.getElementById("options");
const nextButton = document.getElementById("nextBtn");
const progressText = document.getElementById("progress");
const resultContainer = document.getElementById("result");


// Load questions from JSON
fetch("questions.json")
    .then(response => response.json())
    .then(data => {
        questions = data.questions;
        showQuestion();
    })
    .catch(error => {
        console.error("Error loading questions:", error);
        questionText.textContent = "Unable to load questions.";
    });


// Display current question
function showQuestion() {

    const q = questions[currentQuestion];

    questionText.textContent = q.question;

    progressText.textContent =
        `Question ${currentQuestion + 1} of ${questions.length}`;

    optionsContainer.innerHTML = "";

    q.options.forEach((option, index) => {

        const button = document.createElement("button");

        button.className = "option";
        button.textContent = option.text;

        button.onclick = () => selectOption(index, option.value);

        optionsContainer.appendChild(button);
    });

    nextButton.disabled = true;
}


// Select an answer
function selectOption(index, value) {

    const optionButtons =
        document.querySelectorAll(".option");

    optionButtons.forEach(button => {
        button.classList.remove("selected");
    });

    optionButtons[index].classList.add("selected");

    answers[questions[currentQuestion].id] = value;

    nextButton.disabled = false;
}


// Next question
nextButton.addEventListener("click", () => {

    if (currentQuestion < questions.length - 1) {

        currentQuestion++;

        showQuestion();

    } else {

        calculateFootprint();
    }
});


// Calculate final carbon footprint
function calculateFootprint() {

    // -----------------------
    // TRANSPORTATION
    // -----------------------

    const transportFactor =
        answers["transport_type"] || 0;

    const distance =
        answers["distance"] || 0;

    const travelDays =
        answers["travel_days"] || 0;

    let occupancy =
        answers["car_occupancy"] || 1;

    // Only divide by occupancy for cars
    if (transportFactor !== 0.17) {
        occupancy = 1;
    }

    // Yearly transportation emissions
    let transportFootprint =
        distance *
        travelDays *
        52 *
        transportFactor /
        occupancy;


    // -----------------------
    // FLIGHTS
    // -----------------------

    const flights =
        answers["flights"] || 0;

    // Simplified average flight:
    // 1000 km × 0.25 kg CO2e/km
    const flightFootprint =
        flights * 1000 * 0.25;


    // -----------------------
    // FOOD
    // -----------------------

    const diet =
        answers["diet"] || 0;

    const beefMutton =
        answers["beef_mutton"] || 0;

    const chicken =
        answers["chicken"] || 0;

    const fish =
        answers["fish"] || 0;

    const packagedFood =
        answers["packaged_food"] || 0;

    const restaurant =
        answers["restaurant"] || 0;


    // Meat frequency adjustments
    const meatFootprint =
        (beefMutton * 20) +
        (chicken * 8) +
        (fish * 6);


    // Total food footprint
    const foodFootprint =
        diet +
        meatFootprint +
        packagedFood +
        restaurant;


    // -----------------------
    // FINAL TOTAL
    // -----------------------

    const total =
        transportFootprint +
        flightFootprint +
        foodFootprint;


    displayResult(
        transportFootprint,
        flightFootprint,
        foodFootprint,
        total
    );
}


// Display result
function displayResult(
    transport,
    flights,
    food,
    total
) {

    // Save the results so meter.html can read them
    const results = {
        transport: transport,
        flights: flights,
        food: food,
        total: total,
        tonnes: total / 1000
    };

    sessionStorage.setItem(
        "carbonResults",
        JSON.stringify(results)
    );

    // Send the user to the meter page instead of
    // showing the result here
    window.location.href = "../meter/meter.html";
}