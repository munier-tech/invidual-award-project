import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import useAuthStore from '../store/authStore'

const schema = yup.object({
  newPassword: yup
    .string()
    .min(6, 'Password cusub wuxuu noqon karaa ugu yaraan 6 xaraf')
    .required('Fadlan geli password cusub'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords are not matching')
    .required('Fadlan hubi passwordka')
})

function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { resetPassword, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  const onSubmit = async (data) => {
    if (!token) {
      return
    }

    const result = await resetPassword({ token, newPassword: data.newPassword })
    if (result.success) {
      navigate('/login')
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">Token lama helin</h2>
          <p className="mt-3 text-sm text-gray-600">Fadlan isticmaal linkga saxda ah ee dib u hagaajinta passwordka.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">Cusbooneysii Passwordka</h2>
          <p className="mt-2 text-sm text-gray-600">Geli password cusub si aad dib u hagaajiso akoonkaaga.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Password Cusub
            </label>
            <div className="relative">
              <input
                {...register('newPassword')}
                type={showPassword ? 'text' : 'password'}
                id="newPassword"
                className="block w-full pl-3 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Geli password cusub"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Hubi Passwordka
            </label>
            <div className="relative">
              <input
                {...register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="block w-full pl-3 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Dib u qor passwordka"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center text-black py-3 px-4 border border-black rounded-lg shadow-sm text-sm font-medium disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                Cusbooneysiinaya...
              </>
            ) : (
              'Cusbooneysii Passwordka'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ResetPassword
