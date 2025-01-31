import { div } from 'framer-motion/client';
import bgImage from "../assets/bgChess.jpg";
import React from 'react';

const SignUp = () => {
  return (
    <div className='relative min-h-screen flex flex-col'>
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className='relative flex-grow flex items-center justify-center px-4 sm:px-8'>
        <h1>Hello</h1>
      </div>

    </div>
  );
};

export default SignUp;
