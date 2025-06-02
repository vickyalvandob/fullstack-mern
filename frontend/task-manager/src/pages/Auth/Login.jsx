import React from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { useNavigate } from 'react-router-dom'
import axios from '../../utils/axiosInstance'

const Login = () => {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState(null)
  const [loading, setLoading] = React.useState(false)

  const navigate = useNavigate();

  // handle login form submit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      // Simpan token/user ke localStorage/session
      localStorage.setItem('user', JSON.stringify(res.data));
      setLoading(false);
      navigate('/'); // redirect ke dashboard/home
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.message || 'Login failed, please try again.'
      );
    }
  };

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} className="w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center text-sm">{error}</div>
        )}
        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700">Email</label>
          <input
            type="email"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="mb-6">
          <label className="block mb-1 font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-4 text-center text-sm text-gray-600">
          Belum punya akun?{' '}
          <a href="/auth/signup" className="text-blue-600 hover:underline">Daftar</a>
        </div>
      </form>
    </AuthLayout>
  )
}

export default Login