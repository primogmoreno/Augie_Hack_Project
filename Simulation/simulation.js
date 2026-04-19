const fmt = n => isNaN(n) ? '-': '$' + Number(n).toLocaleString();

function submit() {
    const monthlyIncome = Number(document.getElementById("monthlyIncome").value) || 0;
    const monthlySavings = Number(document.getElementById("monthlySavings").value) || 0;

    const answers = {
        monthlyIncome: monthlyIncome,
        monthlySavings: monthlySavings,
        housing: document.getElementById("housing").value || 0,
        loans: document.getElementById("loans").value || 0,
        insurance: document.getElementById("insurance").value || 0,
        transportation: document.getElementById("transportation").value || 0,
        food: document.getElementById("food").value || 0,
        entertainment: document.getElementById("entertainment").value || 0,
        clothing: document.getElementById("clothing").value || 0,
        utilities: document.getElementById("utilities").value || 0,
        otherExpenses: document.getElementById("otherExpenses").value || 0
    };
    localStorage.setItem("answers", JSON.stringify(answers));
    window.location.href = "results.html";
}

function displayResults() {
    console.log("displayResults called");
    const storedAnswers = localStorage.getItem("answers");
    console.log("Stored answers:", storedAnswers);

    if(!storedAnswers) {
        console.log("No stored answers found");
        document.getElementById("results").innerText = "No data found. Please submit the form first.";
        return;
    }
    let answers;
    try{
        answers = JSON.parse(storedAnswers);
        console.log("Parsed answers:", answers);
    } catch(e) {
        console.log("Error parsing answers:", e);
        document.getElementById("results").innerText = "Error parsing stored data.";
        return;
    }

    const savingsRate = ((answers.monthlySavings / answers.monthlyIncome) * 100).toFixed(1) || 0;
    console.log("Savings rate:", savingsRate);

    //display results
    for(const key in answers) {
        const element = document.getElementById(key + "Result");
        if(!element) {
            console.log("Element not found:", key + "Result");
            continue;
        }
        element.innerText = fmt(answers[key]);
        console.log("Set", key + "Result", "to", fmt(answers[key]));
    }
    const rateElement = document.getElementById("savingsRate");
    if(rateElement) {
        rateElement.innerText = isNaN(savingsRate) ? '-' : savingsRate + '%';
        console.log("Set savings rate to:", savingsRate + '%');
    }

    // Calculate and display total expenses
    const expenseKeys = ['housing', 'loans', 'insurance', 'transportation', 'utilities', 'food', 'entertainment', 'clothing', 'otherExpenses'];
    const totalExpenses = expenseKeys.reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    console.log("Total expenses:", totalExpenses);
    const totalElement = document.getElementById("totalExpensesResult");
    if(totalElement) {
        totalElement.innerText = fmt(totalExpenses);
        console.log("Set total expenses to:", fmt(totalExpenses));
    }
}

//TODO: replace with real CSV fetch and parsing once we have the data format nailed down
function getCSVData(){
    // Sample average data for comparison (in dollars)
    return {
        monthlyIncome: 5000,
        monthlySavings: 500,
        housing: 1200,
        loans: 300,
        insurance: 200,
        transportation: 400,
        utilities: 150,
        food: 300,
        entertainment: 150,
        clothing: 100,
        otherExpenses: 200
    };
}

function populateComparison() {
    const storedAnswers = localStorage.getItem("answers");
    if(!storedAnswers) return;
    let answers;
    try{
        answers = JSON.parse(storedAnswers);
    } catch(e) {
        return;
    }

    const csvData = getCSVData();
    const comparisonBody = document.getElementById("comparison-body");
    if(!comparisonBody) return;

    const categories = [
        {key: 'monthlyIncome', label: 'Monthly Income'},
        {key: 'monthlySavings', label: 'Monthly Savings'},
        {key: 'housing', label: 'Housing'},
        {key: 'loans', label: 'Loans'},
        {key: 'insurance', label: 'Insurance'},
        {key: 'transportation', label: 'Transportation'},
        {key: 'utilities', label: 'Utilities'},
        {key: 'food', label: 'Food'},
        {key: 'entertainment', label: 'Entertainment'},
        {key: 'clothing', label: 'Clothing'},
        {key: 'otherExpenses', label: 'Other Expenses'}
    ];

    categories.forEach(cat => {
        const userVal = Number(answers[cat.key]) || 0;
        const csvVal = Number(csvData[cat.key]) || 0;
        const diff = userVal - csvVal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${cat.label}</td>
            <td>${fmt(userVal)}</td>
            <td>${fmt(csvVal)}</td>
            <td>${fmt(diff)}</td>
        `;
        comparisonBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", function() {
    console.log("DOM loaded, checking page type...");

    // Check which page we're on
    const isWelcomePage = document.getElementById("monthlyIncome") !== null;
    const isResultsPage = document.getElementById("monthlyIncomeResult") !== null;

    console.log("Is welcome page:", isWelcomePage);
    console.log("Is results page:", isResultsPage);

    if (isWelcomePage) {
        console.log("Running welcome page functions");
        calcTotal();
        initScrollIndicators();
    }

    if (isResultsPage) {
        console.log("Running results page functions");
        displayResults();
        populateComparison();
        populateBudget();
        suggestions();
    }
});

function calcTotal() {
    const income = Number(document.getElementById("monthlyIncome").value) || 0;
    const savings = Number(document.getElementById("monthlySavings").value) || 0;
    const expenses = Array.from(document.querySelectorAll('.expense')).reduce((sum, el) => sum + (Number(el.value) || 0), 0);
    const total = income - savings - expenses;
    document.getElementById("expense-total").innerText = expenses.toLocaleString();
    document.getElementById("remaining").innerText = total.toLocaleString();
}

function populateBudget(){
    console.log("populateBudget called");
    const storedAnswers = localStorage.getItem("answers");
    if(!storedAnswers) {
        console.log("No stored answers for budget");
        return;
    }
    let answers;
    try{
        answers = JSON.parse(storedAnswers);
        console.log("Budget answers:", answers);
    } catch(e) {
        console.log("Error parsing budget answers:", e);
        return;
    }

    const income = Number(answers.monthlyIncome) || 0;
    console.log("Income for budget:", income);

    //populate needs (50%)
    const needs = income * 0.5;
    console.log("Setting typical needs to:", fmt(needs));
    document.getElementById("typicalNeeds").innerText = fmt(needs);

    const yourNeeds = ['housing', 'insurance', 'transportation', 'utilities', 'food'].reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    console.log("Setting your needs to:", fmt(yourNeeds));
    document.getElementById("yourNeeds").innerText = fmt(yourNeeds);

    //populate wants (30%)
    const wants = income * 0.3;
    console.log("Setting typical wants to:", fmt(wants));
    document.getElementById("typicalWants").innerText = fmt(wants);

    const yourWants = ['entertainment', 'clothing', 'otherExpenses'].reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    console.log("Setting your wants to:", fmt(yourWants));
    document.getElementById("yourWants").innerText = fmt(yourWants);

    //populate savings (20%)
    const savings = income * 0.2;
    console.log("Setting typical savings to:", fmt(savings));
    document.getElementById("typicalSavings").innerText = fmt(savings);

    const yourSavings = ['monthlySavings', 'loans'].reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    console.log("Setting your savings to:", fmt(yourSavings));
    document.getElementById("yourSavings").innerText = fmt(yourSavings);
}

async function suggestions(){
    const storedAnswers = localStorage.getItem("answers");
    if(!storedAnswers) return;
    let answers;
    try{
        answers = JSON.parse(storedAnswers);
    } catch(e) {
        return;
    }
    const typicalBudgetData = {
        needs: answers.monthlyIncome * 0.5, // needs
        wants: answers.monthlyIncome * 0.3, // wants
        savings: answers.monthlyIncome * 0.2  // savings
    };
    const userNeeds = ['housing', 'insurance', 'transportation', 'utilities', 'food'].reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    const userWants = ['entertainment', 'clothing', 'otherExpenses'].reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    const userSavings = ['monthlySavings', 'loans'].reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);

    await getAIGeneratedTips(answers, typicalBudgetData, userNeeds, userWants, userSavings);
}
async function getAIGeneratedTips(answers, typicalData, userNeeds, userWants, userSavings){
    const tipsList = document.getElementById("tips-list");
    if (!tipsList) return;

    // For now, show some sample tips based on the data
    const tips = [];

    if (userNeeds > typicalData.needs) {
        tips.push("Your housing and essential expenses are higher than the 50% guideline. Consider ways to reduce these costs.");
    } else {
        tips.push("Great job keeping your essential expenses under 50% of your income!");
    }

    if (userWants > typicalData.wants) {
        tips.push("Your discretionary spending exceeds the 30% guideline. Review your entertainment and lifestyle expenses.");
    } else {
        tips.push("Your discretionary spending is within the recommended 30% range.");
    }

    if (userSavings < typicalData.savings) {
        tips.push("Consider increasing your savings to reach the recommended 20% of income.");
    } else {
        tips.push("Excellent! You're saving more than the recommended 20% of your income.");
    }

    // Clear loading message and add tips
    tipsList.innerHTML = "";
    tips.forEach(tip => {
        const li = document.createElement("li");
        li.textContent = tip;
        tipsList.appendChild(li);
    });

    // TODO: Replace with actual API call to Gemini
    // const response = await fetch('/api/gemini/tips', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ answers, typicalData, userNeeds, userWants, userSavings })
    // });
    // const data = await response.json();
    // // Process and display the AI-generated tips
}

// Scroll indicator functionality
function initScrollIndicators() {
    const indicators = document.querySelectorAll('.scroll-dot');
    const sections = document.querySelectorAll('section');

    // Set first indicator as active by default
    if (indicators.length > 0) {
        indicators[0].classList.add('active');
    }

    // Update active indicator on scroll
    function updateActiveIndicator() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionCenter = sectionTop + sectionHeight / 2;

            // Update active indicator (when section is in center of viewport)
            if (Math.abs(scrollY + windowHeight / 2 - sectionCenter) < windowHeight / 2) {
                // Remove active class from all indicators
                indicators.forEach(indicator => indicator.classList.remove('active'));
                // Add active class to current indicator
                if (indicators[index]) {
                    indicators[index].classList.add('active');
                }
            }
        });
    }

    // Add click handlers to indicators
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            const targetSection = sections[index];
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Listen for scroll events
    window.addEventListener('scroll', updateActiveIndicator);
}