import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Monitor, Users, TrendingUp, Bell, Settings as SettingsIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import Dashboard from './components/Dashboard';
import AnimalManagement from './components/AnimalManagement';
import Reports from './components/Reports';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import Sidebar from './components/Sidebar';
import RawDataViewer from './components/RawDataViewer';
import Header from './components/Header';
import IndicatorsPage from './components/IndicatorsPage';
import IndicatorDetailPage from './components/IndicatorDetailPage';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userRole, setUserRole] = useState('producer');
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Fordox - Sistema de Monitoramento
          </h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#16a34a',
                    brandAccent: '#15803d',
                  },
                },
              },
            }}
            providers={['google']}
            redirectTo={window.location.origin}
            localization={{
              variables: {
                sign_in: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Entrar',
                  loading_button_label: 'Entrando...',
                  social_provider_text: 'Entrar com {{provider}}',
                  link_text: 'Já tem uma conta? Entre aqui',
                },
                sign_up: {
                  email_label: 'E-mail',
                  password_label: 'Senha',
                  button_label: 'Criar conta',
                  loading_button_label: 'Criando conta...',
                  social_provider_text: 'Criar conta com {{provider}}',
                  link_text: 'Não tem uma conta? Crie aqui',
                  confirmation_text: 'Verifique seu e-mail para confirmar a conta',
                },
                forgotten_password: {
                  email_label: 'E-mail',
                  button_label: 'Enviar instruções',
                  loading_button_label: 'Enviando...',
                  link_text: 'Esqueceu sua senha?',
                  confirmation_text: 'Verifique seu e-mail para redefinir a senha',
                },
              },
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar 
          activeSection={activeSection} 
          setActiveSection={setActiveSection}
          userRole={userRole}
        />
        
        <div className="flex-1 flex flex-col">
          <Header userRole={userRole} setUserRole={setUserRole} />
          
          <main className="flex-1 p-6 overflow-auto">
            <Routes>
              <Route path="/indicadores" element={<IndicatorsPage />} />
              <Route path="/indicadores/:type" element={<IndicatorDetailPage />} />
              <Route path="/dados-brutos" element={<RawDataViewer />} />
              <Route path="/" element={
                <>
                  {activeSection === 'dashboard' && <Dashboard userRole={userRole} />}
                  {activeSection === 'animals' && <AnimalManagement />}
                  {activeSection === 'reports' && <Reports userRole={userRole} />}
                  {activeSection === 'alerts' && <Alerts />}
                  {activeSection === 'settings' && <Settings />}
                </>
              } />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;