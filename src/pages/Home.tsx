
import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {Zap, Shield, Clock, Award, Phone, Mail, MapPin, CheckCircle, Star, ArrowRight, Sun, Home as HomeIcon, Building, Wrench, Settings, Battery, Snowflake} from 'lucide-react'

export default function Home() {
  const services = [
    {
      icon: Zap,
      title: 'Instalações Elétricas',
      description: 'Projetos completos para residências e empresas com segurança e qualidade.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Wrench,
      title: 'Manutenção Preventiva',
      description: 'Serviços especializados para manter seu sistema elétrico sempre funcionando.',
      color: 'from-yellow-500 to-yellow-600'
    },
    {
      icon: Snowflake,
      title: 'Ar Condicionado',
      description: 'Instalação e manutenção de sistemas de ar condicionado residenciais e comerciais.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Sun,
      title: 'Instalação de Placas Solares',
      description: 'Energia limpa e sustentável para sua casa ou empresa com economia garantida.',
      color: 'from-yellow-500 to-blue-500'
    }
  ]

  const features = [
    {
      icon: Shield,
      title: 'Segurança Garantida',
      description: 'Todos os projetos seguem rigorosamente as normas de segurança.'
    },
    {
      icon: Clock,
      title: 'Atendimento 24h',
      description: 'Emergências elétricas atendidas a qualquer hora do dia.'
    },
    {
      icon: Award,
      title: 'Profissionais Certificados',
      description: 'Equipe qualificada e certificada para todos os tipos de serviço.'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Soluções Elétricas
                <span className="block text-yellow-400">Completas</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Transformamos sua casa ou empresa com instalações elétricas seguras, 
                modernas e eficientes. Mais de 5 anos de experiência no mercado.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/orcamento"
                  className="bg-yellow-500 text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center"
                >
                  Solicitar Orçamento
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <a
                  href="tel:11947641802"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-900 transition-all duration-300 flex items-center justify-center"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  (11) 94764-1802
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <img
                src="https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Eletricista trabalhando"
                className="w-full h-96 object-cover rounded-2xl shadow-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
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
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Oferecemos soluções completas em sistemas elétricos para residências e empresas
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className={`bg-gradient-to-r ${service.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <service.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
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
              Por que escolher a Eletro Link?
            </h2>
            <p className="text-xl text-gray-600">
              Compromisso com a excelência em cada projeto
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-blue-600 to-yellow-600 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="h-10 w-10 text-white" />
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
              Pronto para transformar seu projeto elétrico?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Entre em contato conosco e receba um orçamento personalizado para suas necessidades
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/orcamento"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg"
              >
                Solicitar Orçamento Gratuito
              </Link>
              <Link
                to="/contato"
                className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Falar Conosco
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
