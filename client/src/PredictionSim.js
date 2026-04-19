const advanceTime = 3;
userState = {
    age: 0,
    cash: 0,
    income: 0,
    expenses: 0,
    investments: 0,
    jobStability: 0.8,
    lifestyleLevel: 1,
    hasJob: true,
    kids: 0
}
economyState = {
    inflationRate: 0.02,
    marketReturn: 0.05,
    recession: false
}
randomLifeEvents = {
    jobLoss: {weight: 0.15, impact: -0.5,
        condition: (state) => state.hasJob && state.jobStability < 0.5
     },
    promotion: { weight: 0.05, impact: 0.3,
        condition: (state) => state.jobStability > 0.7 && state.age < 60 && state.hasJob
     },
     newJob: { weight: 0.1, impact: 0.2,
        condition: (state) => !state.hasJob && state.age < 60
     },
    medicalExpense: { weight: 0.1, impact: -0.2,
        condition: (state) => state.age > 40
     },
    inheritance: { weight: 0.02, impact: 0.5,
        condition: (state) => state.age > 50
     },
    child: { weight: 0.2, impact: -0.1,
        condition: (state) => state.age > 25 && state.age < 45
     },
    deathInTheFamily: { weight: 0.1, impact: -0.3 },
    weatherDisaster: { weight: 0.03, impact: -0.4 },
    lotteryWin: { weight: 0.01, impact: 1.0 },
    newHouse: { weight: 0.05, impact: -0.2,
        condition: (state) => state.age > 30 && state.age < 50
     },
    divorce: { weight: 0.05, impact: -0.3,
        condition: (state) => state.age > 30
     },
    marriage: { weight: 0.05, impact: 0.2,
        condition: (state) => state.age > 25 && state.age < 45
    },
    businessSuccess: { weight: 0.02, impact: 0.5,
        condition: (state) => state.jobStability < 0.5 && state.age > 30
     },
    businessFailure: { weight: 0.02, impact: -0.5,
        condition: (state) => state.jobStability < 0.5 && state.age > 30
     },
    newCar: { weight: 0.05, impact: -0.1,
        condition: (state) => state.age > 25 && state.age < 65
     },
    healthDecline: { weight: 0.05, impact: -0.2,
        condition: (state) => state.age > 40
     },
     retirement: { weight: 0.1, impact: -0.3,
        condition: (state) => state.age > 60
     },
     noMajorEvent: { weight: 0.3, impact: 0 }
}

function startSimulation(){
    //initialize user state and economy state
    userState.age = document.getElementById('ageInput').value;
    userState.cash = document.getElementById('cashInput').value;
    userState.income = document.getElementById('incomeInput').value;
    userState.expenses = document.getElementById('expensesInput').value;
    userState.investments = document.getElementById('investmentsInput').value;
    
    window.location.href = "bitMoney.html";
    while(userState.age < 80) {
        simulateYear();
        userState.age += advanceTime;
    }
}

function simulateYear() {
    // Update user state based on economy
    userState.age += advanceTime;
    userState.cash += userState.income * advanceTime;
    userState.cash -= userState.expenses * advanceTime;
    userState.investments *= (1 + economyState.marketReturn * advanceTime);
    
    // Apply inflation to expenses
    userState.expenses *= (1 + economyState.inflationRate * advanceTime);
    
    // Random life events
    event = getRandomLifeEvent();
    enactEvent(event);
    
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
            break;
        case 'marriage':
            userState.cash += 20000;
            break;
        case 'businessSuccess':
            userState.cash += userState.cash * 0.5;
            break;
        case 'businessFailure':
            userState.cash -= userState.cash * 0.5;
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
        default:
            break;
    }
}