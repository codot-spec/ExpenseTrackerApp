function handleFormSubmit(event) {
    event.preventDefault();
  
    const expenseId = event.target.dataset.expenseId; // Get expense ID if editing
    const expenseDetails = {
      amount: event.target.amount.value,
      description: event.target.description.value,
      category: event.target.category.value,
    };
  
    if (expenseId) {
      // If editing an existing expense
      axios.put(`http://localhost:3000/expenses/${expenseId}`, expenseDetails)
        .then(response => {
          updateExpenseOnScreen(response.data);
        })
        .catch(error => console.log(error));
    } else {
      // If adding a new expense
      axios.post("http://localhost:3000/expenses", expenseDetails)
        .then(response => {
          displayExpenseOnScreen(response.data);
        })
        .catch(error => console.log(error));
    }
  
    event.target.reset(); // Reset form after submission
    delete event.target.dataset.expenseId; // Clear expenseId
  }
  
  window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    axios.get("http://localhost:3000/expenses",{headers: {"Authorization" :token}})
      .then(response => {
        response.data.forEach(expense => displayExpenseOnScreen(expense));
      })
      .catch(error => console.log(error));
  });
  
  function displayExpenseOnScreen(expense) {
    const expenseList = document.getElementById('expenseList');
    const expenseItem = document.createElement("li");
    expenseItem.setAttribute("data-id", expense.id);
    expenseItem.innerHTML = `
      ${expense.amount} - ${expense.description} - ${expense.category}
      <button onclick="deleteExpense(${expense.id})">Delete</button>
      <button onclick="editExpense(${expense.id}, ${expense.amount}, '${expense.description}', '${expense.category}')">Edit</button>
    `;
    expenseList.appendChild(expenseItem);
  }
  
  function deleteExpense(expenseId) {
    axios.delete(`http://localhost:3000/expenses/${expenseId}`)
      .then(() => {
        removeExpenseFromScreen(expenseId);
      })
      .catch(error => console.log(error));
  }
  
  function removeExpenseFromScreen(expenseId) {
    const expenseItem = document.querySelector(`li[data-id='${expenseId}']`);
    expenseItem.remove();
  }
  
  function updateExpenseOnScreen(expense) {
    const expenseItem = document.querySelector(`li[data-id='${expense.id}']`);
    expenseItem.innerHTML = `
      ${expense.amount} - ${expense.description} - ${expense.category}
      <button onclick="deleteExpense(${expense.id})">Delete</button>
      <button onclick="editExpense(${expense.id}, ${expense.amount}, '${expense.description}', '${expense.category}')">Edit</button>
    `;
  }
  
  function editExpense(expenseId, amount, description, category) {
    document.getElementById('amount').value = amount;
    document.getElementById('description').value = description;
    document.getElementById('category').value = category;
    document.getElementById('form').dataset.expenseId = expenseId;
  }