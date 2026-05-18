import {useState} from 'react';


import api from '../api/axios';

const Login = () => {
    const [email,setEmail] = useState('');
    const [password,setPassword] = useState('');
    const [remember,setRemember] = useState(false);

    function handleEmailInput(e:React.ChangeEvent<HTMLInputElement>){
        setEmail(e.target.value);
    }

    function handlePasswordInput(e:React.ChangeEvent<HTMLInputElement>){
        setPassword(e.target.value);
    }

    function handleRemember(){
        setRemember(!remember);
    }

    function handleSubmit(e:React.SubmitEvent<HTMLFormElement>){
        e.preventDefault()

        const userData = {
            email,
            password,
            remember
        };

        const sendData = async () => {
            try{
                const response = await api.post('/tempUserIDs',userData);
                console.log('Success: ',response.data);
            } catch(error){
                console.error("Error sending data:",error);
            }
        };

        sendData();

        console.log(email);
        console.log(password);

        setEmail('');
        setPassword('');
        setRemember(false);
    }
        
    return (
        <form onSubmit={handleSubmit}>
            <div className="container">
                <label htmlFor="email" className="email">Email ID</label>
                <input type="email" placeholder='Enter Email' name='email' required onChange={handleEmailInput} value={email}/>
                

                <label htmlFor="psw">Password</label>
                <input type="password" placeholder='Enter Password' name='psw' required onChange={handlePasswordInput} value={password}/>

                <button type='submit' >Login</button>

                <label htmlFor="">
                    <input type="checkbox" name='remember' checked={remember} onChange={handleRemember}/>
                    Remember Me
                </label>
            </div>


        </form>
  )
}

export default Login
