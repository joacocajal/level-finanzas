import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import Transacciones from './pages/Transacciones'
import Inventario from './pages/Inventario'
import Simulador from './pages/Simulador'
import Configuracion from './pages/Configuracion'

export default function App() {
  return (
    <Router>
      <Layout>
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
