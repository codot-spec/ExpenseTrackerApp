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
          reloadExpenses();
        })
        .catch(error => console.log(error));
    } else {
      // If adding a new expense
      axios.post("http://localhost:3000/expenses", 
        expenseDetails, 
         { headers: { "Authorization":token } })
        .then(response => {
          reloadExpenses();
        })
        .catch(error => console.log(error));
    }
  
    event.target.reset(); // Reset form after submission
    delete event.target.dataset.expenseId; // Clear expenseId
  }

  function reloadExpenses() {
    const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    const isPremiumUser = decodedToken.isPremium;
    
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'),10) || 2;  // Get rows per page from localStorage (default is 2)
    let currentPage = 1;  // Default to page 1 after submission
    
    if (isPremiumUser) {
      filterExpenses('monthly', currentPage, rowsPerPage); // Reload premium expenses
    } else {
      fetchAndDisplayExpenses(currentPage, rowsPerPage); // Reload non-premium expenses
    }
    }
    
  
  
  function showleaderboard(){
   // if (document.querySelector('input[type="button"]')) return;  //prevent duplicacy of button
     const inputElement = document.createElement('input');
     inputElement.type = "button";
     inputElement.value = "Show Leaderboard";
     inputElement.onclick = async ()=> {
      const token = localStorage.getItem('token');
      const leaderboardArray = await axios.get("http://localhost:3000/premium/showLeaderBoard", {headers: { "Authorization" : token }})
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


  function download() {
    const downloadButton = document.getElementById('downloadexpense');
  
    downloadButton.onclick = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get('http://localhost:3000/expenses/download', {
          headers: { "Authorization": token }
        });
  
        if (response.status === 200 && response.data.success) {
          // The backend sends the download link
          const fileUrl = response.data.fileUrl;
  
          var a = document.createElement("a");
          a.href = fileUrl;
          a.download = 'Expense.csv'; // Change the filename as needed
          a.click();
        } else {
          throw new Error(response.data.message || 'Error downloading file');
        }
      } catch (err) {
        showError(err);
      }
    };
  }
  
  function displayDownloadedContent() {
    const token = localStorage.getItem('token');
    
    axios.get('http://localhost:3000/expenses/downloaded-content', {
      headers: { "Authorization": token }
    })
      .then(response => {
        const downloadedList = document.getElementById('downloadedList');
        downloadedList.innerHTML = '';  // Clear existing content
  
        response.data.forEach(content => {
          const listItem = document.createElement('li');
          listItem.innerHTML = 
            `<a href="${content.url}" target="_blank">${content.filename}</a>`;  // Link to download file
          downloadedList.appendChild(listItem);
        });
      })
      .catch(error => console.log(error));
  }

  
  
  function deleteExpense(expenseId) {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    axios.delete(`http://localhost:3000/expenses/${expenseId}`,  { headers: { "Authorization":token } })
      .then(() => {
        reloadExpenses();
      })
      .catch(error => console.log(error));
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
    // document.getElementById('downloadexpense').style.display = 'block';
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

  
  function editExpense(expenseId, amount, description, category) {
    document.getElementById('amount').value = amount;
    document.getElementById('description').value = description;
    document.getElementById('category').value = category;
    document.getElementById('form').dataset.expenseId = expenseId;
  }

// Store the selected rows per page in localStorage
document.getElementById('rowsperpage').addEventListener('change', (event) => {
  const selectedRows = event.target.value; // Get the selected number of rows
  localStorage.setItem('rowsPerPage', selectedRows); // Store it in localStorage
  reloadExpenses(); // Reload expenses when rows per page changes
  });


// Fetch and display expenses with pagination
function fetchAndDisplayExpenses(page = 1, rowsPerPage = 2) {
  const token = localStorage.getItem('token');
  axios.get(`http://localhost:3000/expenses?page=${page}&limit=${rowsPerPage}`, {
    headers: { "Authorization": token }
  })
  .then(response => {
    const { expenses, pagination } = response.data;
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';  // Clear the previous list

    expenses.forEach(expense => {
      const expenseItem = document.createElement("li");
      expenseItem.setAttribute("data-id", expense.id);
      expenseItem.innerHTML = `${expense.amount} - ${expense.description} - ${expense.category}
        <button onclick="deleteExpense(${expense.id})">Delete</button>
        <button onclick="editExpense(${expense.id}, ${expense.amount}, '${expense.description}', '${expense.category}')">Edit</button>`;
      expenseList.appendChild(expenseItem);
    });
    // Display pagination buttons
    const paginationInfo = document.getElementById('paginationInfo');
    paginationInfo.innerHTML = ` 
      <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
      <button onclick="fetchAndDisplayExpenses(${pagination.currentPage - 1}, ${rowsPerPage})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
      <button onclick="fetchAndDisplayExpenses(${pagination.currentPage + 1}, ${rowsPerPage})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
    `;
  })
  .catch(error => console.log(error));
}

// Update filterExpenses to handle pagination correctly
function filterExpenses(range, page = 1, rowsPerPage = 2) {
  const token = localStorage.getItem('token');
  axios.get(`http://localhost:3000/expenses/date-range?range=${range}&page=${page}&limit=${rowsPerPage}`, {
    headers: { "Authorization": token }
  })
  .then(response => {
    const { expenses, pagination } = response.data;
    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';  // Clear the previous list

    expenses.forEach(expense => {
      const expenseItem = document.createElement("li");
      expenseItem.innerHTML = `${expense.amount} - ${expense.description} - ${expense.category}
        <button onclick="deleteExpense(${expense.id})">Delete</button>
        <button onclick="editExpense(${expense.id}, ${expense.amount}, '${expense.description}', '${expense.category}')">Edit</button>`;
      expenseList.appendChild(expenseItem);
    });

    // Display pagination buttons
    const paginationInfo = document.getElementById('paginationInfo');
    paginationInfo.innerHTML = ` 
      <p>Page ${pagination.currentPage} of ${pagination.totalPages}</p>
      <button onclick="filterExpenses('${range}', ${pagination.currentPage - 1}, ${rowsPerPage})" ${pagination.currentPage <= 1 ? 'disabled' : ''}>Previous</button>
      <button onclick="filterExpenses('${range}', ${pagination.currentPage + 1}, ${rowsPerPage})" ${pagination.currentPage >= pagination.totalPages ? 'disabled' : ''}>Next</button>
    `;
  })
  .catch(error => console.log(error));
}

// Display expenses when the page loads
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');
  const decodedToken = parseJwt(token);
  console.log(decodedToken)
  const isPremiumUser = decodedToken.isPremium;
  
  // Show premium features if the user is a premium member
  if (isPremiumUser) {
    showPremiumUserMessage();
    showleaderboard();
     displayDownloadedContent();
    document.getElementById('filter-options').style.display = 'block';
    document.getElementById('downloadexpense').style.display = 'block';
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'),10) || 2;  // Get rows per page from localStorage (default is 2)
    let currentPage = 1;  // Start at page 1
    filterExpenses('monthly', currentPage, rowsPerPage);  // Call filterExpenses with the default 'monthly' filter
  } else {
    displayDownloadedContent();
    document.getElementById('message').innerHTML = "Upgrade to Premium to access these features.";
    document.getElementById('filter-options').style.display = 'none';
    document.getElementById('downloadexpense').style.display = 'block';
    let rowsPerPage = parseInt(localStorage.getItem('rowsPerPage'),10) || 2;  // Get rows per page from localStorage (default is 2)
  let currentPage = 1;  // Start at page 1
  fetchAndDisplayExpenses(currentPage, rowsPerPage);  // Fetch and display expenses with pagination
}
});

reloadExpenses();
