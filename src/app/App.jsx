import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { Footer } from '../shared/ui/Footer'
import { HomePage } from '../pages/HomePage'
import { SearchResultsPage } from '../pages/SearchResultsPage'
import { InfoPage } from '../pages/InfoPage'
import { DestinationsPage } from '../pages/DestinationsPage'
import { ServicesPage } from '../pages/ServicesPage'
import { HelpPage } from '../pages/HelpPage'
import { PurchasePage } from '../pages/PurchasePage'

// Al cambiar de página vuelve arriba; si la URL trae #ancla, baja a esa sección.
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    // Ojo: el efecto no debe devolver el resultado de scrollIntoView(). En
    // Chrome reciente devuelve una Promise y React la trataría como función de
    // limpieza, rompiendo la app (pantalla en blanco) al cambiar de página.
    const target = hash ? document.getElementById(hash.slice(1)) : null
    if (target) target.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function TitleReset() {
  const { pathname } = useLocation()
  useEffect(() => { if (pathname === '/') document.title = 'Cruz del Norte · Pasajes de bus en línea' }, [pathname])
  return null
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollManager />
      <TitleReset />
      <div className="flex min-h-screen flex-col">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/destinos" element={<DestinationsPage />} />
            <Route path="/servicios" element={<ServicesPage />} />
            <Route path="/ayuda" element={<HelpPage />} />
            <Route path="/viajes" element={<SearchResultsPage />} />
            <Route path="/compra/:idViaje" element={<PurchasePage />} />
            <Route path="/terminos" element={<InfoPage title="Términos y condiciones"><p>Contenido pendiente de revisión legal.</p></InfoPage>} />
            <Route path="/privacidad" element={<InfoPage title="Política de privacidad"><p>Contenido pendiente de revisión legal.</p></InfoPage>} />
            <Route path="/libro-de-reclamaciones" element={
              <InfoPage title="Libro de Reclamaciones">
                <p>Conforme al Código de Protección y Defensa del Consumidor, aquí estará disponible el formulario del Libro de Reclamaciones virtual.</p>
                <p>Mientras se habilita, puedes presentar tu reclamo en cualquiera de nuestras agencias.</p>
              </InfoPage>
            } />
            <Route path="*" element={<InfoPage title="Página no encontrada"><p>La página que buscas no existe o cambió de dirección.</p></InfoPage>} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
