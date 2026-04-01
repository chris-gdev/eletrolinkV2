
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {Search, Filter, Edit2, Trash2, CheckCircle, XCircle, Clock, TrendingUp, Mail, Phone, Calendar, DollarSign, FileText, Eye, X, CalendarX, Plus} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useDashboardData } from '../hooks/useDashboardData'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

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
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'in_progress'
  estimatedValue?: number
  scheduledDate?: string
  createdAt: string
  updatedAt: string
  userId?: string
}

interface BlockedDate {
  _id: string
  date: string
  reason: string
  isFullDay: boolean
  blockedHours?: string[]
  createdAt: string
  updatedAt: string
}

export default function AdminQuoteManagement() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const { quotes, loading, updateQuoteStatus, deleteQuote, refreshData } = useDashboardData()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<QuoteRequest>>({})
  const [showBlockedDatesModal, setShowBlockedDatesModal] = useState(false)
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([])
  const [newBlockedDate, setNewBlockedDate] = useState({ date: '', reason: '', isFullDay: true, blockedHours: [] as string[] })
  const [selectedHours, setSelectedHours] = useState<string[]>([])

  // Load blocked dates
  useEffect(() => {
    loadBlockedDates()
  }, [])

  const loadBlockedDates = async () => {
    try {
      const { list } = await lumi.entities.blocked_dates.list({
        sort: { date: 1 }
      })
      setBlockedDates(list)
    } catch (error) {
      console.error('Error loading blocked dates:', error)
    }
  }

  const addBlockedDate = async () => {
    if (!newBlockedDate.date || !newBlockedDate.reason) {
      toast.error('Preencha todos os campos')
      return
    }

    if (!newBlockedDate.isFullDay && selectedHours.length === 0) {
      toast.error('Selecione pelo menos um horário')
      return
    }

    try {
      // Save date as YYYY-MM-DD at noon UTC to avoid timezone issues
      const [year, month, day] = newBlockedDate.date.split('-')
      const dateTime = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 12, 0, 0))
      await lumi.entities.blocked_dates.create({
        date: dateTime.toISOString(),
        reason: newBlockedDate.reason,
        isFullDay: newBlockedDate.isFullDay,
        blockedHours: newBlockedDate.isFullDay ? undefined : selectedHours,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      toast.success('Data/horário bloqueado com sucesso')
      setNewBlockedDate({ date: '', reason: '', isFullDay: true, blockedHours: [] })
      setSelectedHours([])
      loadBlockedDates()
    } catch (error) {
      toast.error('Erro ao bloquear data/horário')
      console.error(error)
    }
  }

  const deleteBlockedDate = async (id: string) => {
    try {
      await lumi.entities.blocked_dates.delete(id)
      toast.success('Data desbloqueada')
      loadBlockedDates()
    } catch (error) {
      toast.error('Erro ao desbloquear data')
    }
  }

  // Check if admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acesso Negado</h2>
          <p className="text-gray-600">Apenas administradores podem acessar esta página</p>
        </div>
      </div>
    )
  }

  // Filter quotes
  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = 
      quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.serviceType.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      case 'in_progress':
        return <TrendingUp className="h-4 w-4 text-purple-500" />
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: 'Pendente',
      approved: 'Aprovado',
      completed: 'Concluído',
      in_progress: 'Em Andamento',
      rejected: 'Rejeitado'
    }
    return statusMap[status] || 'Desconhecido'
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      rejected: 'bg-red-100 text-red-800'
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  const handleEdit = (quote: QuoteRequest) => {
    setSelectedQuote(quote)
    setEditFormData({
      status: quote.status,
      estimatedValue: quote.estimatedValue || 0
    })
    setIsEditModalOpen(true)
  }

  const handleView = (quote: QuoteRequest) => {
    setSelectedQuote(quote)
    setIsViewModalOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!selectedQuote) return

    try {
      await updateQuoteStatus(
        selectedQuote._id, 
        editFormData.status || selectedQuote.status,
        editFormData.estimatedValue
      )
      setIsEditModalOpen(false)
      setSelectedQuote(null)
      toast.success('Orçamento atualizado com sucesso')
    } catch (error) {
      toast.error('Erro ao atualizar orçamento')
    }
  }

  const handleDelete = async (quoteId: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.')) {
      await deleteQuote(quoteId)
    }
  }

  const handleQuickStatusChange = async (quoteId: string, newStatus: string) => {
    await updateQuoteStatus(quoteId, newStatus)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => q.status === 'pending').length,
    approved: quotes.filter(q => q.status === 'approved').length,
    inProgress: quotes.filter(q => q.status === 'in_progress').length,
    completed: quotes.filter(q => q.status === 'completed').length,
    rejected: quotes.filter(q => q.status === 'rejected').length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Gerenciamento de Orçamentos
              </h1>
              <p className="text-gray-600">
                Gerencie todas as solicitações de orçamento dos clientes
              </p>
            </div>
            <button
              onClick={() => setShowBlockedDatesModal(true)}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center"
            >
              <CalendarX className="mr-2 h-5 w-5" />
              Gerenciar Datas Bloqueadas
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          {[
            { label: 'Total', value: stats.total, color: 'bg-blue-500' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
            { label: 'Approved', value: stats.approved, color: 'bg-green-500' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-purple-500' },
            { label: 'Completed', value: stats.completed, color: 'bg-blue-600' },
            { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' }
          ].map((stat, index) => {
            const labels: Record<string, string> = {
              'Total': 'Total',
              'Pending': 'Pendente',
              'Approved': 'Aprovado',
              'In Progress': 'Em Andamento',
              'Completed': 'Concluído',
              'Rejected': 'Rejeitado'
            }
            return (
              <div key={stat.label} className="bg-white rounded-lg shadow p-4">
                <div className={`${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
                  <span className="text-white font-bold text-lg">{stat.value}</span>
                </div>
                <p className="text-sm text-gray-600">{labels[stat.label] || stat.label}</p>
              </div>
            )
          })}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-4 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por nome, email ou serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos os Status</option>
                <option value="pending">Pendente</option>
                <option value="approved">Aprovado</option>
                <option value="in_progress">Em Andamento</option>
                <option value="completed">Concluído</option>
                <option value="rejected">Rejeitado</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Quotes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow overflow-hidden"
        >
          {filteredQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhum orçamento encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serviço
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visita Agendada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Criação
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredQuotes.map((quote) => (
                    <tr key={quote._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <div className="text-sm font-medium text-gray-900">{quote.name}</div>
                          <div className="text-sm text-gray-500">{quote.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{quote.serviceType}</div>
                        <div className="text-sm text-gray-500">{quote.projectType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                          {getStatusIcon(quote.status)}
                          <span className="ml-1">{getStatusText(quote.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote.estimatedValue ? formatCurrency(quote.estimatedValue) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quote.scheduledDate ? (
                          <div>
                            <div className="font-medium">{new Date(quote.scheduledDate).toLocaleDateString('pt-BR')}</div>
                            <div className="text-xs text-gray-500">{new Date(quote.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Não agendado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(quote.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleView(quote)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(quote)}
                            className="text-green-600 hover:text-green-900"
                            title="Editar orçamento"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(quote._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir orçamento"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* View Modal */}
        {isViewModalOpen && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Detalhes do Orçamento</h3>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Nome do Cliente</label>
                      <p className="text-gray-900">{selectedQuote.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-gray-900">{selectedQuote.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Telefone</label>
                      <p className="text-gray-900">{selectedQuote.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedQuote.status)}`}>
                        {getStatusText(selectedQuote.status)}
                      </span>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tipo de Serviço</label>
                      <p className="text-gray-900">{selectedQuote.serviceType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tipo de Projeto</label>
                      <p className="text-gray-900">{selectedQuote.projectType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data da Visita</label>
                      <p className="text-gray-900">
                        {selectedQuote.scheduledDate ? (
                          <>
                            {new Date(selectedQuote.scheduledDate).toLocaleDateString('pt-BR')} às {new Date(selectedQuote.scheduledDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </>
                        ) : (
                          'Não agendado'
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Valor Estimado</label>
                      <p className="text-gray-900">
                        {selectedQuote.estimatedValue ? formatCurrency(selectedQuote.estimatedValue) : 'Não definido'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data de Criação</label>
                      <p className="text-gray-900">{new Date(selectedQuote.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Última Atualização</label>
                      <p className="text-gray-900">{new Date(selectedQuote.updatedAt).toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Endereço Completo</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Rua</label>
                        <p className="text-gray-900">{selectedQuote.street}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Número</label>
                        <p className="text-gray-900">{selectedQuote.number}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Bairro</label>
                        <p className="text-gray-900">{selectedQuote.neighborhood}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Cidade</label>
                        <p className="text-gray-900">{selectedQuote.city}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">CEP</label>
                        <p className="text-gray-900">{selectedQuote.cep}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mt-4">
                    <label className="text-sm font-medium text-gray-500">Descrição</label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">{selectedQuote.description}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Edit Modal */}
        {isEditModalOpen && selectedQuote && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Editar Orçamento</h3>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cliente: {selectedQuote.name}
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as any })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pendente</option>
                      <option value="approved">Aprovado</option>
                      <option value="in_progress">Em Andamento</option>
                      <option value="completed">Concluído</option>
                      <option value="rejected">Rejeitado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Estimado (R$)
                    </label>
                    <input
                      type="number"
                      value={editFormData.estimatedValue || 0}
                      onChange={(e) => setEditFormData({ ...editFormData, estimatedValue: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Blocked Dates Modal */}
        {showBlockedDatesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">Gerenciar Datas Bloqueadas</h3>
                  <button
                    onClick={() => setShowBlockedDatesModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Add New Blocked Date */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Adicionar Data/Horário Bloqueado</h4>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                        <input
                          type="date"
                          value={newBlockedDate.date}
                          onChange={(e) => setNewBlockedDate({ ...newBlockedDate, date: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                        <input
                          type="text"
                          value={newBlockedDate.reason}
                          onChange={(e) => setNewBlockedDate({ ...newBlockedDate, reason: e.target.value })}
                          placeholder="Ex: Feriado, Manutenção"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="flex items-center space-x-2 mb-3">
                        <input
                          type="checkbox"
                          checked={newBlockedDate.isFullDay}
                          onChange={(e) => {
                            setNewBlockedDate({ ...newBlockedDate, isFullDay: e.target.checked })
                            if (e.target.checked) setSelectedHours([])
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700">Bloquear dia inteiro</span>
                      </label>
                      
                      {!newBlockedDate.isFullDay && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Selecione os horários (8h - 17h):</label>
                          <div className="grid grid-cols-5 gap-2">
                            {Array.from({ length: 10 }, (_, i) => i + 8).map(hour => {
                              const hourStr = `${hour}:00`
                              const isSelected = selectedHours.includes(hourStr)
                              return (
                                <button
                                  key={hour}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      setSelectedHours(selectedHours.filter(h => h !== hourStr))
                                    } else {
                                      setSelectedHours([...selectedHours, hourStr])
                                    }
                                  }}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    isSelected
                                      ? 'bg-red-600 text-white'
                                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {hourStr}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={addBlockedDate}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {newBlockedDate.isFullDay ? 'Bloquear Data Inteira' : 'Bloquear Horários Selecionados'}
                    </button>
                  </div>
                </div>

                {/* List of Blocked Dates */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Datas Bloqueadas ({blockedDates.length})</h4>
                  {blockedDates.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nenhuma data bloqueada</p>
                  ) : (
                    <div className="space-y-2">
                      {blockedDates.map((blocked) => (
                        <div key={blocked._id} className="flex items-center justify-between bg-red-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-4 flex-1">
                            <CalendarX className="h-5 w-5 text-red-600" />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {(() => {
                                  const date = new Date(blocked.date)
                                  const year = date.getUTCFullYear()
                                  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
                                  const day = String(date.getUTCDate()).padStart(2, '0')
                                  // Format directly using UTC components without creating new Date
                                  return `${day}/${month}/${year}`
                                })()}
                                {blocked.isFullDay ? ' (Dia inteiro)' : ''}
                              </div>
                              <div className="text-sm text-gray-600">{blocked.reason}</div>
                              {!blocked.isFullDay && blocked.blockedHours && blocked.blockedHours.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Horários bloqueados: {blocked.blockedHours.join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteBlockedDate(blocked._id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Desbloquear"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowBlockedDatesModal(false)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
