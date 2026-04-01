
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import {Calculator, Send, User, MapPin, Wrench, Calendar} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { lumi } from '../lib/lumi'

interface QuoteFormData {
  name: string
  email: string
  phone: string
  street: string
  number: string
  neighborhood: string
  city: string
  cep: string
  serviceType: string
  projectType: string
  description: string
  scheduledDate: string
  scheduledTime: string
}

interface BlockedDate {
  _id: string
  date: string
  reason: string
  isFullDay: boolean
  blockedHours?: string[]
}

export default function Quote() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [scheduledTimes, setScheduledTimes] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [availableHours, setAvailableHours] = useState<number[]>([])
  const { isAuthenticated, signIn, user } = useAuth()
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<QuoteFormData>()

  // Load blocked dates and existing bookings
  useEffect(() => {
    const loadBlockedDates = async () => {
      try {
        const { list } = await lumi.entities.blocked_dates.list({})
        setBlockedDates(list)
      } catch (error) {
        console.error('Error loading blocked dates:', error)
      }
    }

    const loadScheduledTimes = async () => {
      try {
        const { list } = await lumi.entities.quote_requests.list({
          filter: { scheduledDate: { $exists: true } }
        })
        const times = list.map((q: any) => q.scheduledDate!)
        setScheduledTimes(times)
      } catch (error) {
        console.error('Error loading scheduled times:', error)
      }
    }

    loadBlockedDates()
    loadScheduledTimes()
  }, [])

  React.useEffect(() => {
    if (user) {
      setValue('name', user.userName || '')
      setValue('email', user.email || '')
    }
  }, [user, setValue])

  const serviceTypes = [
    'Instalações Residenciais',
    'Instalações Comerciais',
    'Manutenção Elétrica',
    'Ar Condicionado',
    'Energia Solar'
  ]

  const projectTypes = [
    'Obra Nova',
    'Reforma',
    'Ampliação',
    'Manutenção',
    'Emergência'
  ]

  const getAvailableHoursForDate = (dateStr: string): number[] => {
    const allHours = Array.from({ length: 9 }, (_, i) => i + 8) // 8-16 (8h to 16h only)
    
    const availableHours = allHours.filter(hour => {
      // Parse date string and create UTC date to avoid timezone shifts
      const [year, month, day] = dateStr.split('-').map(Number)
      const testDateTime = new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0))
      const isoString = testDateTime.toISOString()
      
      // Check if hour is blocked by admin - compare using UTC date components
      const isBlocked = blockedDates.some(blocked => {
        const blockedDate = new Date(blocked.date)
        const blockedDateStr = `${blockedDate.getUTCFullYear()}-${String(blockedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(blockedDate.getUTCDate()).padStart(2, '0')}`
        
        if (blockedDateStr !== dateStr) return false
        if (blocked.isFullDay) return true
        if (blocked.blockedHours?.includes(`${hour}:00`)) return true
        return false
      })
      
      if (isBlocked) return false
      
      // Check if hour is already scheduled
      const isOccupied = scheduledTimes.some(time => {
        const scheduledDate = new Date(time)
        return scheduledDate.toISOString() === isoString
      })
      
      return !isOccupied
    })
    
    // Remove duplicates using Set
    return Array.from(new Set(availableHours)).sort((a, b) => a - b)
  }

  const getAvailableDates = (): string[] => {
    const availableDates: string[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Check next 90 days
    for (let i = 0; i < 90; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() + i)
      const dateStr = checkDate.toISOString().split('T')[0]
      
      // Check if date is fully blocked - compare using UTC date components
      const isFullyBlocked = blockedDates.some(blocked => {
        const blockedDate = new Date(blocked.date)
        const blockedDateStr = `${blockedDate.getUTCFullYear()}-${String(blockedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(blockedDate.getUTCDate()).padStart(2, '0')}`
        return blockedDateStr === dateStr && blocked.isFullDay
      })
      
      if (!isFullyBlocked) {
        const availableHours = getAvailableHoursForDate(dateStr)
        if (availableHours.length > 0) {
          availableDates.push(dateStr)
        }
      }
    }
    
    return availableDates
  }

  const handleDateSelection = (date: string) => {
    setSelectedDate(date)
    const hours = getAvailableHoursForDate(date)
    setAvailableHours(hours)
    setSelectedHour(null)
    // Update form values
    setValue('scheduledDate', date)
    setValue('scheduledTime', '')
  }

  const handleHourSelection = (hour: number) => {
    setSelectedHour(hour)
    if (selectedDate) {
      // Parse date string and create UTC date to avoid timezone shifts
      const [year, month, day] = selectedDate.split('-').map(Number)
      const dateTime = new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0))
      // Update form value with time string
      setValue('scheduledTime', `${String(hour).padStart(2, '0')}:00`)
    }
  }

  const onSubmit = async (data: QuoteFormData) => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para solicitar um orçamento')
      await signIn()
      return
    }

    setIsSubmitting(true)
    
    try {
      // Combine date and time into ISO datetime using UTC
      const [year, month, day] = data.scheduledDate.split('-').map(Number)
      const hour = parseInt(data.scheduledTime.split(':')[0])
      const scheduledDateTime = new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0)).toISOString()

      // 1. Salvar no banco de dados MongoDB
      const quoteRecord = await lumi.entities.quote_requests.create({
        name: data.name,
        email: data.email,
        phone: data.phone,
        street: data.street,
        number: data.number,
        neighborhood: data.neighborhood,
        city: data.city,
        cep: data.cep,
        serviceType: data.serviceType,
        projectType: data.projectType,
        description: data.description,
        scheduledDate: scheduledDateTime,
        status: 'pending',
        userId: user?.userId || 'anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      // 2. Enviar email para a empresa
      const emailResult = await lumi.functions.invoke('sendQuoteEmail', {
        method: 'POST',
        body: data
      })

      if (emailResult.success) {
        toast.success('Orçamento enviado com sucesso! Salvamos seus dados e enviamos por e-mail para nossa equipe.')
        // Reset form and states
        setStep(1)
        setSelectedDate('')
        setSelectedHour(null)
        setAvailableHours([])
      } else {
        // Mesmo se o email falhar, o orçamento foi salvo no banco
        toast.success('Orçamento salvo com sucesso! Entraremos em contato em breve.')
        console.warn('Email não enviado:', emailResult.error)
        setStep(1)
        setSelectedDate('')
        setSelectedHour(null)
        setAvailableHours([])
      }
      
    } catch (error) {
      console.error('Erro ao processar orçamento:', error)
      toast.error('Erro ao enviar solicitação. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (step < 2) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Necessário
          </h2>
          <p className="text-gray-600 mb-6">
            Para solicitar um orçamento, você precisa estar logado em nossa plataforma.
          </p>
          <button
            onClick={signIn}
            className="w-full bg-gradient-to-r from-blue-600 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Fazer Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="bg-gradient-to-r from-blue-600 to-yellow-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Calculator className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Solicitar Orçamento
          </h1>
          <p className="text-xl text-gray-600">
            Preencha o formulário abaixo e receba seu orçamento personalizado
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step >= num ? 'bg-gradient-to-r from-blue-600 to-yellow-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {num}
                </div>
                {num < 2 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step > num ? 'bg-gradient-to-r from-blue-600 to-yellow-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-16 mt-2">
            <span className="text-sm text-gray-600">Dados Pessoais</span>
            <span className="text-sm text-gray-600">Projeto e Detalhes</span>
          </div>
        </div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Step 1: Personal Data */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-6">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Dados Pessoais</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo *
                    </label>
                    <input
                      {...register('name', { required: 'Nome é obrigatório' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Seu nome completo"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      {...register('email', { 
                        required: 'Email é obrigatório',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Email inválido'
                        }
                      })}
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="seu@email.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone *
                    </label>
                    <input
                      {...register('phone', { required: 'Telefone é obrigatório' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="(11) 99999-9999"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

                {/* Endereço separado */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                    Endereço
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rua/Avenida *
                      </label>
                      <input
                        {...register('street', { required: 'Rua é obrigatória' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome da rua/avenida"
                      />
                      {errors.street && (
                        <p className="text-red-500 text-sm mt-1">{errors.street.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número *
                      </label>
                      <input
                        {...register('number', { required: 'Número é obrigatório' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="123"
                      />
                      {errors.number && (
                        <p className="text-red-500 text-sm mt-1">{errors.number.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bairro *
                      </label>
                      <input
                        {...register('neighborhood', { required: 'Bairro é obrigatório' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome do bairro"
                      />
                      {errors.neighborhood && (
                        <p className="text-red-500 text-sm mt-1">{errors.neighborhood.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cidade *
                      </label>
                      <input
                        {...register('city', { required: 'Cidade é obrigatória' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Sua cidade"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CEP *
                      </label>
                      <input
                        {...register('cep', { required: 'CEP é obrigatório' })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="12345-678"
                      />
                      {errors.cep && (
                        <p className="text-red-500 text-sm mt-1">{errors.cep.message}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Project Details and Description Combined */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-6">
                  <Wrench className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Projeto e Detalhes</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Serviço *
                    </label>
                    <select
                      {...register('serviceType', { required: 'Selecione o tipo de serviço' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {serviceTypes.map((service) => (
                        <option key={service} value={service}>{service}</option>
                      ))}
                    </select>
                    {errors.serviceType && (
                      <p className="text-red-500 text-sm mt-1">{errors.serviceType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Projeto *
                    </label>
                    <select
                      {...register('projectType', { required: 'Selecione o tipo de projeto' })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecione...</option>
                      {projectTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    {errors.projectType && (
                      <p className="text-red-500 text-sm mt-1">{errors.projectType.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Data e Hora da Visita *</label>
                    
                    {/* Visual Calendar */}
                    <div className="mb-4">
                      <label className="block text-sm text-gray-600 mb-2">📅 Selecione a Data</label>
                      <div className="grid grid-cols-7 gap-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {/* Calendar Header */}
                        <div className="col-span-7 text-center font-semibold text-gray-700 mb-2 pb-2 border-b">
                          {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).charAt(0).toUpperCase() + new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).slice(1)}
                        </div>
                        
                        {/* Weekday Headers */}
                        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                            {day}
                          </div>
                        ))}
                        
                        {/* Calendar Days */}
                        {(() => {
                          const today = new Date()
                          const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                          const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
                          const startingDayOfWeek = firstDay.getDay()
                          const availableDates = getAvailableDates()
                          const days = []
                          
                          // Empty cells before first day
                          for (let i = 0; i < startingDayOfWeek; i++) {
                            days.push(<div key={`empty-${i}`} className="aspect-square"></div>)
                          }
                          
                          // Calendar days
                          for (let day = 1; day <= lastDay.getDate(); day++) {
                            const dateStr = new Date(today.getFullYear(), today.getMonth(), day).toISOString().split('T')[0]
                            const isAvailable = availableDates.includes(dateStr)
                            const isSelected = selectedDate === dateStr
                            const isPast = new Date(dateStr) < new Date(today.toISOString().split('T')[0])
                            
                            days.push(
                              <button
                                key={day}
                                type="button"
                                onClick={() => isAvailable ? handleDateSelection(dateStr) : null}
                                disabled={!isAvailable || isPast}
                                className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                                  isSelected
                                    ? 'bg-gradient-to-r from-blue-600 to-yellow-600 text-white shadow-lg scale-105'
                                    : isAvailable
                                    ? 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 cursor-pointer'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                {day}
                              </button>
                            )
                          }
                          
                          return days
                        })()}
                      </div>
                      
                      <div className="mt-2 flex items-center justify-center space-x-4 text-xs text-gray-600">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-white border border-gray-200 rounded mr-1"></div>
                          <span>Disponível</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gray-100 rounded mr-1"></div>
                          <span>Indisponível</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-yellow-600 rounded mr-1"></div>
                          <span>Selecionado</span>
                        </div>
                      </div>
                    </div>

                    {/* Hour Selection */}
                    {selectedDate && availableHours.length > 0 && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">⏰ Selecione o Horário</label>
                        <div className="grid grid-cols-3 gap-2">
                          {availableHours.map(hour => (
                            <button
                              key={hour}
                              type="button"
                              onClick={() => handleHourSelection(hour)}
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                selectedHour === hour
                                  ? 'bg-gradient-to-r from-blue-600 to-yellow-600 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {String(hour).padStart(2, '0')}:00
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDate && selectedHour !== null && (
                      <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                        ✅ Agendamento selecionado: {(() => {
                          const [year, month, day] = selectedDate.split('-')
                          return `${day}/${month}/${year}`
                        })()} às {String(selectedHour).padStart(2, '0')}:00
                      </div>
                    )}

                    {/* Hidden inputs for form validation */}
                    <input type="hidden" {...register('scheduledDate', { required: 'Selecione a data' })} />
                    <input type="hidden" {...register('scheduledTime', { required: 'Selecione o horário' })} />
                    {(errors.scheduledDate || errors.scheduledTime) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.scheduledDate?.message || errors.scheduledTime?.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description Section */}
                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descreva seu projeto em detalhes *
                  </label>
                  <textarea
                    {...register('description', { required: 'Descrição é obrigatória' })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva o que você precisa, incluindo detalhes específicos, localização dos pontos elétricos, materiais desejados, etc."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Resumo da Solicitação:</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Serviço:</strong> {watch('serviceType') || 'Não informado'}</p>
                    <p><strong>Projeto:</strong> {watch('projectType') || 'Não informado'}</p>
                    <p><strong>Data da Visita:</strong> {selectedDate ? (() => {
                      const [year, month, day] = selectedDate.split('-')
                      return `${day}/${month}/${year}`
                    })() : 'Não informado'}</p>
                    <p><strong>Horário:</strong> {selectedHour !== null ? `${String(selectedHour).padStart(2, '0')}:00` : 'Não informado'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 1}
                className={`px-6 py-3 rounded-lg font-semibold ${
                  step === 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Anterior
              </button>

              {step < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Próximo
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Solicitação
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
