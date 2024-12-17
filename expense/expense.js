// function handleFormSubmit(event) {
//     event.preventDefault();
  
//     const expenseId = event.target.dataset.expenseId; // Get expense ID if editing
//     const expenseDetails = {
//       amount: event.target.amount.value,
//       description: event.target.description.value,
//       category: event.target.category.value
//     };
  
//     const token = localStorage.getItem('token'); // Get the token from localStorag

//     if (expenseId) {
//       // If editing an existing expense
//       axios.put(`http://localhost:3000/expenses/${expenseId}`,
//         expenseDetails,  { headers: { "Authorization":token } })
//         .then(response => {
//           updateExpenseOnScreen(response.data);
//         })
//         .catch(error => console.log(error));
//     } else {
//       // If adding a new expense
//       axios.post("http://localhost:3000/expenses", expenseDetails,  { headers: { "Authorization":token } })
//         .then(response => {
//           displayExpenseOnScreen(response.data);
//         })
//         .catch(error => console.log(error));
//     }
  
//     event.target.reset(); // Reset form after submission
//     delete event.target.dataset.expenseId; // Clear expenseId
//   }
  
//   window.addEventListener("DOMContentLoaded", () => {
//     const token = localStorage.getItem('token');

//      // Fetch user's premium status on page load
//      axios.get("http://localhost:3000/user/status", { headers: { "Authorization": token } })
//          .then(response => {
//        const isPremium = response.data.isPremium;
//        const buyPremiumButton = document.getElementById("buyPremiumButton");
//        const premiumMessage = document.getElementById("premiumMessage"); // Assuming you have an element with this ID

//        if (isPremium) {
//        buyPremiumButton.style.display = "none"; 
//        premiumMessage.style.display = "block"; 
//         } else {
//        buyPremiumButton.style.display = "block"; 
//        premiumMessage.style.display = "none"; 
//        }
//        })
//       .catch(error => {
//        console.log(error);
//       });


//     //fetch and display expenses
//     axios.get("http://localhost:3000/expenses", { headers: { "Authorization":token } })
//       .then(response => {
//         response.data.forEach(expense => displayExpenseOnScreen(expense));
//       })
//       .catch(error => console.log(error));
//   });
  
//   function displayExpenseOnScreen(expense) {
//     const expenseList = document.getElementById('expenseList');
//     const expenseItem = document.createElement("li");
//     expenseItem.setAttribute("data-id", expense.id);
//     expenseItem.innerHTML = `
//       ${expense.amount} - ${expense.description} - ${expense.category}
//       <button onclick="deleteExpense(${expense.id})">Delete</button>
//       <button onclick="editExpense(${expense.id}, ${expense.amount}, '${expense.description}', '${expense.category}')">Edit</button>
//     `;
//     expenseList.appendChild(expenseItem);
//   }
  
//   function deleteExpense(expenseId) {
//     const token = localStorage.getItem('token'); // Get the token from localStorage
//     axios.delete(`http://localhost:3000/expenses/${expenseId}`,  { headers: { "Authorization":token } })
//       .then(() => {
//         removeExpenseFromScreen(expenseId);
//       })
//       .catch(error => console.log(error));
//   }
  
//   function removeExpenseFromScreen(expenseId) {
//     const expenseItem = document.querySelector(`li[data-id='${expenseId}']`);
//     expenseItem.remove();
//   }
  
// document.getElementById('rzp-button1').onclick = async function (e) {
//   const token =localStorage.getItem('token');
//   const response = await axios.get ('http://localhost:3000/purchase/premiummembership', { headers :{ "Authorization" : token }});
// console.log(response);
// var options = {
//   "key" : response.data.key_id,
//   "order_id" : response.data.order.id, //for one time payment
//   //handler fxn will handle the success payment
//   "handler" : async function (response){
//     await axios.post("http://localhost:3000/purchase/updatetransactionstatus",{
//       order_id : options.order_id,
//       payment_id : response.razorpay_payment_id,
//     },{ headers : {"Authorization": token} })

//     alert('You are a premium user Now')
//   }
// };
// const rzp1 = new Razorpay(options);
// rzp1.open();
// e.preventDefault();
// rzp1.on('payment.failed', function (response){
//   console.log(response)
//   alert('Something went wrong');
// })
// }

// // document.getElementById('rzp-button1').onclick = async function (e) {
// //   const token = localStorage.getItem('token');
// //   try {
// //     const response = await axios.get('http://localhost:3000/purchase/premiummembership', {
// //       headers: {
// //         "Authorization": token
// //       }
// //     });

// //     // Extract necessary data from the response
// //     const { key_id, order } = response.data;

// //     // Create Razorpay options
// //     var options = {
// //       "key": key_id,
// //       "order_id": order.id,
// //       "handler": async function (response) {
// //         try {
// //           await axios.post("http://localhost:3000/purchase/updatetransactionstatus", {
// //             order_id: options.order_id,
// //             payment_id: response.razorpay_payment_id,
// //           }, {
// //             headers: {
// //               "Authorization": token
// //             }
// //           });

// //           // Handle successful payment (e.g., update UI, show success message)
// //           alert('You are a premium user Now'); 
// //           // Optionally: Refresh the page to reflect the updated premium status
// //           window.location.reload(); 

// //         } catch (error) {
// //           console.error(error);
// //           alert('Error updating transaction status');
// //         }
// //       }
// //     };

// //     const rzp1 = new Razorpay(options);
// //     rzp1.open();
// //     e.preventDefault();

// //     rzp1.on('payment.failed', function (response) {
// //       console.log(response);
// //       alert('Payment failed');
// //     });

// //   } catch (error) {
// //     console.error(error);
// //     alert('Something went wrong while fetching premium membership details');
// //   }
// // };



//   function updateExpenseOnScreen(expense) {
//     const expenseItem = document.querySelector(`li[data-id='${expense.id}']`);
//     expenseItem.innerHTML = `
//       ${expense.amount} - ${expense.description} - ${expense.category}
//       <button onclick="deleteExpense(${expense.id})">Delete</button>
//       <button onclick="editExpense(${expense.id}, ${expense.amount}, '${expense.description}', '${expense.category}')">Edit</button>
//     `;
//   }
  
//   function editExpense(expenseId, amount, description, category) {
//     document.getElementById('amount').value = amount;
//     document.getElementById('description').value = description;
//     document.getElementById('category').value = category;
//     document.getElementById('form').dataset.expenseId = expenseId;
//   }


function handleFormSubmit(event) {
  event.preventDefault();

  const expenseId = event.target.dataset.expenseId; 
  const expenseDetails = {
    amount: event.target.amount.value,
    description: event.target.description.value,
    category: event.target.category.value
  };

  const token = localStorage.getItem('token'); 

  if (expenseId) {
    axios.put(`http://localhost:3000/expenses/${expenseId}`, expenseDetails, { headers: { "Authorization": token } })
      .then(response => {
        updateExpenseOnScreen(response.data);
      })
      .catch(error => console.log(error));
  } else {
    axios.post("http://localhost:3000/expenses", expenseDetails, { headers: { "Authorization": token } })
      .then(response => {
        displayExpenseOnScreen(response.data);
      })
      .catch(error => console.log(error));
  }

  event.target.reset(); 
  delete event.target.dataset.expenseId; 
}

window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem('token');

  // Fetch user's premium status on page load
  axios.get("http://localhost:3000/user/status", { headers: { "Authorization": token } })
    .then(response => {
      const isPremium = response.data.isPremium;
      const buyPremiumButton = document.getElementById("buyPremiumButton");
      const premiumMessage = document.getElementById("premiumMessage"); 

      if (isPremium) {
        buyPremiumButton.style.display = "none"; 
        premiumMessage.style.display = "block"; 
      } else {
        buyPremiumButton.style.display = "block"; 
        premiumMessage.style.display = "none"; 
      }
    })
    .catch(error => {
      console.log(error);
    });

  // Fetch and display expenses
  axios.get("http://localhost:3000/expenses", { headers: { "Authorization": token } })
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
  const token = localStorage.getItem('token'); 
  axios.delete(`http://localhost:3000/expenses/${expenseId}`, { headers: { "Authorization": token } })
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
  const token = localStorage.getItem('token');
  const response = await axios.get('http://localhost:3000/purchase/premiummembership', { 
    headers: { "Authorization": token } 
  });

  var options = {
    "key": response.data.key_id,
    "order_id": response.data.order.id, 
    "handler": async function (response) {
      try {
        const paymentResponse = await axios.post("http://localhost:3000/purchase/updatetransactionstatus", {
          order_id: options.order_id,
          payment_id: response.razorpay_payment_id,
        }, { headers: { "Authorization": token } });

        if (paymentResponse.status === 202) {
          const newToken = paymentResponse.data.token; 
          localStorage.setItem('token', newToken); 

          if (paymentResponse.data.isPremium) { 
            buyPremiumButton.style.display = "none"; 
            premiumMessage.style.display = "block"; 
            // Enable premium features 
          } 
        }
      } catch (error) {
        console.error(error);
        alert('Error updating transaction status');
      }
    }
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();
  e.preventDefault();

  rzp1.on('payment.failed', function (response) {
    console.log(response);
    alert('Payment failed');
  });
};

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

async function showLeaderboard() {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3000/leaderboard', { 
      headers: { "Authorization": token } 
    });

    if (response.status === 200) {
      const leaderboardData = response.data; 

      // Clear existing leaderboard content (if any)
      const leaderboardContainer = document.getElementById('leaderboard'); 
      leaderboardContainer.innerHTML = '';

      // Create and display leaderboard entries
      leaderboardData.forEach(user => {
        const leaderboardEntry = document.createElement('div');
        leaderboardEntry.textContent = `${user.name}: ${user.totalExpenses}`; 
        leaderboardContainer.appendChild(leaderboardEntry);
      });

      // Show the leaderboard container
      leaderboardContainer.style.display = 'block'; 
    } else {
      console.error('Error fetching leaderboard data:', response); 
      alert('Failed to fetch leaderboard data.');
    }
  } catch (error) {
    console.error('Error fetching leaderboard data:', error); 
    alert('Failed to fetch leaderboard data.');
  }
}