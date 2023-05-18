"use strict";
const BASE_URL = "https://646539449c09d77a62e76d06.mockapi.io";
const budgetBox = document.querySelector(".budget");
const balanceBox = document.querySelector(".balance");
const costsBox = document.querySelector(".costs");
const calcBudgetBtn = document.querySelector(".calcBudgetBtn");
const budgetInput = document.querySelector(".budgetInput");
const costNameInput = document.querySelector(".costNameInput");
const costAmountInput = document.querySelector(".costAmountInput");
const addCostBtn = document.querySelector(".addCostBtn");
const tableBody = document.querySelector("tbody");
let budget = 0;
let balance = 0;
let costs = 0;
let costsItems = [];
let addBudgetInputEmptyError = false;
let costInputEmptyError = false;

//##################//
//#### HANDELES ####//
//##################//

const updateDataToServer = async () => {
  try {
    const res = await fetch(`${BASE_URL}/wallet/1`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        totalCosts: costs,
        budget: budget,
        balance: balance,
        costsItems: costsItems,
        id: "1",
      }),
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.log(err);
  }
};
const generateUuid = () => {
  return String("xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx").replace(
    /[xy]/g,
    (character) => {
      const random = (Math.random() * 16) | 0;
      const value = character === "x" ? random : (random & 0x3) | 0x8;

      return value.toString(16);
    }
  );
};

const setBudget = () => (budgetBox.textContent = budget);

const setBalance = () => (balanceBox.textContent = balance);
const setCosts = () => (costsBox.textContent = costs);

const addBudget = (input) => {
  if (input >= 0) {
    budget += Number(input);
    balance = budget - costs;
    updateDataToServer();
    setBalance();
    setBudget();
  }
};
const addCost = (costName, costAmount) => {
  tableBody.innerHTML = "";
  if (costAmount > 0 && costName !== "") {
    costs += Number(costAmount);
    balance = budget - Number(costs);
    setCosts();
    setBalance();
    costsItems.push({
      name: costName,
      amount: costAmount,
      id: generateUuid(),
    });
    costsItems.forEach((el) => {
      const tr = document.createElement("tr");
      const amountTd = document.createElement("td");
      const nameTd = document.createElement("td");
      const actiontTd = document.createElement("td");
      const binIcon = document.createElement("img");
      amountTd.textContent = el.amount;
      nameTd.textContent = el.name;
      binIcon.srcset = "./assets/images/trash-bin.png";
      binIcon.className = "binIcon";
      actiontTd.appendChild(binIcon);
      tr.appendChild(actiontTd);
      tr.appendChild(amountTd);
      tr.appendChild(nameTd);
      tableBody.appendChild(tr);
      actiontTd.addEventListener("click", () => {
        costsItems = costsItems.filter((item) => item.id !== el.id);
        balance += Number(el.amount);
        costs -= Number(el.amount);
        updateDataToServer();
        setBalance();
        setCosts();
        tableBody.removeChild(tr);
      });
    });
    updateDataToServer();
  }
};
const renderTable = () => {
  tableBody.innerHTML = "";
  costsItems.forEach((el) => {
    const tr = document.createElement("tr");
    const amountTd = document.createElement("td");
    const nameTd = document.createElement("td");
    const actiontTd = document.createElement("td");
    const binIcon = document.createElement("img");
    amountTd.textContent = el.amount;
    nameTd.textContent = el.name;
    binIcon.srcset = "./assets/images/trash-bin.png";
    binIcon.className = "binIcon";
    actiontTd.appendChild(binIcon);
    tr.appendChild(actiontTd);
    tr.appendChild(amountTd);
    tr.appendChild(nameTd);
    tableBody.appendChild(tr);
    actiontTd.addEventListener("click", () => {
      costsItems = costsItems.filter((item) => item.id !== el.id);
      balance += Number(el.amount);
      costs -= Number(el.amount);
      updateDataToServer();
      setBalance();
      setCosts();
      tableBody.removeChild(tr);
    });
  });
};
//####################//
//#### FETCH_DATA ####//
//####################//
const handleGetData = async () => {
  try {
    const res = await fetch(`${BASE_URL}/wallet`);
    const data = await res.json();
    console.log(data[0]);
    costs = data[0].totalCosts;
    budget = data[0].budget;
    balance = data[0].balance;
    costsItems = data[0].costsItems;
    setCosts();
    setBudget();
    setBalance();
    renderTable();
  } catch (err) {
    console.log(err);
  }
};
handleGetData();
//#####################//
//#### LISITENERS ####//
//####################//
calcBudgetBtn.addEventListener("click", () => {
  addBudget(budgetInput.value);
  budgetInput.value = null;
});
addCostBtn.addEventListener("click", () => {
  addCost(costNameInput.value, costAmountInput.value);
  costNameInput.value = null;
  costAmountInput.value = null;
});
