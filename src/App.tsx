/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navigation } from './components/Navigation';
import { LoginModal } from './components/LoginModal';
import { ProtectedRoute } from './components/ProtectedRoute';

// Lazy loading de vistas para optimización de carga y Core Web Vitals
const HomeView = lazy(() => import('./views/HomeView').then(m => ({ default: m.HomeView })));
const DetailView = lazy(() => import('./views/DetailView').then(m => ({ default: m.DetailView })));
const BlogView = lazy(() => import('./views/BlogView').then(m => ({ default: m.BlogView })));
const ContactView = lazy(() => import('./views/ContactView').then(m => ({ default: m.ContactView })));
const DashboardView = lazy(() => import('./views/DashboardView').then(m => ({ default: m.DashboardView })));
const GuestInboxView = lazy(() => import('./views/GuestInboxView').then(m => ({ default: m.GuestInboxView })));

import { useAuth } from './contexts/AuthContext';
import { useData } from './contexts/DataContext';
import { useToast } from './contexts/ToastContext';

function PageLoading() {
  return (
    <div className="py-32 flex justify-center items-center">
      <div className="h-8 w-8 border-2 border-[#A7AB5E] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

/**
 * Desplaza automáticamente la ventana al inicio con cada cambio de ruta.
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loginModalOpen, setLoginModalOpen } = useAuth();
  const { loadFailed, houses, pastBookings } = useData();
  const { showToast } = useToast();

  const [eligibleReviewPending, setEligibleReviewPending] = useState<boolean>(true);

  // Propiedad destacada para el aviso de reseña
  const activeHouse = houses[0];

  // Notificación si se intentó acceder a una ruta protegida
  useEffect(() => {
    if (location.state?.needAuth) {
      showToast('🔒 Inicia sesión para acceder a esta sección.');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, showToast]);

  return (
    <div className="min-h-screen bg-[#FBF7EC] text-[#3F434D] font-sans antialiased overflow-x-clip selection:bg-[#CFE4EC] selection:text-[#3D7A95]">
      <ScrollToTop />
      
      {loadFailed && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[60] flex items-center gap-3 bg-red-600 text-white py-3 px-5 rounded-2xl shadow-xl max-w-sm">
          <span className="text-sm font-medium">No se han podido cargar los datos de Firestore. Recarga la página.</span>
        </div>
      )}

      {/* Navegación Principal */}
      <Navigation />

      {/* Banner de Invitación a Reseñar (Solo para huéspedes con estancia previa verificada) */}
      {user && user.role === 'guest' && eligibleReviewPending && activeHouse && pastBookings.some(b => b.guestEmail.toLowerCase() === user.email.toLowerCase()) && (
        <div className="bg-gradient-to-r from-[#F0DDBE] to-[#CFE4EC] border-b border-[rgba(63,67,77,0.1)] py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 text-md rounded-full bg-white flex items-center justify-center shadow-sm">⭐</div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3F434D]">¡Queremos saber tu opinión!</h4>
                <p className="text-xs text-[#6E727C] mt-0.5">Cuéntanos cómo fue tu estancia en {activeHouse.name}.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(`/alojamiento/${activeHouse.id}`)} 
                className="py-2 px-5 bg-[#3F434D] text-[#FBF7EC] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#1E2024] transition-all"
              >
                Escribir reseña
              </button>
              <button 
                onClick={() => setEligibleReviewPending(false)} 
                className="h-8 w-8 hover:bg-[rgba(0,0,0,0.05)] rounded-full flex items-center justify-center text-xs text-[#6E727C]"
                title="Cerrar aviso"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vistas Principales Enrutadas */}
      <main>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/alojamiento/:id" element={<DetailView />} />
            <Route path="/historias" element={<BlogView />} />
            <Route path="/contacto" element={<ContactView />} />
            <Route 
              path="/panel" 
              element={
                <ProtectedRoute requiredRole="host">
                  <DashboardView />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mensajes" 
              element={
                <ProtectedRoute requiredRole="guest">
                  <GuestInboxView />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Modales globales */}
      <LoginModal 
        loginModalOpen={loginModalOpen}
        setLoginModalOpen={setLoginModalOpen}
        showToast={showToast}
      />

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
