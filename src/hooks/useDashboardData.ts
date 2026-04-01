
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

interface QuoteRequest {
  _id: string
  name: string
  email: string
  phone: string
  serviceType: string
  projectType: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'in_progress'
  estimatedValue?: number
  urgency: string
  createdAt: string
  updatedAt: string
  userId?: string
}

interface DashboardStats {
  totalQuotes: number
  pendingQuotes: number
  approvedQuotes: number
  completedQuotes: number
  totalRevenue: number
  averageValue: number
}

export const useDashboardData = () => {
  const { user, isAuthenticated } = useAuth()
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    pendingQuotes: 0,
    approvedQuotes: 0,
    completedQuotes: 0,
    totalRevenue: 0,
    averageValue: 0
  })
  const [loading, setLoading] = useState(true)

  // Buscar orçamentos do usuário atual
  const fetchUserQuotes = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      
      // Buscar orçamentos do usuário logado
      const { list: userQuotes } = await lumi.entities.quote_requests.list({
        filter: { userId: user.userId },
        sort: { createdAt: -1 },
        limit: 10
      })

      const quotesData = userQuotes || []
      setQuotes(quotesData)

      // Calcular estatísticas
      const totalQuotes = quotesData.length
      const pendingQuotes = quotesData.filter(q => q.status === 'pending').length
      const approvedQuotes = quotesData.filter(q => q.status === 'approved').length
      const completedQuotes = quotesData.filter(q => q.status === 'completed').length
      
      const quotesWithValue = quotesData.filter(q => q.estimatedValue && q.estimatedValue > 0)
      const totalRevenue = quotesWithValue.reduce((sum, q) => sum + (q.estimatedValue || 0), 0)
      const averageValue = quotesWithValue.length > 0 ? totalRevenue / quotesWithValue.length : 0

      setStats({
        totalQuotes,
        pendingQuotes,
        approvedQuotes,
        completedQuotes,
        totalRevenue,
        averageValue
      })

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Buscar todos os orçamentos (para admin)
  const fetchAllQuotes = useCallback(async () => {
    if (!isAuthenticated || !user || user.userRole !== 'ADMIN') {
      return
    }

    try {
      setLoading(true)
      
      // Buscar todos os orçamentos para admin
      const { list: allQuotes } = await lumi.entities.quote_requests.list({
        sort: { createdAt: -1 },
        limit: 50
      })

      const quotesData = allQuotes || []
      setQuotes(quotesData)

      // Calcular estatísticas globais
      const totalQuotes = quotesData.length
      const pendingQuotes = quotesData.filter(q => q.status === 'pending').length
      const approvedQuotes = quotesData.filter(q => q.status === 'approved').length
      const completedQuotes = quotesData.filter(q => q.status === 'completed').length
      
      const quotesWithValue = quotesData.filter(q => q.estimatedValue && q.estimatedValue > 0)
      const totalRevenue = quotesWithValue.reduce((sum, q) => sum + (q.estimatedValue || 0), 0)
      const averageValue = quotesWithValue.length > 0 ? totalRevenue / quotesWithValue.length : 0

      setStats({
        totalQuotes,
        pendingQuotes,
        approvedQuotes,
        completedQuotes,
        totalRevenue,
        averageValue
      })

    } catch (error) {
      console.error('Erro ao buscar dados administrativos:', error)
      toast.error('Erro ao carregar dados administrativos')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Atualizar status de um orçamento
  const updateQuoteStatus = async (quoteId: string, newStatus: string, estimatedValue?: number) => {
    try {
      const updates: any = {
        status: newStatus,
        updatedAt: new Date().toISOString()
      }

      if (estimatedValue !== undefined) {
        updates.estimatedValue = estimatedValue
      }

      await lumi.entities.quote_requests.update(quoteId, updates)
      
      // Atualizar lista local
      setQuotes(prev => prev.map(quote => 
        quote._id === quoteId 
          ? { ...quote, ...updates }
          : quote
      ))

      toast.success('Status do orçamento atualizado com sucesso')
      
      // Recarregar dados para atualizar estatísticas
      if (user?.userRole === 'ADMIN') {
        await fetchAllQuotes()
      } else {
        await fetchUserQuotes()
      }

    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      toast.error('Erro ao atualizar status do orçamento')
    }
  }

  // Deletar orçamento
  const deleteQuote = async (quoteId: string) => {
    try {
      await lumi.entities.quote_requests.delete(quoteId)
      
      setQuotes(prev => prev.filter(quote => quote._id !== quoteId))
      toast.success('Orçamento removido com sucesso')
      
      // Recarregar dados para atualizar estatísticas
      if (user?.userRole === 'ADMIN') {
        await fetchAllQuotes()
      } else {
        await fetchUserQuotes()
      }

    } catch (error) {
      console.error('Erro ao deletar orçamento:', error)
      toast.error('Erro ao remover orçamento')
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.userRole === 'ADMIN') {
        fetchAllQuotes()
      } else {
        fetchUserQuotes()
      }
    }
  }, [isAuthenticated, user, fetchAllQuotes, fetchUserQuotes])

  return {
    quotes,
    stats,
    loading,
    updateQuoteStatus,
    deleteQuote,
    refreshData: user?.userRole === 'ADMIN' ? fetchAllQuotes : fetchUserQuotes,
    isAdmin: user?.userRole === 'ADMIN'
  }
}
