
import React from 'react'
import { motion } from 'framer-motion'
import {DollarSign, TrendingUp, TrendingDown, Users, CheckCircle, Clock, AlertTriangle, Package, FileText, Calendar, Activity, BarChart3, PieChart, RefreshCw} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useAdminDashboard } from '../hooks/useAdminDashboard'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()
  const { metrics, recentActivity, loading, refreshData } = useAdminDashboard()

  // Verificar se é admin
  if (!isAuthenticated || user?.userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acesso Negado</h1>
          <p className="text-gray-600">Você precisa ser administrador para acessar esta área.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'payment':
        return <DollarSign className="h-4 w-4 text-green-500" />
      case 'inventory':
        return <Package className="h-4 w-4 text-orange-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800'
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelado':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const statsCards = [
    {
      title: 'Receita Total',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: 'bg-green-500',
      change: `+${metrics.monthlyGrowth}%`,
      changeType: 'positive'
    },
    {
      title: 'Despesas',
      value: formatCurrency(metrics.totalExpenses),
      icon: TrendingDown,
      color: 'bg-red-500',
      change: '-5.2%',
      changeType: 'negative'
    },
    {
      title: 'Lucro Líquido',
      value: formatCurrency(metrics.profit),
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: `+${((metrics.profit / metrics.totalRevenue) * 100).toFixed(1)}%`,
      changeType: 'positive'
    },
    {
      title: 'Ordens Concluídas',
      value: metrics.completedOrders.toString(),
      icon: CheckCircle,
      color: 'bg-purple-500',
      change: `${metrics.totalOrders} total`,
      changeType: 'neutral'
    }
  ]

  const operationalStats = [
    {
      title: 'Ordens Pendentes',
      value: metrics.pendingOrders,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Em Andamento',
      value: metrics.inProgressOrders,
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      title: 'Estoque Baixo',
      value: metrics.lowStockItems,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Ticket Médio',
      value: formatCurrency(metrics.averageOrderValue),
      icon: BarChart3,
      color: 'text-green-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Dashboard Administrativo
              </h1>
              <p className="text-gray-600">
                Visão geral da empresa - {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
            <button
              onClick={refreshData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {statsCards.map((stat, index) => (
            <div
              key={stat.title}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' :
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Operational Metrics */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Métricas Operacionais
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {operationalStats.map((stat, index) => (
                  <div key={stat.title} className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className={`inline-flex p-2 rounded-full bg-gray-100 mb-2`}>
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-1">
                      {typeof stat.value === 'number' ? stat.value : stat.value}
                    </p>
                    <p className="text-sm text-gray-600">{stat.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Atividades Recentes
              </h2>
              
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      {activity.value && (
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(activity.value)}
                        </p>
                      )}
                      {activity.status && (
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions & Summary */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-6"
          >
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Ações Rápidas
              </h3>
              
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Nova Ordem de Serviço
                </button>
                
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Registrar Pagamento
                </button>
                
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <Package className="h-4 w-4 mr-2" />
                  Gerenciar Estoque
                </button>
                
                <button className="w-full border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatórios
                </button>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Resumo de Performance</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Taxa de Conclusão</span>
                  <span className="font-semibold">
                    {metrics.totalOrders > 0 ? Math.round((metrics.completedOrders / metrics.totalOrders) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Margem de Lucro</span>
                  <span className="font-semibold">
                    {metrics.totalRevenue > 0 ? Math.round((metrics.profit / metrics.totalRevenue) * 100) : 0}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Ordens Ativas</span>
                  <span className="font-semibold">
                    {metrics.pendingOrders + metrics.inProgressOrders}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Crescimento Mensal</span>
                  <span className="font-semibold text-green-200">
                    +{metrics.monthlyGrowth}%
                  </span>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {metrics.lowStockItems > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <div className="flex items-center mb-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="text-lg font-semibold text-red-900">Alertas</h3>
                </div>
                <p className="text-red-700">
                  {metrics.lowStockItems} {metrics.lowStockItems === 1 ? 'item está' : 'itens estão'} com estoque baixo.
                  Verifique o inventário para evitar problemas nos serviços.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
