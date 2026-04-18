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

  const navigate = useNavigate()

  const { signIn } = authClient
  const { signUp } = authClient
  const { data: session } = authClient.useSession()

  useEffect(() => {
    if (session?.user) {
      navigate('/')
    }
  }, [session, navigate])

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    setIsLoading(true)

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
          toast.success('Account created successfully!')
          setState('Login')
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
          toast.success('Signed in successfully!')
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
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>
        {state === 'Sign Up'
          ? <div className='w-full '>
            <p>Full Name</p>
            <input onChange={(e) => setName(e.target.value)} value={name} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="text" required />
          </div>
          : null
        }
        <div className='w-full '>
          <p>Email</p>
          <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="email" required />
        </div>
        <div className='w-full '>
          <p>Password</p>
          <input onChange={(e) => setPassword(e.target.value)} value={password} className='border border-[#DADADA] rounded w-full p-2 mt-1' type="password" required />
        </div>
        <button 
          className='bg-primary text-white w-full py-2 my-2 rounded-md text-base disabled:opacity-50' 
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : state === 'Sign Up' ? 'Create account' : 'Login'}
        </button>
        {state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => setState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
          : <p>Create an new account? <span onClick={() => setState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login
