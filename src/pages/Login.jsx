import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { authClient } from '../api/auth'

const Login = () => {
  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const { t } = useTranslation()
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
      return t('auth.passwordMinChars')
    }
    return null
  }

  const handleBlur = (field) => {
    const newErrors = { ...errors }
    if (field === 'email' && email && !validateEmail(email)) {
      newErrors.email = t('auth.pleaseEnterValidEmail')
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
      newErrors.email = t('auth.pleaseEnterValidEmail')
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
            toast.error(ctx.error.message || t('auth.signUpFailed'))
          }
        })

        if (!error) {
          toast.success(t('auth.accountCreated'))
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
            toast.error(ctx.error.message || t('auth.signInFailed'))
          }
        })

        if (!error) {
          toast.success(t('auth.welcomeBackMsg'))
          navigate('/')
        }
      }
    } catch (err) {
      toast.error(err.message || t('auth.errorOccurred'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-[80vh] flex items-center justify-center py-12 px-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-sm border border-border-light p-8 sm:p-10'>
          <div className='text-center mb-8'>
            <h1 className='text-2xl sm:text-3xl font-display font-bold text-text mb-1.5'>
              {state === 'Sign Up' ? t('auth.createAccount') : t('auth.welcomeBack')}
            </h1>
            <p className='text-text-secondary text-sm'>
              {state === 'Sign Up' 
                ? t('auth.signUpPrompt')
                : t('auth.signInPrompt')}
            </p>
          </div>

          <form onSubmit={onSubmitHandler} className='space-y-4'>
            {state === 'Sign Up' && (
              <div>
                <label className='block text-sm font-medium text-text mb-1'>
                  {t('auth.fullName')}
                </label>
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className='w-full px-4 py-2.5 rounded-xl border border-border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all duration-200'
                  type="text"
                  required
                  placeholder={t('auth.enterFullName')}
                  disabled={isLoading}
                />
              </div>
            )}

            <div>
              <label className='block text-sm font-medium text-text mb-1'>
                {t('auth.email')}
              </label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                value={email}
                className={`w-full px-4 py-2.5 rounded-xl border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-200 ${
                  errors.email 
                    ? 'border-rose focus:border-rose' 
                    : 'border-border focus:border-primary'
                }`}
                type="email"
                required
                placeholder={t('auth.enterEmail')}
                disabled={isLoading}
              />
              {errors.email && (
                <p className='text-rose text-xs mt-1 font-medium'>{errors.email}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-text mb-1'>
                {t('auth.password')}
              </label>
              <div className='relative'>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                  value={password}
                  className={`w-full px-4 py-2.5 rounded-xl border text-text text-sm focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all duration-200 pr-10 ${
                    errors.password 
                      ? 'border-rose focus:border-rose' 
                      : 'border-border focus:border-primary'
                  }`}
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder={t('auth.enterPassword')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text transition-colors'
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className='text-rose text-xs mt-1 font-medium'>{errors.password}</p>
              )}
            </div>

            <button
              className='w-full py-3 mt-1 rounded-xl bg-primary text-white font-semibold text-sm
                disabled:opacity-50 disabled:cursor-not-allowed
                hover:bg-primary-dark active:scale-[0.98] transition-all duration-200' 
              disabled={isLoading}
            >
              {isLoading ? (
                <span className='flex items-center justify-center gap-2'>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {state === 'Sign Up' ? t('auth.creatingAccount') : t('auth.signingIn')}
                </span>
              ) : (
                state === 'Sign Up' ? t('auth.createAccountBtn') : t('auth.signInBtn')
              )}
            </button>
          </form>

          <div className='mt-6 pt-6 border-t border-border-light text-center'>
            {state === 'Sign Up' ? (
              <p className='text-sm text-text-secondary'>
                {t('auth.alreadyHaveAccount')}{' '}
                <button 
                  onClick={() => {
                    setState('Login')
                    setErrors({})
                  }}
                  className='text-primary font-semibold hover:underline'
                >
                  {t('auth.signIn')}
                </button>
              </p>
            ) : (
              <p className='text-sm text-text-secondary'>
                {t('auth.dontHaveAccount')}{' '}
                <button 
                  onClick={() => {
                    setState('Sign Up')
                    setErrors({})
                  }}
                  className='text-primary font-semibold hover:underline'
                >
                  {t('auth.createOne')}
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