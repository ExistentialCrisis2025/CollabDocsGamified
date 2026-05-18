import {useState} from 'react';

const Login = () => {
    const [username,setUsername] = useState('');
    const [password,setPassword] = useState('');
    const [remember,setRemember] = useState(false);

    function handleUsernameInput(e:React.ChangeEvent<HTMLInputElement>){
        setUsername(e.target.value);
    }

    function handlePasswordInput(e:React.ChangeEvent<HTMLInputElement>){
        setPassword(e.target.value);
    }

    function handleRemember(){
        setRemember(!remember);
    }

    function handleSubmit(e:React.SubmitEvent<HTMLFormElement>){
        e.preventDefault()

        console.log(username);
        console.log(password);

        setUsername('');
        setPassword('');
        setRemember(false);
    }
        
    return (
        <form>
            <div className="container">
                <label htmlFor="uname" className="uname">Username</label>
                <input type="text" placeholder='Enter Username' name='uname' required onChange={handleUsernameInput} value={username}/>
                

                <label htmlFor="psw">Password</label>
                <input type="password" placeholder='Enter Password' name='psw' required onChange={handlePasswordInput} value={password}/>

                <button type='submit' onSubmit={handleSubmit}>Login</button>

                <label htmlFor="">
                    <input type="checkbox" name='remember' checked={remember} onChange={handleRemember}/>
                    Remember Me
                </label>
            </div>


        </form>
  )
}

export default Login
