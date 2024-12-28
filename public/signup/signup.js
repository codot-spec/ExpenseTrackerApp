async function SignUp(event){
    try{
      event.preventDefault();
      console.log(event.target.email.value);
      const userDetails = {
        name: event.target.name.value,
        email: event.target.email.value,
        password: event.target.password.value,
      };

     console.log(userDetails);
      const response = await  axios.post("http://localhost:3000/user/sign-up", userDetails)
      if(response.status === 201){
         window.location.href = "../login/login.html"
      }
      else{
        throw new Error("Failed to signup")
      }
    }
    catch(err){
      document.body.innerHTML += `<div style="color:red;">${err} <div> `
    }
}