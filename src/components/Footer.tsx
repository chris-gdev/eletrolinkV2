
import React from 'react'
import { Link } from 'react-router-dom'
import {Phone, Mail, Clock, Zap, Shield, Award, Sun, Wrench, Settings, Battery} from 'lucide-react'

export default function Footer() {
  const services = [
    'Instalações Elétricas',
    'Manutenção Preventiva',
    'Automação Residencial',
    'Instalação de Placas Solares',
    'Sistemas de Emergência',
    'Laudos Técnicos'
  ]

  const quickLinks = [
    { name: 'Início', href: '/' },
    { name: 'Serviços', href: '/servicos' },
    { name: 'Sobre', href: '/sobre' },
    { name: 'Contato', href: '/contato' },
    { name: 'Orçamento', href: '/orcamento' }
  ]

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-yellow-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">Eletro Link Manutenções</span>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Soluções elétricas completas para residências e empresas. 
              Mais de 5 anos de experiência no mercado com qualidade e segurança garantidas.
            </p>
            <div className="flex space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Shield className="h-5 w-5" />
              </div>
              <div className="bg-yellow-600 p-2 rounded-lg">
                <Award className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-yellow-400">Links Rápidos</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-yellow-400">Nossos Serviços</h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <span className="text-gray-300 text-sm">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-yellow-400">Contato</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Telefone</p>
                  <a href="tel:11947641802" className="text-white hover:text-yellow-400 transition-colors">
                    (11) 94764-1802
                  </a>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Email</p>
                  <a href="mailto:eletrolink220@gmail.com" className="text-white hover:text-yellow-400 transition-colors">
                    eletrolink220@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-300">Horário</p>
                  <p className="text-white text-sm">
                    Seg-Sex: 8h às 18h<br />
                    Sáb: 8h às 12h<br />
                    <span className="text-yellow-400">Emergências 24h</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Eletro Link Manutenções. Todos os direitos reservados.
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>NR-10 Certificada</span>
              <span>•</span>
              <span>CREA Registrada</span>
              <span>•</span>
              <span>Garantia Total</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
