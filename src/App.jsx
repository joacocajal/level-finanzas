import { useState, useEffect } from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Transacciones from './pages/Transacciones'
import Inventario from './pages/Inventario'
import Simulador from './pages/Simulador'
import Configuracion from './pages/Configuracion'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const auth = localStorage.getItem('level_auth')
    setIsAuthenticated(auth === 'true')
  }, [])

  const handleLogin = () => {
    localStorage.setItem('level_auth', 'true')
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    localStorage.removeItem('level_auth')
    setIsAuthenticated(false)
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <Layout onLogout={handleLogout}>
        <Routes>
          <Route path="/"              element={<Dashboard />}    />
          <Route path="/transacciones" element={<Transacciones />} />
          <Route path="/inventario"    element={<Inventario />}   />
          <Route path="/simulador"     element={<Simulador />}    />
          <Route path="/config"        element={<Configuracion />} />
          <Route path="*"              element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  )
}
