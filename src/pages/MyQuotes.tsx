import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {FileText, Edit, Trash2, Plus, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { lumi } from '../lib/lumi'

interface QuoteRequest {
  _id: string
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
  scheduledDate?: string
  status: 'pending' | 'approved' | 'rejected' | 'in_progress' | 'completed'
  userId: string
  createdAt: string
  updatedAt: string
}

interface BlockedDate {
  _id: string
  date: string
  reason: string
  isFullDay: boolean
  blockedHours?: string[]
}

export default function MyQuotes() {
  const { isAuthenticated, signIn, user } = useAuth()
  const navigate = useNavigate()
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuote, setEditingQuote] = useState<QuoteRequest | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [scheduledTimes, setScheduledTimes] = useState<string[]>([])

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchQuotes()
      loadBlockedDates()
      loadScheduledTimes()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const loadBlockedDates = async () => {
    try {
      const { list } = await lumi.entities.blocked_dates.list()
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
      const times = list.map(q => q.scheduledDate!)
      setScheduledTimes(times)
    } catch (error) {
      console.error('Error loading scheduled times:', error)
    }
  }

  const fetchQuotes = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 Fetching quotes for user:', user?.userId, user?.email)
      
      // Try filtering by userId first, fallback to email
      const { list } = await lumi.entities.quote_requests.list({
        filter: {
          $or: [
            { userId: user?.userId },
            { email: user?.email }
          ]
        },
        sort: { createdAt: -1 }
      })
      
      console.log('✅ Found quotes:', list.length)
      list.forEach(q => console.log('  - Quote:', q._id, 'userId:', q.userId, 'email:', q.email))
      
      setQuotes(list)
    } catch (error) {
      console.error('Error fetching quotes:', error)
      toast.error('Falha ao carregar seus orçamentos')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (quoteId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta solicitação de orçamento?')) {
      return
    }

    try {
      await lumi.entities.quote_requests.delete(quoteId)
      toast.success('Orçamento excluído com sucesso')
      fetchQuotes()
    } catch (error) {
      console.error('Error deleting quote:', error)
      toast.error('Falha ao excluir orçamento')
    }
  }

  const handleEdit = (quote: QuoteRequest) => {
    setEditingQuote(quote)
    setIsEditModalOpen(true)
    
    // Reload scheduled times first to ensure accurate availability
    loadScheduledTimes().then(() => {
      // Initialize date and hour selection if quote has scheduled date
      if (quote.scheduledDate) {
        const date = new Date(quote.scheduledDate)
        const dateStr = date.toISOString().split('T')[0]
        const hour = date.getHours()
        setSelectedDate(dateStr)
        setSelectedHour(hour)
        const hours = getAvailableHoursForDate(dateStr)
        // Include current hour even if it appears occupied (it's this quote's slot)
        setAvailableHours(Array.from(new Set([...hours, hour])).sort((a, b) => a - b))
      } else {
        setSelectedDate('')
        setSelectedHour(null)
        setAvailableHours([])
      }
    })
  }

  const isTimeSlotAvailable = (dateTime: string) => {
    if (!dateTime) return true
    
    const selectedDate = new Date(dateTime)
    const selectedDateStr = selectedDate.toISOString().split('T')[0]
    const selectedHour = selectedDate.getHours()
    
    // Check time restrictions (8:00 - 17:00)
    if (selectedHour < 8 || selectedHour >= 17) {
      return false
    }
    
    // Check blocked dates
    const isBlocked = blockedDates.some(blocked => {
      const blockedDateStr = new Date(blocked.date).toISOString().split('T')[0]
      if (blockedDateStr !== selectedDateStr) return false
      
      if (blocked.isFullDay) return true
      if (blocked.blockedHours?.includes(`${selectedHour}:00`)) return true
      return false
    })
    
    if (isBlocked) return false
    
    // Check already scheduled times (excluding current quote)
    const isOccupied = scheduledTimes.some(time => {
      if (editingQuote?.scheduledDate === time) return false // Skip current quote
      const scheduledDate = new Date(time)
      return scheduledDate.toISOString() === selectedDate.toISOString()
    })
    
    return !isOccupied
  }

  // Helper function to convert UTC ISO string to local datetime-local format
  const toLocalDatetimeString = (isoString: string | undefined) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Helper function to convert local datetime to UTC ISO string
  const toUTCISOString = (localDatetimeString: string) => {
    if (!localDatetimeString) return undefined
    return new Date(localDatetimeString).toISOString()
  }

  const validateScheduledTime = (dateTimeString: string | undefined): { valid: boolean; message: string } => {
    if (!dateTimeString) return { valid: true, message: '' }
    
    const selectedDate = new Date(dateTimeString)
    const selectedHour = selectedDate.getHours()
    
    // Check time restrictions (8:00 - 17:00)
    if (selectedHour < 8 || selectedHour >= 17) {
      return { valid: false, message: '⏰ Horário deve estar entre 8h e 17h' }
    }
    
    const selectedDateStr = selectedDate.toISOString().split('T')[0]
    
    // Check blocked dates
    const isBlocked = blockedDates.some(blocked => {
      const blockedDateStr = new Date(blocked.date).toISOString().split('T')[0]
      if (blockedDateStr !== selectedDateStr) return false
      
      if (blocked.isFullDay) return true
      if (blocked.blockedHours?.includes(`${selectedHour}:00`)) return true
      return false
    })
    
    if (isBlocked) {
      return { valid: false, message: '🚫 Este horário está bloqueado pelo administrador' }
    }
    
    // Check already scheduled times (excluding current quote when editing)
    const isOccupied = scheduledTimes.some(time => {
      if (editingQuote?.scheduledDate === time) return false // Skip current quote
      const scheduledDate = new Date(time)
      return scheduledDate.toISOString() === selectedDate.toISOString()
    })
    
    if (isOccupied) {
      return { valid: false, message: '❌ Este horário já está ocupado por outro agendamento' }
    }
    
    return { valid: true, message: '' }
  }

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
      
      // Check if hour is already scheduled (excluding current quote)
      const isOccupied = scheduledTimes.some(time => {
        if (editingQuote?.scheduledDate === time) return false
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

  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedHour, setSelectedHour] = useState<number | null>(null)
  const [availableHours, setAvailableHours] = useState<number[]>([])

  const handleDateSelection = (date: string) => {
    setSelectedDate(date)
    const hours = getAvailableHoursForDate(date)
    setAvailableHours(hours)
    setSelectedHour(null)
    // Clear previous scheduled date when selecting new date
    setEditingQuote({ ...editingQuote!, scheduledDate: undefined })
  }

  const handleHourSelection = (hour: number) => {
    setSelectedHour(hour)
    if (selectedDate) {
      // Parse date string and create UTC date to avoid timezone shifts
      const [year, month, day] = selectedDate.split('-').map(Number)
      const dateTime = new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0))
      const utcIsoString = dateTime.toISOString()
      setEditingQuote({ ...editingQuote!, scheduledDate: utcIsoString })
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingQuote) return

    try {
      await lumi.entities.quote_requests.update(editingQuote._id, {
        name: editingQuote.name,
        email: editingQuote.email,
        phone: editingQuote.phone,
        street: editingQuote.street,
        number: editingQuote.number,
        neighborhood: editingQuote.neighborhood,
        city: editingQuote.city,
        cep: editingQuote.cep,
        serviceType: editingQuote.serviceType,
        projectType: editingQuote.projectType,
        description: editingQuote.description,
        scheduledDate: editingQuote.scheduledDate,
        updatedAt: new Date().toISOString()
      })
      toast.success('Orçamento atualizado com sucesso')
      setIsEditModalOpen(false)
      setEditingQuote(null)
      setSelectedDate('')
      setSelectedHour(null)
      setAvailableHours([])
      // Reload both quotes and scheduled times to reflect changes immediately
      await Promise.all([fetchQuotes(), loadScheduledTimes()])
    } catch (error) {
      console.error('Error updating quote:', error)
      toast.error('Falha ao atualizar orçamento')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pendente' },
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Aprovado' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejeitado' },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Em Andamento' },
      completed: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle, label: 'Concluído' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {config.label}
      </span>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Login Necessário
          </h2>
          <p className="text-gray-600 mb-6">
            Por favor, faça login para visualizar e gerenciar suas solicitações de orçamento.
          </p>
          <button
            onClick={signIn}
            className="w-full bg-gradient-to-r from-blue-600 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
          >
            Entrar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Meus Orçamentos</h1>
              <p className="text-lg text-gray-600">Visualize e gerencie suas solicitações de orçamento</p>
            </div>
            <button
              onClick={() => navigate('/orcamento')}
              className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Novo Orçamento
            </button>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && quotes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum orçamento ainda</h3>
            <p className="text-gray-600 mb-6">Comece criando sua primeira solicitação de orçamento</p>
            <button
              onClick={() => navigate('/orcamento')}
              className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
            >
              Criar Solicitação de Orçamento
            </button>
          </motion.div>
        )}

        {/* Quotes List */}
        {!isLoading && quotes.length > 0 && (
          <div className="grid gap-6">
            {quotes.map((quote, index) => (
              <motion.div
                key={quote._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{quote.serviceType}</h3>
                      {getStatusBadge(quote.status)}
                    </div>
                    <p className="text-sm text-gray-500">
                      Criado em: {(() => {
                        const date = new Date(quote.createdAt)
                        const day = date.getUTCDate()
                        const month = date.toLocaleDateString('pt-BR', { month: 'long', timeZone: 'UTC' })
                        const year = date.getUTCFullYear()
                        const hour = String(date.getUTCHours()).padStart(2, '0')
                        const minute = String(date.getUTCMinutes()).padStart(2, '0')
                        return `${day} de ${month} de ${year}, ${hour}:${minute}`
                      })()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(quote)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(quote._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Projeto</p>
                    <p className="font-medium text-gray-900">{quote.projectType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Visita Agendada</p>
                    <p className="font-medium text-gray-900">
                      {quote.scheduledDate ? (
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {(() => {
                            const date = new Date(quote.scheduledDate)
                            const day = String(date.getUTCDate()).padStart(2, '0')
                            const month = String(date.getUTCMonth() + 1).padStart(2, '0')
                            const year = date.getUTCFullYear()
                            const hour = String(date.getUTCHours()).padStart(2, '0')
                            const minute = String(date.getUTCMinutes()).padStart(2, '0')
                            return `${day}/${month}/${year} às ${hour}:${minute}`
                          })()}
                        </span>
                      ) : (
                        'Não agendado'
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contato</p>
                    <p className="font-medium text-gray-900">{quote.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="font-medium text-gray-900">{quote.city}, {quote.neighborhood}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Descrição</p>
                  <p className="text-gray-700">{quote.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Editar Solicitação de Orçamento</h2>
              <form onSubmit={handleUpdate}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                      <input
                        type="text"
                        value={editingQuote.name}
                        onChange={(e) => setEditingQuote({ ...editingQuote, name: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={editingQuote.email}
                        onChange={(e) => setEditingQuote({ ...editingQuote, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                      <input
                        type="text"
                        value={editingQuote.phone}
                        onChange={(e) => setEditingQuote({ ...editingQuote, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Serviço</label>
                      <select
                        value={editingQuote.serviceType}
                        onChange={(e) => setEditingQuote({ ...editingQuote, serviceType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="Instalações Residenciais">Instalações Residenciais</option>
                        <option value="Instalações Comerciais">Instalações Comerciais</option>
                        <option value="Manutenção Elétrica">Manutenção Elétrica</option>
                        <option value="Ar Condicionado">Ar Condicionado</option>
                        <option value="Energia Solar">Energia Solar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Projeto</label>
                      <select
                        value={editingQuote.projectType}
                        onChange={(e) => setEditingQuote({ ...editingQuote, projectType: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="Obra Nova">Obra Nova</option>
                        <option value="Reforma">Reforma</option>
                        <option value="Ampliação">Ampliação</option>
                        <option value="Manutenção">Manutenção</option>
                        <option value="Emergência">Emergência</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Data e Hora da Visita</label>
                      
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
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea
                      value={editingQuote.description}
                      onChange={(e) => setEditingQuote({ ...editingQuote, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Endereço</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rua</label>
                        <input
                          type="text"
                          value={editingQuote.street}
                          onChange={(e) => setEditingQuote({ ...editingQuote, street: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                        <input
                          type="text"
                          value={editingQuote.number}
                          onChange={(e) => setEditingQuote({ ...editingQuote, number: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                        <input
                          type="text"
                          value={editingQuote.neighborhood}
                          onChange={(e) => setEditingQuote({ ...editingQuote, neighborhood: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                        <input
                          type="text"
                          value={editingQuote.city}
                          onChange={(e) => setEditingQuote({ ...editingQuote, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                        <input
                          type="text"
                          value={editingQuote.cep}
                          onChange={(e) => setEditingQuote({ ...editingQuote, cep: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false)
                      setEditingQuote(null)
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-yellow-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
