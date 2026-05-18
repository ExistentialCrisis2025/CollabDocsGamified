import './App.css'

import './index.css';

import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

import {Routes, Route} from 'react-router-dom';

import api from './api/axios';

function App() {

 
  return(
    <div>

      <Routes>
        <Route path='/' element={<Login />}></Route>
        <Route path='/signup' element={<Signup />}></Route>
        <Route path='/dashboard' element={<Dashboard />}></Route>
      </Routes>
      
    </div>
  )
}
export default App
