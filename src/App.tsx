import './App.css'

import './index.css';

import Navbar from './components/Navbar'
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

import { Routes,Route } from 'react-router-dom';


function App() {
  return(
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />}/>
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/Login' element={<Login />} />
      </Routes>
    </div>
  )
}
export default App
