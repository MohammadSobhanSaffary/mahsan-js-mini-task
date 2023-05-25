"use strict";
//###################//
//#### VARIABLES ####//
//###################//
const BASE_URL = "https://646539449c09d77a62e76d06.mockapi.io";
let budget = 0;
let balance = 0;
let costs = 0;
let costsItems = [];

//##################//
//#### HANDELES ####//
//##################//

const updateDataToServer = async () => {
  try {
    await fetch(`${BASE_URL}/wallet/1`, {
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
const setBudget = () => {
  const budgetBox = document.querySelector(".budget");
  budgetBox.textContent = budget === 0 ? "" : budget;
};
const setBalance = () => {
  const balanceBox = document.querySelector(".balance");
  balanceBox.textContent = balance === 0 ? "" : balance;
};
const setCosts = () => {
  const costsBox = document.querySelector(".costs");
  costsBox.textContent = costs === 0 ? "" : costs;
};
const addBudget = async () => {
  const addBudgetErrorText = document.querySelector(".addBudgetError");
  const budgetInput = document.querySelector(".budgetInput");
  if (Number(budgetInput.value) >= 0 && budgetInput.value !== "") {
    budget += Number(budgetInput.value);
    balance = budget - costs;
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
      budget -= Number(budgetInput.value);
      balance = budget - costs;
    }
  } else if (budgetInput.value.trim() === "") {
    console.log(addBudgetErrorText);
    addBudgetErrorText.textContent = "این فیلد نمی تواند خالی باشد.";
  }
  console.log(budgetInput.value.trim() === "");
  budgetInput.value = null;
};
const addCost = async () => {
  const costAmountInput = document.querySelector(".costAmountInput");
  const costNameInput = document.querySelector(".costNameInput");
  const addCostErrorText = document.querySelector(".addCostError");
  if (costAmountInput.value > 0 && costNameInput.value.trim() !== "") {
    addCostErrorText.textContent = "";
    costs += Number(costAmountInput.value);
    balance = budget - costs;
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
        name: costNameInput.value,
        amount: +costAmountInput.value,
        id: generateUuid(),
      });
      renderTable();
    } else {
      costs -= Number(costAmountInput.value);
      balance = budget + Number(costs);
    }
  } else if (
    costAmountInput.value.trim() === "" ||
    costNameInput.value.trim() === ""
  ) {
    addCostErrorText.textContent = "پر کردن هردو فیلد الزامی است.";
  }
  costNameInput.value = null;
  costAmountInput.value = null;
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
      totalCosts: 0,
      budget: 0,
      balance: 0,
      costsItems: [],
      id: "1",
    }),
  });
  if (res.ok) {
    budget = 0;
    balance = 0;
    costs = 0;
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
  handleShowTable();
};
handleGetData();
