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
const putRequest = async () =>
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
const updateDataToServer = async () => {
  try {
    await putRequest();
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
  const balanceDollarSign = document.querySelector(".balanceDollarSign");
  if (balance < 0) {
    balanceBox.classList.remove("textGreen");
    balanceDollarSign.classList.remove("textGreen");
    balanceBox.classList.add("textRed");
    balanceDollarSign.classList.add("textRed");
  }
  if (balance >= 0) {
    balanceBox.classList.remove("textRed");
    balanceDollarSign.classList.remove("textRed");
    balanceBox.classList.add("textGreen");
    balanceDollarSign.classList.add("textGreen");
  }
  balanceBox.textContent = balance === 0 && budget === 0 ? "" : balance;
};
const setCosts = () => {
  const costsBox = document.querySelector(".costs");
  costsBox.textContent = costs === 0 ? "" : costs;
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
const addBudget = async () => {
  const addBudgetErrorText = document.querySelector(".addBudgetError");
  const budgetInput = document.querySelector(".budgetInput");
  if (Number(budgetInput.value) >= 0 && budgetInput.value !== "") {
    budget += Number(budgetInput.value);
    balance = budget - costs;
    try {
      const res = await putRequest();
      if (res.ok) {
        setBalance();
        setBudget();
        addBudgetErrorText.textContent = "";
      } else {
        budget -= Number(budgetInput.value);
        balance = budget - costs;
      }
    } catch (err) {
      console.error(err);
      budget -= Number(budgetInput.value);
      balance = budget - costs;
    }
    budgetInput.value = null;
  } else if (budgetInput.value.trim() === "") {
    addBudgetErrorText.textContent = "این فیلد نمی تواند خالی باشد.";
  }
};
const addCost = async () => {
  const costAmountInput = document.querySelector(".costAmountInput");
  const costNameInput = document.querySelector(".costNameInput");
  const addCostErrorText = document.querySelector(".addCostError");
  if (costAmountInput.value > 0 && costNameInput.value.trim() !== "") {
    addCostErrorText.textContent = "";
    costs += Number(costAmountInput.value);
    balance = budget - costs;
    try {
      const res = await putRequest();
      if (res.ok) {
        setCosts();
        setBalance();
        costsItems.push({
          name: costNameInput.value,
          amount: +costAmountInput.value,
          id: generateUuid(),
        });
        renderTable();
        handleShowTable();
      } else {
        costs -= Number(costAmountInput.value);
        balance = budget - costs;
      }
    } catch (err) {
      console.error(err);
      costs -= Number(costAmountInput.value);
      balance = budget - costs;
    }
    costNameInput.value = null;
    costAmountInput.value = null;
  } else if (
    costAmountInput.value.trim() === "" ||
    costNameInput.value.trim() === ""
  ) {
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

const handleRefresh = async () => {
  const res = await putRequest();
  if (res.ok) {
    budget = 0;
    balance = 0;
    costs = 0;
    costsItems = [];
    setBudget();
    setCosts();
    setBalance();
    renderTable();
    updateDataToServer();
  }
  handleShowTable();
};

//####################//
//#### FETCH_DATA ####//
//####################//

const handleGetData = async () => {
  try {
    const res = await fetch(`${BASE_URL}/wallet`);
    if (res.ok) {
      const data = await res.json();
      costs = data[0].totalCosts;
      budget = data[0].budget;
      balance = data[0].balance;
      costsItems = data[0].costsItems;
      setCosts();
      setBudget();
      setBalance();
      renderTable();
    }
  } catch (err) {
    console.log(err);
  }
  handleShowTable();
};
handleGetData();
