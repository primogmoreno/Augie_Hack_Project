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
    const storedAnswers = localStorage.getItem("answers");
    if(!storedAnswers) {
        document.getElementById("results").innerText = "No data found. Please submit the form first.";
        return;
    }
    let answers;
    try{
        answers = JSON.parse(storedAnswers);
    } catch(e) {
        document.getElementById("results").innerText = "Error parsing stored data.";
        return;
    }

    const savingsRate = ((answers.monthlySavings / answers.monthlyIncome) * 100).toFixed(1) || 0;

    //display results
    const fmt = n =>  isNaN(n) ? '-': '$' + Number(n).toLocaleString();
    for(const key in answers) {
        const element = document.getElementById(key + "Result");
        if(!element) continue;
        element.innerText = fmt(answers[key]);
    }
    const rateElement = document.getElementById("savingsRate");
    if(rateElement) {
        rateElement.innerText = isNaN(savingsRate) ? '-' : savingsRate + '%';
    }

    // Calculate and display total expenses
    const expenseKeys = ['housing', 'loans', 'insurance', 'transportation', 'utilities', 'food', 'entertainment', 'clothing', 'otherExpenses'];
    const totalExpenses = expenseKeys.reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    const totalElement = document.getElementById("totalExpensesResult");
    if(totalElement) {
        totalElement.innerText = fmt(totalExpenses);
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

    const fmt = n => isNaN(n) ? '-': '$' + Number(n).toLocaleString();

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
    if (document.getElementById("monthlyIncome")) {
        calcTotal();
    }
    displayResults();
    populateComparison();
    populateBudget();
    suggestions();
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
    const storedAnswers = localStorage.getItem("answers");
    if(!storedAnswers) return;
    let answers;
    try{
        answers = JSON.parse(storedAnswers);
    } catch(e) {
        return;
    }

    const income = Number(answers.monthlyIncome) || 0;

    //populate needs (50%)
    const needs = income * 0.5;
    document.getElementById("typicalNeeds").innerText = fmt(needs);

    const yourNeeds = ['housing', 'insurance', 'transportation', 'utilities', 'food'].reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    document.getElementById("yourNeeds").innerText = fmt(yourNeeds);
    //populate wants (30%)
    const wants = income * 0.3;
    document.getElementById("typicalWants").innerText = fmt(wants);
    const yourWants = ['entertainment', 'clothing', 'otherExpenses'].reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    document.getElementById("yourWants").innerText = fmt(yourWants);
    //populate savings (20%)
    const savings = income * 0.2;
    document.getElementById("typicalSavings").innerText = fmt(savings);
    const yourSavings = ['savings', 'loans'].reduce((sum, key) => sum + (Number(answers[key]) || 0), 0);
    document.getElementById("yourSavings").innerText = fmt(yourSavings);
}

function suggestions(){
    const storedAnswers = localStorage.getItem("answers");
    if(!storedAnswers) return;
    let answers;
    try{
        answers = JSON.parse(storedAnswers);
    } catch(e) {
        return;
    }
    //TODO: prompt gemini api for suggestions based on user data and CSV data comparison
}