import React from 'react'
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import store from './store/store';
import Home from './components/Home';
import SignUp from './components/Auth/SignUp';
import Login from './components/Auth/Login';
import Profile from "./components/Profile"
import GameModeSelector from './components/GameModeSelector';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/modeselector" element={<GameModeSelector />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
