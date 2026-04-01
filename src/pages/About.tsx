
import React from 'react'
import { motion } from 'framer-motion'
import {Award, Users, Clock, Shield, Target, Heart, Zap} from 'lucide-react'

export default function About() {
  const values = [
    {
      icon: Shield,
      title: 'Segurança',
      description: 'Priorizamos a segurança em todos os nossos projetos, seguindo rigorosamente as normas técnicas.'
    },
    {
      icon: Award,
      title: 'Qualidade',
      description: 'Utilizamos apenas materiais certificados e seguimos os mais altos padrões de qualidade.'
    },
    {
      icon: Clock,
      title: 'Pontualidade',
      description: 'Respeitamos prazos e horários, entregando nossos projetos sempre no tempo acordado.'
    },
    {
      icon: Heart,
      title: 'Compromisso',
      description: 'Estamos comprometidos com a satisfação total de nossos clientes em cada projeto.'
    }
  ]

  const certifications = [
    'NR-10 - Segurança em Instalações e Serviços em Eletricidade',
    'CREA - Conselho Regional de Engenharia e Agronomia',
    'ABNT NBR 5410 - Instalações Elétricas de Baixa Tensão'
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
            <h1 className="text-5xl font-bold mb-6">Sobre a Eletro Link Manutenções</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Há mais de 5 anos transformando ideias em realidade através de soluções elétricas 
              inovadoras, seguras e eficientes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Nossa História</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                A Eletro Link Manutenções nasceu em 2019 com o sonho de oferecer serviços elétricos de excelência. 
                Começamos como uma pequena empresa familiar e hoje somos referência no setor, 
                atendendo desde residências até grandes complexos comerciais.
              </p>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Nossa trajetória é marcada pela constante busca por inovação e qualidade. 
                Investimos continuamente em capacitação da nossa equipe e nas mais modernas 
                tecnologias do mercado elétrico.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <img
                src="https://img.freepik.com/fotos-gratis/um-grupo-de-pessoas-multinacionais-ocupadas-trabalhando-no-escritorio_146671-15665.jpg?semt=ais_hybrid&w=740&q=80"
                alt="Equipe trabalhando"
                className="w-full h-96 object-cover rounded-2xl shadow-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Missão e Visão
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-blue-50 to-yellow-50 p-8 rounded-2xl text-center"
            >
              <div className="bg-blue-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Target className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nossa Missão</h3>
              <p className="text-gray-600 leading-relaxed">
                Fornecer soluções elétricas inovadoras, seguras e eficientes, superando as 
                expectativas de nossos clientes através de um atendimento personalizado e 
                qualidade excepcional em cada projeto.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-yellow-50 to-blue-50 p-8 rounded-2xl text-center"
            >
              <div className="bg-yellow-600 w-16 h-16 rounded-xl flex items-center justify-center mb-6 mx-auto">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nossa Visão</h3>
              <p className="text-gray-600 leading-relaxed">
                Ser reconhecida como a empresa líder em serviços elétricos na região, 
                sendo referência em inovação, sustentabilidade e excelência no atendimento 
                até 2030.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nossos Valores
            </h2>
            <p className="text-xl text-gray-600">
              Os princípios que guiam nossa empresa
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div className="bg-gradient-to-r from-blue-600 to-yellow-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Certificações e Qualificações
            </h2>
            <p className="text-xl text-gray-600">
              Reconhecimentos que garantem nossa qualidade
            </p>
          </motion.div>

          <div className="bg-gray-50 rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certifications.map((cert, index) => (
                <motion.div
                  key={cert}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <div className="bg-green-100 p-2 rounded-full">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">{cert}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
