import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { authClient } from '../api/auth'

const Login = () => {
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()

  const { signIn } = authClient
  const { signUp } = authClient
  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (session?.user) {
      navigate('/')
    }
  }, [session, navigate])

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  }

  const validatePassword = (password, isSignUp) => {
    if (isSignUp && password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    return null
  }

  const handleBlur = (field) => {
    const newErrors = { ...errors }
    if (field === 'email' && email && !validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    } else if (field === 'email') {
      delete newErrors.email
    }
    if (field === 'password' && password) {
      const pwError = validatePassword(password, state === 'Sign Up')
      if (pwError) {
        newErrors.password = pwError
      } else {
        delete newErrors.password
      }
    }
    setErrors(newErrors)
  }

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setIsLoading(true)

    const newErrors = {}
    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (validatePassword(password, state === 'Sign Up')) {
      newErrors.password = validatePassword(password, state === 'Sign Up')
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsLoading(false)
      return
    }

    try {
      if (state === 'Sign Up') {
        const { error } = await signUp.email({
          email,
          password,
          name
        }, {
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Sign up failed')
          }
        })

        if (!error) {
          toast.success('Account created! Welcome aboard.')
          setState('Login')
          setName('')
          setPassword('')
        }
      } else {
        const { error } = await signIn.email({
          email,
          password
        }, {
          onError: (ctx) => {
            toast.error(ctx.error.message || 'Sign in failed')
          }
        })

        if (!error) {
          toast.success('Welcome back!')
          navigate('/')
        }
      }
    } catch (err) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-[85vh] flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-primary/5 p-8 sm:p-10 border border-primary/5'>
          <div className='text-center mb-8'>
            <h1 className='text-2xl sm:text-3xl font-semibold text-gray-800 mb-2'>
              {state === 'Sign Up' ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className='text-gray-500 text-sm'>
              {state === 'Sign Up' 
                ? 'Sign up to book your appointments' 
                : 'Sign in to continue to your appointments'}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className='space-y-5'>
            {state === 'Sign Up' && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Full Name
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className='w-full px-4 py-3 rounded-lg border border-gray-200 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200'
                  type="text"
                  required
                  placeholder="Enter your full name"
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Email
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                value={email}
                className={`w-full px-4 py-3 rounded-lg border text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                  errors.email 
                    ? 'border-red-300 focus:border-red-400' 
                    : 'border-gray-200 focus:border-primary'
                }`}
                type="email"
                required
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className='text-red-500 text-xs mt-1.5'>{errors.email}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Password
              </label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                value={password}
                className={`w-full px-4 py-3 rounded-lg border text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${
                  errors.password 
                    ? 'border-red-300 focus:border-red-400' 
                    : 'border-gray-200 focus:border-primary'
                }`}
                type="password"
                required
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className='text-red-500 text-xs mt-1.5'>{errors.password}</p>
              )}
            </div>

            <button 
              className='w-full py-3.5 mt-2 rounded-lg bg-primary text-white font-medium text-sm 
                disabled:opacity-50 disabled:cursor-not-allowed 
                hover:opacity-90 active:scale-[0.99] transition-all duration-200'
              disabled={isLoading}
            >
              {isLoading ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {state === 'Sign Up' ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                state === 'Sign Up' ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <div className='mt-6 pt-6 border-t border-gray-100 text-center'>
            {state === 'Sign Up' ? (
              <p className='text-sm text-gray-500'>
                Already have an account?{' '}
                <button 
                  onClick={() => {
                    setState('Login')
                    setErrors({})
                  }}
                  className='text-primary font-medium hover:underline'
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p className='text-sm text-gray-500'>
                Don't have an account?{' '}
                <button 
                  onClick={() => {
                    setState('Sign Up')
                    setErrors({})
                  }}
                  className='text-primary font-medium hover:underline'
                >
                  Create one
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
