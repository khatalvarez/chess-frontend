import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Home from "./components/Home"
import SignUp from "./components/SignUp"
import Login from "./components/Login"
import Footer from "./components/Footer"
import Navbar from "./components/Navbar"

const App = () => {
  return (
    <Router>
      <div className="w-[100vw] h-fit">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App

