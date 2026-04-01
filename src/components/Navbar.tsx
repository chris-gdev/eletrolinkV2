
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {Menu, X} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { user, signIn, signOut, isAdmin } = useAuth()

  // Debug: Log admin status
  React.useEffect(() => {
    if (user) {
      console.log('🔍 Navbar - User:', user.email)
      console.log('🔍 Navbar - IsAdmin:', isAdmin)
      console.log('🔍 Navbar - User Role:', user.userRole)
    }
  }, [user, isAdmin])

  const navigation = [
    { name: 'Início', href: '/' },
    { name: 'Serviços', href: '/servicos' },
    { name: 'Sobre', href: '/sobre' },
    { name: 'Contato', href: '/contato' },
    { name: 'Orçamento', href: '/orcamento' }
  ]

  const isActive = (path: string) => location.pathname === path

  const handleLogin = async () => {
    await signIn()
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    signOut()
    setIsMenuOpen(false)
  }

  const LightBulbIcon = () => (
    <svg 
      width="40" 
      height="40" 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10"
    >
      {/* Raios de luz ao redor */}
      <g stroke="#FCD34D" strokeWidth="3" strokeLinecap="round">
        <line x1="50" y1="8" x2="50" y2="15" />
        <line x1="73.5" y1="16.5" x2="69.5" y2="20.5" />
        <line x1="83.5" y1="40" x2="76.5" y2="40" />
        <line x1="73.5" y1="63.5" x2="69.5" y2="59.5" />
        <line x1="26.5" y1="63.5" x2="30.5" y2="59.5" />
        <line x1="16.5" y1="40" x2="23.5" y2="40" />
        <line x1="26.5" y1="16.5" x2="30.5" y2="20.5" />
      </g>
      
      {/* Corpo da lâmpada (outline) */}
      <path 
        d="M35 40 C35 25, 35 25, 50 25 C65 25, 65 25, 65 40 C65 50, 62 55, 60 60 L40 60 C38 55, 35 50, 35 40 Z" 
        stroke="#FCD34D" 
        strokeWidth="3" 
        fill="none"
      />
      
      {/* Base roscada da lâmpada */}
      <g stroke="#FCD34D" strokeWidth="3" fill="none">
        <line x1="40" y1="60" x2="60" y2="60" />
        <line x1="41" y1="64" x2="59" y2="64" />
        <line x1="42" y1="68" x2="58" y2="68" />
        <line x1="43" y1="72" x2="57" y2="72" />
        <line x1="44" y1="76" x2="56" y2="76" />
      </g>
      
      {/* Detalhes internos da lâmpada */}
      <g stroke="#FCD34D" strokeWidth="2" fill="none" opacity="0.7">
        <path d="M42 35 C46 38, 54 38, 58 35" />
        <path d="M44 45 C48 47, 52 47, 56 45" />
      </g>
    </svg>
  )

  return (
    <nav className="bg-gray-900 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <LightBulbIcon />
            <span className="text-xl font-bold text-white">Eletro Link Manutenções</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <>
                <Link
                  to="/my-quotes"
                  className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive('/my-quotes')
                      ? 'text-yellow-400 border-b-2 border-yellow-400'
                      : 'text-gray-300 hover:text-yellow-400'
                  }`}
                >
                  Meus Orçamentos
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/quotes"
                    className={`px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                      isActive('/admin/quotes')
                        ? 'text-yellow-400 border-b-2 border-yellow-400'
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    Administrador
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={handleLogin}
                className="bg-gradient-to-r from-blue-600 to-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300"
              >
                Entrar
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-yellow-400 focus:outline-none focus:text-yellow-400"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900 border-t border-gray-700">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'text-yellow-400 bg-gray-800'
                      : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <Link
                    to="/my-quotes"
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                      isActive('/my-quotes')
                        ? 'text-yellow-400 bg-gray-800'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                    }`}
                  >
                    Meus Orçamentos
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/quotes"
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 text-base font-medium transition-colors duration-200 ${
                        isActive('/admin/quotes')
                          ? 'text-yellow-400 bg-gray-800'
                          : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-800'
                      }`}
                    >
                      Administrador
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:bg-gray-800"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-yellow-400 hover:bg-gray-800"
                >
                  Entrar
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
