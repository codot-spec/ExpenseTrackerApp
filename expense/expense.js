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

  function filterExpenses(range) {
    const token = localStorage.getItem('token');
    
    // Fetch expenses by selected date range (daily, weekly, monthly)
    axios.get(`http://localhost:3000/expenses/date-range?range=${range}`, {
      headers: { "Authorization": token }
    })
    .then(response => {
      const { expenses, totalIncome, totalExpenses } = response.data;
      
      // Update the UI with filtered expenses
      const expenseList = document.getElementById('expenseList');
      expenseList.innerHTML = '';  // Clear previous list
  
      expenses.forEach(expense => {
        const expenseItem = document.createElement("li");
        expenseItem.innerHTML = `
          ${expense.amount} - ${expense.description} - ${expense.category}
          <button onclick="deleteExpense(${expense.id})">Delete</button>
          <button onclick="editExpense(${expense.id}, ${expense.amount}, '${expense.description}', '${expense.category}')">Edit</button>
        `;
        expenseList.appendChild(expenseItem);
      });
  
      // Display total income and expenses
      const totalInfo = document.getElementById('total-info');
      totalInfo.innerHTML = `
        <p>Total Income: ${totalIncome}</p>
        <p>Total Expenses: ${totalExpenses}</p>
      `;
    })
    .catch(error => console.log(error));
  }
  
  
  function showleaderboard(){
     const inputElement = document.createElement('input');
     inputElement.type = "button";
     inputElement.value = "Show Leaderboard";
     inputElement.onclick = async ()=> {
      const token = localStorage.getItem('token');
      const leaderboardArray = await axios.get("http://localhost:3000/premium/showLeaderBoard",{headers: { "Authorization" : token }})
      var leaderBoardEle = document.getElementById('leaderboard');
      leaderBoardEle.innerHTML += '<h1>Leader Board</h1>'
      leaderboardArray.data.forEach((userDetails) =>{
        leaderBoardEle.innerHTML += `<li>Name - ${userDetails.name} Total Expense -${userDetails.totalExpenses || 0}</li>`
      })
     }
     document.getElementById('message').appendChild(inputElement);
  }

  function showPremiumUserMessage()
  {
     document.getElementById('rzp-button1').style.visibility="hidden"
    document.getElementById('message').innerHTML="You Are a Premium User"
  }

  function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

  window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    console.log(decodedToken)
    const isPremiumUser = decodedToken.isPremium;
  if(isPremiumUser){
    showPremiumUserMessage();
    showleaderboard();
    document.getElementById('filter-options').style.display = 'block';
    document.getElementById('downloadexpense').style.display = 'block';
  } else {
    // Show message for non-premium users
    document.getElementById('message').innerHTML = "Upgrade to Premium to access these features.";
    document.getElementById('filter-options').style.display = 'none';
    document.getElementById('downloadexpense').style.display = 'none';
  }
    //fetch and display expenses
    axios.get("http://localhost:3000/expenses", { headers: { "Authorization":token } })
      .then(response => {
        response.data.forEach(expense => displayExpenseOnScreen(expense));
      })
      .catch(error => console.log(error));
  });
  

  function download(){
    axios.get('http://localhost:3000/user/download', { headers: {"Authorization" : token} })
    .then((response) => {
        if(response.status === 201){
            //the bcakend is essentially sending a download link
            //  which if we open in browser, the file would download
            var a = document.createElement("a");
            a.href = response.data.fileUrl;
            a.download = 'myexpense.csv';
            a.click();
        } else {
            throw new Error(response.data.message)
        }
    })
    .catch((err) => {
        showError(err)
    });
}


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
  
document.getElementById('rzp-button1').onclick = async function (e) {
  const token =localStorage.getItem('token');
  const response = await axios.get ('http://localhost:3000/purchase/premiummembership', { headers :{ "Authorization" : token }});
console.log(response);
var options = {
  "key" : response.data.key_id,
  "order_id" : response.data.order.id, //for one time payment
  //handler fxn will handle the success payment
  "handler" : async function (response){
    const res = await axios.post("http://localhost:3000/purchase/updatetransactionstatus",{
      order_id : options.order_id,
      payment_id : response.razorpay_payment_id,
    },{ headers : {"Authorization": token} })

    alert('You are a premium user Now')
    document.getElementById('rzp-button1').style.visibility="hidden"
    document.getElementById('message').innerHTML="You Are a Premium User"
    localStorage.setItem('token',  res.data.token)
    showleaderboard();
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

