import React from 'react'
import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import store from './store/store';
import Home from './components/Home';

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Home />} />
        </Routes>
      </Router>
    </Provider>
  )
}

export default App
