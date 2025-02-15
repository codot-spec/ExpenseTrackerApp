function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  
    return JSON.parse(jsonPayload);
  }
  
  
  // Fetch and display user profile
  function fetchAndDisplayProfile() {
      const token = localStorage.getItem('token');
    const decodedToken = parseJwt(token);
    const userId = decodedToken.userId;
      axios.get(`http://localhost:3000/user/${userId}`, { headers: { "Authorization": token } })
        .then(response => {
          const user = response.data;  // Assuming the response has user data
          // Display the user details
          document.getElementById('profileName').textContent = user.name;
          document.getElementById('profileEmail').textContent = user.email;
         // document.getElementById('profilePassword').textContent = user.password;  // Don't display actual password in production
    
          // Set up edit and delete button actions
          document.getElementById('editButton').onclick = () => editUser(user.id, user.name, user.email, user.password);
          document.getElementById('deleteButton').onclick = () => deleteProfile(user.id);
        })
        .catch(error => console.log(error));
    }
    
    // Handle form submission for editing user profile
    function handleFormSubmit(event) {
      event.preventDefault();
    
      const userId = event.target.dataset.userId;
      const userDetails = { 
        name: event.target.name.value,
        email: event.target.email.value,
        password: event.target.password.value
      };
    
      const token = localStorage.getItem('token');
      axios.put(`http://localhost:3000/user/${userId}`, 
        userDetails, { headers: { "Authorization": token } })
        .then(response => {
          reloadProfile();  // Reload profile after successful update
        })
        .catch(error => console.log(error));
    
      event.target.reset();  // Reset form after submission
      delete event.target.dataset.userId; 
    }
    
    // Delete the user profile
    function deleteProfile(userId) {
      const token = localStorage.getItem('token');
      axios.delete(`http://localhost:3000/user/${userId}`, { headers: { "Authorization": token } })
        .then(() => {
          alert('User deleted');
          window.location.href = 'http://localhost:3000';  // Redirect to home or login page after deletion
        })
        .catch(error => console.log(error));
    }
    
    // Edit the user profile
    function editUser(userId, name, email, password) {
      // Show the edit form and populate the fields
      document.getElementById('editForm').style.display = 'block';
      document.getElementById('profile').style.display = 'none';
    
      document.getElementById('editName').value = name;
      document.getElementById('editEmail').value = email;
      document.getElementById('editPassword').value = password;
    
      // Set the userId in the form's data attribute for later submission
      document.getElementById('form').dataset.userId = userId;
    }
    
    // Reload profile after edit
    function reloadProfile() {
      const token = localStorage.getItem('token');
      const decodedToken = parseJwt(token);
      const userId = decodedToken.userId;
      axios.get(`http://localhost:3000/user/${userId}`, { headers: { "Authorization": token } })
        .then(response => {
          const user = response.data;  // Assuming the response has user data
    
          // Display the user details again after the update
          document.getElementById('profileName').textContent = user.name;
            document.getElementById('profileEmail').textContent = user.email;
           // document.getElementById('profilePassword').textContent = user.password;  // Don't display actual password in production
    
          // Hide edit form and show profile again
          document.getElementById('editForm').style.display = 'none';
          document.getElementById('profile').style.display = 'block';
        })
        .catch(error => console.log(error));
    }
    
    // Display user profile when page loads
    window.addEventListener('DOMContentLoaded', fetchAndDisplayProfile);
  
  
    function logout() {
      localStorage.clear();
      window.location.href = "http://localhost:3000";
    }