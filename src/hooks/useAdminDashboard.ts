
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface DashboardMetrics {
  totalRevenue: number
  totalExpenses: number
  profit: number
  completedOrders: number
  pendingOrders: number
  inProgressOrders: number
  lowStockItems: number
  totalOrders: number
  averageOrderValue: number
  monthlyGrowth: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'payment' | 'inventory'
  description: string
  date: string
  value?: number
  status?: string
}

export const useAdminDashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalRevenue: 0,
    totalExpenses: 0,
    profit: 0,
    completedOrders: 0,
    pendingOrders: 0,
    inProgressOrders: 0,
    lowStockItems: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    monthlyGrowth: 0
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const calculateMetrics = useCallback(async () => {
    try {
      setLoading(true)

      // Buscar dados financeiros
      const { list: financialRecords } = await lumi.entities.financial_records.list({
        sort: { date: -1 }
      })

      // Buscar ordens de serviço
      const { list: serviceOrders } = await lumi.entities.service_orders.list({
        sort: { created_at: -1 }
      })

      // Buscar itens de estoque
      const { list: inventoryItems } = await lumi.entities.inventory_items.list()

      // Calcular métricas financeiras
      const totalRevenue = financialRecords
        ?.filter(record => record.type === 'receita')
        .reduce((sum, record) => sum + (record.amount || 0), 0) || 0

      const totalExpenses = financialRecords
        ?.filter(record => record.type === 'despesa')
        .reduce((sum, record) => sum + (record.amount || 0), 0) || 0

      const profit = totalRevenue - totalExpenses

      // Calcular métricas de ordens
      const completedOrders = serviceOrders?.filter(order => order.status === 'concluido').length || 0
      const pendingOrders = serviceOrders?.filter(order => order.status === 'pendente').length || 0
      const inProgressOrders = serviceOrders?.filter(order => order.status === 'em_andamento').length || 0
      const totalOrders = serviceOrders?.length || 0

      const averageOrderValue = totalOrders > 0 
        ? serviceOrders?.reduce((sum, order) => sum + (order.total_value || 0), 0) / totalOrders 
        : 0

      // Calcular itens com estoque baixo
      const lowStockItems = inventoryItems?.filter(item => 
        item.quantity <= (item.minimum_stock || 0)
      ).length || 0

      // Simular crescimento mensal (em uma implementação real, compararia com mês anterior)
      const monthlyGrowth = 12.5

      setMetrics({
        totalRevenue,
        totalExpenses,
        profit,
        completedOrders,
        pendingOrders,
        inProgressOrders,
        lowStockItems,
        totalOrders,
        averageOrderValue,
        monthlyGrowth
      })

      // Gerar atividades recentes
      const activities: RecentActivity[] = []

      // Adicionar ordens recentes
      serviceOrders?.slice(0, 3).forEach(order => {
        activities.push({
          id: order._id,
          type: 'order',
          description: `Nova ordem: ${order.service_type} - ${order.customer_name}`,
          date: order.created_at,
          value: order.total_value,
          status: order.status
        })
      })

      // Adicionar pagamentos recentes
      financialRecords?.filter(record => record.type === 'receita').slice(0, 3).forEach(record => {
        activities.push({
          id: record._id,
          type: 'payment',
          description: `Pagamento recebido: ${record.description}`,
          date: record.date,
          value: record.amount
        })
      })

      // Adicionar alertas de estoque
      inventoryItems?.filter(item => item.quantity <= (item.minimum_stock || 0)).slice(0, 2).forEach(item => {
        activities.push({
          id: item._id,
          type: 'inventory',
          description: `Estoque baixo: ${item.name} (${item.quantity} restantes)`,
          date: item.updated_at || item.created_at
        })
      })

      // Ordenar por data
      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setRecentActivity(activities.slice(0, 8))

    } catch (error) {
      console.error('Erro ao calcular métricas:', error)
      toast.error('Erro ao carregar dados do dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    calculateMetrics()
  }, [calculateMetrics])

  const refreshData = () => {
    calculateMetrics()
  }

  return {
    metrics,
    recentActivity,
    loading,
    refreshData
  }
}
