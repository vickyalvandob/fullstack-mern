import React from 'react'

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding/Illustration */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-400 items-center justify-center p-8">
        <div className="text-white text-center">
          <div className="font-extrabold text-4xl mb-4 tracking-wide drop-shadow-lg">
            Task Manager
          </div>
          <div className="text-lg opacity-90 mb-8">
            Kelola tugas dan produktivitasmu dengan mudah dan modern.
          </div>
          {/* Optional: Tambahkan ilustrasi/logo di sini */}
          <svg
            width="120"
            height="120"
            viewBox="0 0 24 24"
            fill="none"
            className="mx-auto"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              fill="#fff"
              fillOpacity="0.1"
            />
            <path
              d="M8 12l2 2l4-4"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      {/* Right Side - Form */}
      <div className="flex flex-1 items-center justify-center bg-white p-6 md:p-0">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl px-8 py-10 flex flex-col items-center gap-6">
          <div className="md:hidden font-bold text-3xl text-blue-600 mb-2 tracking-wide">
            Task Manager
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}

export default AuthLayout