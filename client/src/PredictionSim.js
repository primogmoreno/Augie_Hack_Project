const advanceTime = 3;
userState = {
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
economyState = {
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
    weatherDisaster: { weight: 0.03, impact: -0.4,
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
     noMajorEvent: { weight: 0.3, impact: 0 }
}

addEventListener('DOMContentLoaded', () => {
    userState = JSON.parse(sessionStorage.getItem('userState')) || userState;
    economyState = JSON.parse(sessionStorage.getItem('economyState')) || economyState;

    document.getElementById('startButton').addEventListener('click', startSimulation);
    document.getElementById('closeEventButton').addEventListener('click', closeEvent);
    document.getElementById('restartButton').addEventListener('click', () => {
        window.location.href = "PredictionSim.html";
    });
    document.getElementById('continueButton').addEventListener('click', simulateYear);
});
function startSimulation(){
    //initialize user state and economy state
    userState.age = document.getElementById('ageInput').value;
    userState.cash = document.getElementById('cashInput').value;
    userState.income = document.getElementById('incomeInput').value;
    userState.expenses = document.getElementById('expensesInput').value;
    userState.investments = document.getElementById('investmentsInput').value;
    
    sessionStorage.setItem('userState', JSON.stringify(userState));
    sessionStorage.setItem('economyState', JSON.stringify(economyState));
    window.location.href = "bitMoney.html";
}

function simulateYear() {
    if(userState.age >= 80) {
        alert("Simulation complete! You lived to be " + userState.age + " years old.");
        return;
    }
    // Update user state based on economy
    userState.age += advanceTime;
    userState.cash += userState.income * advanceTime;
    userState.cash -= userState.expenses * advanceTime;
    userState.investments *= (1 + economyState.marketReturn * advanceTime);
    
    // Apply inflation to expenses
    userState.expenses *= (1 + economyState.inflationRate * advanceTime);
    
    //Apply user-selected events
    const selectedEvents = document.querySelectorAll('input[name="lifeEvent"]:checked');
    selectedEvents.forEach(event => {
        enactEvent({event: event.value});
    });

    // Random life events
    randomEvent = getRandomLifeEvent();
    enactEvent(randomEvent);
    displayRandomEvent(randomEvent);
    
    // Update economy state
    if (Math.random() < 0.1) {
        economyState.recession = !economyState.recession;
        economyState.marketReturn = economyState.recession ? -0.05 : 0.05;
    }
}

function getRandomLifeEvent() {
    validEvents = Object.entries(randomLifeEvents).filter(([event, data]) => {
        return !data.condition || data.condition(userState);
    });
    const totalWeight = validEvents.reduce((sum, [event, data]) => sum + data.weight, 0);
    let random = Math.random() * totalWeight;
    for (let [event, data] of validEvents) {
        if (random < data.weight) {
            userState.cash += userState.cash * data.impact;
            break;
        }
        random -= data.weight;
    }  // 1. filter valid events
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
        case 'marriage':
            userState.cash += 20000;
            userState.relationshipStatus = "married";
            break;
        case 'businessSuccess':
            userState.cash += userState.cash * 0.5;
            hasBusiness = true;
            break;
        case 'startBusiness':
            userState.cash -= 20000;
            hasBusiness = true;
            break;
        case 'businessFailure':
            userState.cash -= userState.cash * 0.5;
            hasBusiness = false;
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