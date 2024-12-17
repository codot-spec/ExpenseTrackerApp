function handleFormSubmit(event) {
    event.preventDefault();
  
    const expenseId = event.target.dataset.expenseId; // Get expense ID if editing
    const expenseDetails = {
      amount: event.target.amount.value,
      description: event.target.description.value,
      category: event.target.category.value
    };
  
    const token = localStorage.getItem('token'); // Get the token from localStorag

    if (expenseId) {
      // If editing an existing expense
      axios.put(`http://localhost:3000/expenses/${expenseId}`,
        expenseDetails,  { headers: { "Authorization":token } })
        .then(response => {
          updateExpenseOnScreen(response.data);
        })
        .catch(error => console.log(error));
    } else {
      // If adding a new expense
      axios.post("http://localhost:3000/expenses", expenseDetails,  { headers: { "Authorization":token } })
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
    axios.get("http://localhost:3000/expenses", { headers: { "Authorization":token } })
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
    const token = localStorage.getItem('token'); // Get the token from localStorage
    axios.delete(`http://localhost:3000/expenses/${expenseId}`,  { headers: { "Authorization":token } })
      .then(() => {
        removeExpenseFromScreen(expenseId);
      })
      .catch(error => console.log(error));
  }
  
  function removeExpenseFromScreen(expenseId) {
    const expenseItem = document.querySelector(`li[data-id='${expenseId}']`);
    expenseItem.remove();
  }
  
document.getElementById('rzp-button').onclick = async function (e) {
  const token =localStorage.getItem('token');
  const response = await axios.get ('http://localhost:3000/purchase/premiummembership', { headers :{ "Authorization" : token }});
console.log(response);
var options = {
  "key" : response.data.key_id,
  "order_id" : response.data.order.id, //for one time payment
  //handler fxn will handle the success payment
  "handler" : async function (response){
    await axios.post("http://localhost:3000/purchase/updatetransactionstatus",{
      order_id : options.order_id,
      payment_id : response.razorpay_payment_id,
    },{ headers : {"Authorization": token} })

    alert('You are a premium user Now')
  }
};
const rzp1 = new Razorpay(options);
rzp1.open();
e.preventDefault();
rzp1.on('payment.failed', function (response){
  console.log(response)
  alert('Something went wrong');
})
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