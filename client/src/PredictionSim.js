const advanceTime = 2;
let ncuaData = null;
let userState = {
    age: 0,
    cash: 0,
    income: 0,
    expenses: 0,
    investments: 0,
    jobStability: 0.8,
    relationshipStatus: "single",
    hasJob: true,
    kids: 0,
    hasBusiness: false
}
let economyState = {
    inflationRate: 0.02,
    marketReturn: 0.05,
    recession: false
}
randomLifeEvents = {
    jobLoss: {weight: 0.15, impact: -0.5,
        condition: (state) => state.hasJob && state.jobStability < 0.5,
        name: "Job Loss",
        description: "You lost your job, leading to a significant drop in income."
     },
    promotion: { weight: 0.05, impact: 0.3,
        condition: (state) => state.jobStability > 0.7 && state.age < 60 && state.hasJob,
        name: "Promotion",
        description: "You got a promotion, increasing your income."
     },
    medicalExpense: { weight: 0.1, impact: -0.2,
        condition: (state) => state.age > 40,
        name: "Medical Expense",
        description: "You got sick and had to pay for medical treatment."
     },
    inheritance: { weight: 0.02, impact: 0.5,
        condition: (state) => state.age > 50,
        name: "Inheritance",
        description: "You received an inheritance, increasing your wealth."
     },
    child: { weight: 0.1, impact: -0.1,
        condition: (state) => state.age > 25 && state.age < 45 && state.relationshipStatus === "married",
        name: "Child",
        description: "You had a child, increasing your expenses."
     },
    deathInTheFamily: { weight: 0.1, impact: -0.3,
        name: "Death in the Family",
        description: "A family member passed away, causing emotional and financial strain."
     },
    weatherDisaster: { weight: 0.08, impact: -0.4,
        name: "Weather Disaster",
        description: "A natural disaster damaged your property, leading to unexpected expenses."
     },
    lotteryWin: { weight: 0.01, impact: 1.0,
        name: "Lottery Win",
        description: "You won the lottery, drastically increasing your wealth."
     },
    newHouse: { weight: 0.05, impact: -0.2,
        condition: (state) => state.age > 30 && state.age < 50,
        name: "New House",
        description: "You bought a new house, increasing your expenses."
     },
    businessSuccess: { weight: 0.02, impact: 0.5,
        condition: (state) => state.jobStability < 0.5 && state.age > 30 && state.hasBusiness,
        name: "Business Success",
        description: "Your business venture succeeded, increasing your wealth."
     },
    businessFailure: { weight: 0.02, impact: -0.5,
        condition: (state) => state.jobStability < 0.5 && state.age > 30 && state.hasBusiness,
        name: "Business Failure",
        description: "Your business venture failed, leading to significant financial losses."
     },
    newCar: { weight: 0.05, impact: -0.1,
        condition: (state) => state.age > 25 && state.age < 65,
        name: "New Car",
        description: "You bought a new car, increasing your expenses."
     },
    healthDecline: { weight: 0.05, impact: -0.2,
        condition: (state) => state.age > 40,
        name: "Health Decline",
        description: "Your health has declined, leading to increased medical expenses."
     },
     retirement: { weight: 0.1, impact: -0.3,
        condition: (state) => state.age > 60,
        name: "Retirement",
        description: "You have entered retirement, reducing your income."
     },
     noMajorEvent: { weight: 0.6, impact: 0 }
}
function attachPredictionSimListeners() {
    console.log('attachPredictionSimListeners', document.readyState);
    try {
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.addEventListener('click', () => {
                window.location.href = "PredictionSim.html";
            });
        }

        const continueButton = document.getElementById('continueButton');
        if (continueButton) {
            continueButton.addEventListener('click', (event) => {
                event.preventDefault();
                simulateYear();
            });
        }

        const closeEventButton = document.getElementById('closeEventButton');
        if (closeEventButton) {
            closeEventButton.addEventListener('click', closeEvent);
        }

        const startButton = document.getElementById('startButton');
        if (startButton) {
            startButton.addEventListener('click', (event) => {
                event.preventDefault();
                console.log('startButton clicked');
                startSimulation();
            });
        }

        if (document.getElementById('currentFinances') || document.getElementById('currentEconomy')) {
            displayCurrentData();
        }
    } catch (error) {
        console.error('attachPredictionSimListeners error:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log('PredictionSim DOMContentLoaded');
    try {
        await initAppData();
    } catch (error) {
        console.warn('NCUA init failed, continuing without data:', error);
    }

    userState = JSON.parse(sessionStorage.getItem('userState')) || userState;
    economyState = JSON.parse(sessionStorage.getItem('economyState')) || economyState;
    attachPredictionSimListeners();
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
    attachPredictionSimListeners();
}
function startSimulation(){
    try {
        const ageInput = document.getElementById('ageInput');
        const cashInput = document.getElementById('cashInput');
        const incomeInput = document.getElementById('income');
        const expensesInput = document.getElementById('expensesInput');
        const investmentsInput = document.getElementById('investmentsInput');

        if (!ageInput || !cashInput || !incomeInput || !expensesInput || !investmentsInput) {
            console.error('Start simulation failed: one or more input fields are missing.');
            return;
        }

        // initialize user state and economy state
        userState.age = Number(ageInput.value);
        userState.cash = Number(cashInput.value);
        userState.income = Number(incomeInput.value);
        userState.expenses = Number(expensesInput.value);
        userState.investments = Number(investmentsInput.value);
        userState.relationshipStatus = "single";
        userState.hasJob = true;
        userState.kids = 0;
        userState.hasBusiness = false;

        economyState.inflationRate = 0.02;
        economyState.marketReturn = 0.05;
        economyState.recession = false;

        sessionStorage.setItem('userState', JSON.stringify(userState));
        sessionStorage.setItem('economyState', JSON.stringify(economyState));

        const nextPage = new URL('bitMoney.html', window.location.href).href;
        console.log('Starting simulation, navigating to', nextPage);
        window.location.href = nextPage;
    } catch (error) {
        console.error('startSimulation error:', error);
    }
}

window.startSimulation = startSimulation;

async function simulateYear() {
    if(userState.age >= 80) {
        alert("Simulation complete! You lived to be " + userState.age + " years old.");
        return;
    }
    if(userState.cash < -10000){
        alert("Simulation complete! You went bankrupt at age " + userState.age + ".");
        return;
    }
    // Update user state based on economy
    userState.age += advanceTime;
    userState.cash += userState.income * advanceTime;
    userState.cash -= userState.expenses * advanceTime;
    userState.investments *= Math.pow(1 + economyState.marketReturn, advanceTime);
    
    // Apply inflation to expenses
    userState.expenses *= Math.pow(1 + economyState.inflationRate, advanceTime);
    
    //Apply user-selected events
    const selectedEvents = document.querySelectorAll('input[name="lifeEvent"]:checked');
    selectedEvents.forEach(checkbox => {
        enactEvent({event: checkbox.value});
        checkbox.checked = false;
    });

    // Random life events
    const randomEvent = getRandomLifeEvent();
    if(randomEvent && randomEvent.event !== 'noMajorEvent'){
        enactEvent(randomEvent);
        displayRandomEvent(randomEvent);
    }
    
    // Save state    
    sessionStorage.setItem('userState', JSON.stringify(userState));
    
    await forecastEconomy();
    displayCurrentData();
}

function getRandomLifeEvent() {
  // 1. filter valid events
    const validEvents = Object.entries(randomLifeEvents).filter(([name, data]) => {
        return !data.condition || data.condition(userState);
    });

    // 2. compute total weight
    const totalWeight = validEvents.reduce((sum, [name, data]) => {
        return sum + data.weight;
    }, 0);

    // 3. roll
    let random = Math.random() * totalWeight;

    // 4. pick event
    for (let [name, data] of validEvents) {
        if (random < data.weight) {
            return {
                event: name,
                data: data
            };
        }
        random -= data.weight;
    }
    return null;
}

function enactEvent(event) {
    switch(event.event) {
        case 'jobLoss':
            userState.hasJob = false;
            userState.income *= 0.05;
            break;
        case 'promotion':
            userState.income *= 1.3;
            break;
        case 'newJob':
            userState.hasJob = true; 
            userState.income *= 1.2;
            break;
        case 'medicalExpense':
            userState.cash -= userState.cash * 0.7;
            break;
        case 'inheritance':
            userState.cash += userState.cash * 0.5;
            break;
        case 'child':
            userState.expenses += 5000;
            userState.kids += 1;
            break;
        case 'deathInTheFamily':
            userState.cash -= userState.cash * 0.3;
            break;
        case 'weatherDisaster':
            userState.cash -= userState.cash * 0.7;
            break;
        case 'lotteryWin':
            userState.cash += 1000000;
            break;
        case 'newHouse':
            userState.cash -= 50000;
            break;
        case 'divorce':
            userState.cash *= 0.5;
            userState.relationshipStatus = "divorced";
            break;
        case 'married':
            userState.cash += 20000;
            userState.relationshipStatus = "married";
            break;
        case 'businessSuccess':
            userState.cash += userState.cash * 0.5;
            userState.hasBusiness = true;
            break;
        case 'startBusiness':
            userState.cash -= 20000;
            userState.hasBusiness = true;
            break;
        case 'businessFailure':
            userState.cash -= userState.cash * 0.5;
            userState.hasBusiness = false;
            break;
        case 'newCar':
            userState.cash -= 30000;
            break;
        case 'healthDecline':
            userState.income *= 0.9;
            break;
        case 'retirement':
            userState.hasJob = false; 
            userState.income *= 0.5; 
            break;
        case 'investMoney':
            userState.cash -= 10000;
            userState.investments += 10000;
            break;
        default:
            break;
    }
}

function displayRandomEvent(event) {
    const eventDisplay = document.getElementById('randomEvent');
    eventDisplay.style.display = 'flex';
    document.getElementById('eventTitle').textContent = event.data.name;
    document.getElementById('eventDescription').textContent = event.data.description;
}
function closeEvent(){
    document.getElementById('randomEvent').style.display = 'none';
}

function displayCurrentData(){
    document.getElementById('age').innerText = userState.age;
    document.getElementById('cash').innerText = '$' + userState.cash.toLocaleString();
    document.getElementById('income').innerText = '$' + userState.income.toLocaleString();
    document.getElementById('expenses').innerText = '$' + userState.expenses.toLocaleString();
    document.getElementById('investments').innerText = '$' + userState.investments.toLocaleString();
    document.getElementById('jobStatus').innerText = userState.hasJob ? 'Employed' : 'Unemployed';
    document.getElementById('relationshipStatus').innerText = userState.relationshipStatus;
    document.getElementById('kids').innerText = userState.kids;
    document.getElementById('businessStatus').innerText = userState.hasBusiness ? 'Has Business' : 'No Business';

    document.getElementById('inflationRate').innerText = (economyState.inflationRate * 100).toFixed(2) + '%';
    document.getElementById('marketReturn').innerText = (economyState.marketReturn * 100).toFixed(2) + '%';
    document.getElementById('recession').innerText = economyState.recession ? 'Yes' : 'No';
}


async function forecastEconomy() {
    const wasInRecession = economyState.recession;
    const results = await generateFuturePrediction(advanceTime);
    if(results){
        economyState.inflationRate = results.inflationRate;
        economyState.marketReturn = results.marketRate;
        economyState.recession = Math.random() < results.recessionProbability;

        if(economyState.recession !== wasInRecession){
            userState.income *= economyState.recession ? 0.9 : (1/0.9);
        }
    }
    sessionStorage.setItem('economyState', JSON.stringify(economyState));
}

const _FLASK_BASE = 'http://localhost:5000/api';

// Use Gemini via Flask to predict economic conditions — keeps API key server-side
async function generateFuturePrediction(years) {
    try {
        const res = await fetch(`${_FLASK_BASE}/gemini/predict-future`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ advanceTime: years }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn('Gemini prediction failed, using fallback math:', err);
        // Fallback: simple math model if Flask is unreachable
        const jitter = () => (Math.random() - 0.5) * 0.02;
        return {
            inflationRate: Math.max(0.01, Math.min(0.10, 0.03 + years * 0.003 + jitter())),
            marketRate:    Math.max(0.01, Math.min(0.12, 0.06 + years * 0.002 + jitter())),
            recessionProbability: Math.max(0, Math.min(1, 0.15 + years * 0.01 + jitter())),
        };
    }
}

// Fetch NCUA data from Flask (server already caches it for 24h)
async function initNCUAData() {
    try {
        const res = await fetch(`${_FLASK_BASE}/rates`, { credentials: 'include' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        console.warn('NCUA fetch failed:', err);
        return null;
    }
}

async function initAppData() {
    ncuaData = await initNCUAData();
}

