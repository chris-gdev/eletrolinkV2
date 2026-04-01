
import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {Zap, Shield, Clock, Home, Building, Sun, Wrench, Snowflake} from 'lucide-react'

export default function Services() {
  const services = [
    {
      icon: Home,
      title: 'Instalações Residenciais',
      description: 'Projetos completos de instalações elétricas para residências, garantindo segurança e eficiência energética.',
      features: ['Quadros de distribuição', 'Tomadas e interruptores', 'Iluminação LED', 'Circuitos dedicados']
    },
    {
      icon: Building,
      title: 'Instalações Comerciais',
      description: 'Soluções elétricas para estabelecimentos comerciais e industriais com foco em produtividade.',
      features: ['Sistemas trifásicos', 'Quadros de comando', 'Iluminação industrial', 'Cabeamento estruturado']
    },
    {
      icon: Sun,
      title: 'Energia Solar',
      description: 'Instalação de sistemas fotovoltaicos para reduzir sua conta de energia em até 95%.',
      features: ['Projeto personalizado', 'Instalação completa', 'Conexão à rede', 'Monitoramento']
    },
    {
      icon: Wrench,
      title: 'Manutenção',
      description: 'Serviços de manutenção preventiva e corretiva para manter seu sistema sempre funcionando.',
      features: ['Inspeção termográfica', 'Teste de isolamento', 'Limpeza de quadros', 'Substituição preventiva']
    },
    {
      icon: Snowflake,
      title: 'Ar Condicionado',
      description: 'Instalação e manutenção de sistemas de ar condicionado residenciais e comerciais.',
      features: ['Instalação completa', 'Manutenção preventiva', 'Limpeza e higienização', 'Sistemas Split e Central']
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Todos os nossos serviços seguem as normas técnicas e de segurança mais rigorosas.'
    },
    {
      icon: Clock,
      title: 'Atendimento 24h',
      description: 'Emergências elétricas podem acontecer a qualquer momento. Estamos sempre prontos.'
    },
    {
      icon: Zap,
      title: 'Tecnologia Avançada',
      description: 'Utilizamos os equipamentos e técnicas mais modernas do mercado.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 to-yellow-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold mb-6">Nossos Serviços</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Soluções completas em sistemas elétricos para residências, comércios e indústrias. 
              Qualidade, segurança e inovação em cada projeto.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nossos Serviços
            </h2>
            <p className="text-xl text-gray-600">
              Expertise completa para todas as suas necessidades elétricas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="p-8">
                  <div className="bg-gradient-to-r from-blue-600 to-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                    <service.icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-600 to-yellow-600 rounded-full mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <Link
                    to="/orcamento"
                    className="w-full bg-gradient-to-r from-blue-600 to-yellow-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-center block"
                  >
                    Solicitar Orçamento
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Por que nos escolher?
            </h2>
            <p className="text-xl text-gray-600">
              Diferenciais que fazem toda a diferença
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center p-6"
              >
                <div className="bg-gradient-to-r from-blue-600 to-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-yellow-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Precisa de um orçamento?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Entre em contato conosco e receba uma proposta personalizada para seu projeto
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/orcamento"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Solicitar Orçamento
              </Link>
              <a
                href="tel:11947641802"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300 flex items-center justify-center"
              >
                <Zap className="mr-2 h-5 w-5" />
                (11) 94764-1802
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
