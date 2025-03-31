
import React from 'react';
import Navbar from '@/components/Navbar';
import LoginForm from '@/components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-16 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-serif text-center mb-8">Log In</h1>
          <LoginForm />
        </div>
      </main>
      
      <footer className="bg-estate-950 text-white py-6">
        <div className="container text-center text-white/50 text-sm">
          <p>&copy; {new Date().getFullYear()} EstateCraft. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
