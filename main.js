"use strict";
//###################//
//#### VARIABLES ####//
//###################//
const BASE_URL = "https://646539449c09d77a62e76d06.mockapi.io";
const budgetBox = document.querySelector(".budget");
const balanceBox = document.querySelector(".balance");
const costsBox = document.querySelector(".costs");
const calcBudgetBtn = document.querySelector(".calcBudgetBtn");
const costNameInput = document.querySelector(".costNameInput");
const costAmountInput = document.querySelector(".costAmountInput");
const addCostBtn = document.querySelector(".addCostBtn");
const refreshBtn = document.querySelector(".refreshBtn");
let budget = "";
let balance = "";
let costs = "";
let costsItems = [];
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
const addBudget = async (input) => {
  const addBudgetErrorText = document.querySelector(".addBudgetError");
  budget += Number(input);
  balance = budget - costs;
  if (Number(input) >= 0) {
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
    if (res.ok) {
      setBalance();
      setBudget();
      addBudgetErrorText.textContent = "";
    } else {
      budget -= Number(input);
      balance = budget - costs;
    }
  } else if (input.trim() === "") {
    addBudgetErrorText.textContent = "این فیلد نمی تواند خالی باشد.";
  }
};
const addCost = async (costName, costAmount) => {
  const addCostErrorText = document.querySelector(".addCostError");
  if (costAmount > 0 && costName.trim() !== "") {
    addCostErrorText.textContent = "";
    costs += Number(costAmount);
    balance = budget - Number(costs);
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
    if (res.ok) {
      setCosts();
      setBalance();
      costsItems.push({
        name: costName,
        amount: costAmount,
        id: generateUuid(),
      });
      renderTable();
    } else {
      costs -= Number(costAmount);
      balance = budget + Number(costs);
    }
  } else if (costAmount.trim() === "" || costAmount.trim() === "") {
    addCostErrorText.textContent = "پر کردن هردو فیلد الزامی است.";
  }
  handleShowTable();
};
const renderTable = () => {
  const tableBody = document.querySelector("tbody");
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
      handleShowTable();
    });
  });
};
const handleShowTable = () => {
  if (costsItems.length === 0) {
    document.querySelector("table").classList.remove("visible");
    document.querySelector("table").classList.add("hidden");
  } else {
    document.querySelector("table").classList.remove("hidden");
    document.querySelector("table").classList.add("visible");
  }
};

const handleRefresh = async () => {
  const res = await fetch(`${BASE_URL}/wallet/1`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      totalCosts: "",
      budget: "",
      balance: "",
      costsItems: [],
      id: "1",
    }),
  });
  if (res.ok) {
    budget = "";
    balance = "";
    costs = "";
    costsItems = [];
    setBudget();
    setCosts();
    setBalance();
    renderTable();
  }
};
//####################//
//#### FETCH_DATA ####//
//####################//
const handleGetData = async () => {
  try {
    const res = await fetch(`${BASE_URL}/wallet`);
    const data = await res.json();
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
  handleShowTable();
};
handleGetData();
//#####################//
//#### LISITENERS #####//
//####################//
calcBudgetBtn.addEventListener("click", () => {
  const budgetInput = document.querySelector(".budgetInput");
  addBudget(budgetInput.value);
  budgetInput.value = null;
});
addCostBtn.addEventListener("click", () => {
  addCost(costNameInput.value, costAmountInput.value);
  costNameInput.value = null;
  costAmountInput.value = null;
});
