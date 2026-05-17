// src/App.jsx
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

import Login from './Login';
import Album from './Album';
import Trueques from './Trueques'; 
import Estadisticas from './Estadisticas';
import Progreso from './Progreso';
import MapaCiudades from './MapaCiudades';
import Admin from './Admin';
import PvP from './PvP';
import Migracion from './Migracion';

const WC_COLORS = {
  green: "#00B140",
  darkBlue: "#00205B",
  lightBlue: "#00A3E0",
  red: "#E4002B",
  lime: "#97D700",
  white: "#FFFFFF"
};

function App() {
  const [usuario, setUsuario] = useState(null);
  const [nombreUsuario, setNombreUsuario] = useState('');
  
  const [pestaña, setPestaña] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('match') ? 'pvp' : 'album';
  });
  
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [promptInstalacion, setPromptInstalacion] = useState(null);

  // Controla si el menú del usuario está abierto
  const [menuAbierto, setMenuAbierto] = useState(false);

  const EMAILS_ADMIN = ["miglio3929@gmail.com"]; 
  const esAdmin = usuario && EMAILS_ADMIN.includes(usuario.email);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      
      if (user) {
        // Corrección: Forzar el cierre del menú al iniciar sesión
        setMenuAbierto(false); 
        
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid));
          if (userDoc.exists() && userDoc.data().nombre) {
            setNombreUsuario(`${userDoc.data().nombre} ${userDoc.data().apellido || ''}`.trim());
          }
        } catch (error) {
          console.error("Error al obtener datos del usuario:", error);
        }
      } else {
        setNombreUsuario('');
      }
      
      setCargando(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const manejarAvisoInstalacion = (e) => {
      e.preventDefault();
      setPromptInstalacion(e);
    };
    window.addEventListener('beforeinstallprompt', manejarAvisoInstalacion);
    return () => window.removeEventListener('beforeinstallprompt', manejarAvisoInstalacion);
  }, []);

  const cargarGlobal = async () => {
    try {
        const q = query(collection(db, "publicaciones"), orderBy("fecha", "desc"));
        const snap = await getDocs(q);
        setPublicaciones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Error cargando datos globales:", e); }
  };

  useEffect(() => { if (usuario) cargarGlobal(); }, [usuario, pestaña]);

  const instalarAplicacion = async () => {
    if (promptInstalacion) {
      promptInstalacion.prompt();
      const { outcome } = await promptInstalacion.userChoice;
      if (outcome === 'accepted') {
        setPromptInstalacion(null);
      }
    }
  };

  if (cargando) return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "#16171d", color: "white", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", zIndex: 9999, fontFamily: "'Inter', sans-serif"
    }}>
      <img src="/estadio.jpg" alt="Fondo Estadio" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", opacity: 0.15, filter: "blur(5px)", zIndex: -1 }} />
      <img src="/icono-192.png" alt="Cargando..." style={{ width: "90px", height: "90px", marginBottom: "25px", animation: "giroSuave 2s linear infinite", filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.5))" }} />
      <h2 style={{ margin: "0 0 10px 0", fontSize: "1.8em", fontWeight: "900", letterSpacing: "1px", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>MisMonas 2026</h2>
      <p style={{ margin: 0, fontSize: "0.95em", color: WC_COLORS.lightBlue, opacity: 0.9, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "bold", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>Iniciando Plataforma...</p>
      <style>{`@keyframes giroSuave { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!usuario) return <Login />;

  const estiloBoton = (id, especial = false) => ({
    flex: "1 1 120px", padding: "12px 5px", borderRadius: "12px", border: "none",
    background: pestaña === id ? (especial ? WC_COLORS.red : WC_COLORS.green) : "#f1f5f9",
    color: pestaña === id ? WC_COLORS.white : WC_COLORS.darkBlue,
    cursor: "pointer", fontWeight: "bold", fontSize: "0.9em", transition: "0.3s ease",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
    textTransform: "uppercase", letterSpacing: "0.5px",
    boxShadow: pestaña === id ? `0 4px 10px ${WC_COLORS.green}40` : "none"
  });

  const cerrarSesion = () => {
    setMenuAbierto(false);
    signOut(auth);
  };

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: "#1e293b" }}>
      
      {/* OVERLAY INVISIBLE PARA CERRAR EL MENÚ AL HACER CLIC AFUERA */}
      {menuAbierto && (
        <div 
          onClick={() => setMenuAbierto(false)} 
          style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: 999 }}
        />
      )}

      <header style={{ background: WC_COLORS.darkBlue, color: WC_COLORS.white, padding: "15px 0", borderBottom: `4px solid ${WC_COLORS.lime}`, boxShadow: "0 4px 15px rgba(0,0,0,0.15)", position: "relative" }}>
        <div style={{ maxWidth: "1100px", margin: "auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: WC_COLORS.white, width: "40px", height: "40px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4em", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
              ⚽
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.5em", fontWeight: "900", letterSpacing: "-1px" }}>Mis<span style={{ color: WC_COLORS.lime }}>Monas</span></h1>
              <p style={{ margin: 0, fontSize: "0.65em", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>Colección Oficial 2026</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            
            {promptInstalacion && (
              <button 
                onClick={instalarAplicacion} 
                style={{ 
                  background: WC_COLORS.lime, color: WC_COLORS.darkBlue, padding: "8px 12px", borderRadius: "8px", 
                  cursor: "pointer", fontSize: "0.8em", fontWeight: "900", border: "none", 
                  boxShadow: `0 4px 10px rgba(151, 215, 0, 0.4)`, display: "flex", alignItems: "center", gap: "5px",
                  animation: "latido 2s infinite"
                }}
              >
                📲 INSTALAR
              </button>
            )}

            {/* MENÚ DE PERFIL DESPLEGABLE */}
            <div style={{ position: "relative", zIndex: 1000 }}>
              <button 
                onClick={() => setMenuAbierto(!menuAbierto)}
                style={{
                  background: WC_COLORS.lightBlue, color: "white", width: "35px", height: "35px",
                  borderRadius: "50%", border: "2px solid white", 
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.2)", transition: "transform 0.2s", padding: 0
                }}
                title="Perfil de Usuario"
              >
                {/* Ícono de usuario en SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>

              {menuAbierto && (
                <div style={{
                  position: "absolute", top: "45px", right: "0", background: "white", color: WC_COLORS.darkBlue,
                  borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", padding: "15px", minWidth: "160px",
                  display: "flex", flexDirection: "column", gap: "10px", animation: "aparecer 0.2s ease-out"
                }}>
                  <div style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", textAlign: "center" }}>
                    <div style={{ fontSize: "0.95em", fontWeight: "900", textTransform: "capitalize", wordBreak: "break-word" }}>
                      {nombreUsuario || usuario.email.split('@')[0]}
                    </div>
                    {esAdmin && <div style={{ display: "inline-block", background: WC_COLORS.red, color: "white", padding: "3px 8px", borderRadius: "5px", fontSize: "0.7em", fontWeight: "bold", marginTop: "5px" }}>ADMINISTRADOR</div>}
                  </div>
                  
                  <button 
                    onClick={cerrarSesion} 
                    style={{
                      background: "#fef2f2", color: WC_COLORS.red, border: "none", padding: "10px",
                      borderRadius: "8px", fontWeight: "900", cursor: "pointer", display: "flex", 
                      alignItems: "center", justifyContent: "center", gap: "5px", width: "100%"
                    }}
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      <style>{`
        @keyframes latido { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
        @keyframes aparecer { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ maxWidth: "1100px", margin: "auto", padding: "0 20px" }}>
        <div style={{ background: "white", marginTop: "-20px", padding: "25px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", marginBottom: "40px", position: "relative", zIndex: 1 }}>
          
          <nav style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
            <button onClick={() => setPestaña('album')} style={estiloBoton('album')}>Mi Álbum</button>
            <button onClick={() => setPestaña('progreso')} style={estiloBoton('progreso')}>Progreso</button>
            <button onClick={() => setPestaña('estadisticas')} style={estiloBoton('estadisticas')}>Mercado</button>
            <button onClick={() => setPestaña('pvp')} style={estiloBoton('pvp')}>Intercambiar</button>
            <button onClick={() => setPestaña('migracion')} style={{...estiloBoton('migracion'), background: pestaña === 'migracion' ? WC_COLORS.darkBlue : "#f1f5f9", color: pestaña === 'migracion' ? "white" : WC_COLORS.darkBlue}}> Migrar</button>

            {esAdmin && (
              <>
                <button onClick={() => setPestaña('mapa')} style={{...estiloBoton('mapa'), border: `1.5px solid ${WC_COLORS.darkBlue}`}}>📍 Mapa</button>
                <button onClick={() => setPestaña('admin')} style={estiloBoton('admin', true)}>🛡️ Admin</button>
              </>
            )}
          </nav>

          <main style={{ minHeight: "400px" }}>
          {pestaña === 'album' && <Album usuario={usuario} />}
          {pestaña === 'progreso' && <Progreso />}
          {pestaña === 'estadisticas' && <Estadisticas />}
          {pestaña === 'pvp' && <PvP usuario={usuario} />}
          {pestaña === 'migracion' && <Migracion usuario={usuario} />} {/* <-- Agrega esta línea */}
          {pestaña === 'mapa' && esAdmin && <MapaCiudades publicaciones={publicaciones} />}
          {pestaña === 'admin' && esAdmin && <Admin />}
        </main>
        </div>

        <footer style={{ textAlign: "center", paddingBottom: "30px" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.85em", margin: 0 }}><b>MisMonas</b> © 2026 | Sistema de Coleccionistas</p>
        </footer>
      </div>
    </div>
  );
}

export default App;