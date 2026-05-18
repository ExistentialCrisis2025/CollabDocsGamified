import {useState} from 'react';

const Signup = () => {
  const [username,setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  
  function handleUsernameInput(e:React.ChangeEvent<HTMLInputElement>){
    setUsername(e.target.value);
  }
  
  function handlePasswordInput(e:React.ChangeEvent<HTMLInputElement>){
    setPassword(e.target.value);
  }
  
  function handlePasswordConfirmation(e:React.ChangeEvent<HTMLInputElement>){
    setConfirmPassword(e.target.value);
  }
  
  function handleSubmit(e:React.SubmitEvent<HTMLFormElement>){
    e.preventDefault()

    if(password.length<8) alert("Password Length Should be More than 8 letters");
    else{
      console.log(username);
      console.log(password);
      console.log(confirmPassword);
    
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    }
  }
          
  return (
    <form onSubmit={handleSubmit}>
        <div className="container">
          <label htmlFor="uname" className="uname">Username</label>
          <input type="text" placeholder='Enter Username' name='uname' required onChange={handleUsernameInput} value={username}/>
                  
  
          <label htmlFor="psw">Password</label>
          <input type="password" placeholder='Enter Password' name='psw' required onChange={handlePasswordInput} value={password}/>

          <label htmlFor="confirmPsw">Confirm Password</label>
          <input type="password" placeholder='Retype your password' name='confirmPsw' required onChange={handlePasswordConfirmation} value={confirmPassword} />
  
          <button type='submit'>SignUp</button>
  
          
          </div>
  
  
    </form>
  )
}

export default Signup
