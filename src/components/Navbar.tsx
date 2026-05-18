import { Link } from "react-router-dom"

const Navbar = () => {
  return (
    <nav>
        <ul>
            <Link to='/'><li>Home</li></Link>
            <Link to='/Dashboard'><li>Dashboard</li></Link>
            <Link to='/Login'><li>Login</li></Link>
        </ul>

        <button>Get Started</button>
    </nav>
  )
}

export default Navbar
