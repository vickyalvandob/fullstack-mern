import React, { useState } from 'react';
import { faRegEye, faRegEyeSlash } from 'react-icons/fa6';


const Input = ({value, onChange, label, placeholder, type}) => {
  
  const [showPassword, setShowPassword] = React.useState(false)
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }
  
  return (
    <div>
      <label className='text-[13px] text-slate-800'>
      {label}
      </label>
      <div className="input-box">
        <input
          type={type || 'text'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600 focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <faRegEyeSlash className="w-5 h-5" />
            ) : (
              <faRegEye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      <div className="text-red-500 text-xs mt-1">
        {/* Optional: Display error message here */}
      </div>
    </div>
  )
}

export default Input