// src/App.jsx
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Login from './Login';
import Album from './Album';
import Trueques from './Trueques';
import Estadisticas from './Estadisticas';
import MapaCiudades from './MapaCiudades';
import Admin from './Admin';

function App() {
  const [usuario, setUsuario] = useState(null);
  const [pestaña, setPestaña] = useState('album');
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  // --- CONFIGURACIÓN ADMIN (Pon tu correo aquí) ---
  const EMAILS_ADMIN = ["miglio3929@gmail.com"]; 
  const esAdmin = usuario && EMAILS_ADMIN.includes(usuario.email);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return () => unsub();
  }, []);

  // Carga global de publicaciones (para Mapa y Admin)
  const cargarGlobal = async () => {
    try {
        const q = query(collection(db, "publicaciones"), orderBy("fecha", "desc"));
        const snap = await getDocs(q);
        setPublicaciones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Error cargando datos globales:", e); }
  };

  useEffect(() => { if (usuario) cargarGlobal(); }, [usuario, pestaña]);

  if (cargando) return (
    <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#002b5e", color: "white", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "3em", marginBottom: "10px" }}>⚽</div>
        <h2 style={{ fontWeight: "300", letterSpacing: "2px" }}>CARGANDO MISMONAS...</h2>
      </div>
    </div>
  );

  if (!usuario) return <Login />;

  // Estilo para botones de navegación (Responsive y Modernos)
  const estiloBoton = (id, especial = false) => ({
    flex: "1 1 120px",
    padding: "12px 5px",
    borderRadius: "12px",
    border: "none",
    background: pestaña === id ? (especial ? "#991b1b" : "#002b5e") : "#f1f5f9",
    color: pestaña === id ? "white" : "#002b5e",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9em",
    transition: "0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  });

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: "#1e293b" }}>
      
      {/* HEADER DE PRODUCCIÓN - ANCHO Y PROFESIONAL */}
      <header style={{ background: "linear-gradient(135deg, #002b5e 0%, #004e92 100%)", color: "white", padding: "20px 0", boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: "1100px", margin: "auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          {/* LOGO ALUSIVO AL FÚTBOL */}
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: "white", width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5em", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
              ⚽
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.6em", fontWeight: "800", letterSpacing: "-1px" }}>
                MIS<span style={{ color: "#f59e0b" }}>MONAS</span> <span style={{ fontWeight: "300", fontSize: "0.8em" }}>Hub</span>
              </h1>
              <p style={{ margin: 0, fontSize: "0.75em", opacity: 0.7, textTransform: "uppercase", letterSpacing: "1px" }}>Gestión de Coleccionistas 2026</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.85em", fontWeight: "bold" }}>{usuario.email.split('@')[0]}</div>
              {esAdmin && <span style={{ background: "#fee2e2", color: "#991b1b", padding: "1px 6px", borderRadius: "4px", fontSize: "0.65em", fontWeight: "bold" }}>ADMIN</span>}
            </div>
            <button 
              onClick={() => signOut(auth)} 
              style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "white", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontSize: "0.8em", transition: "0.3s" }}
              onMouseOver={(e) => e.target.style.background = "rgba(255,255,255,0.1)"}
              onMouseOut={(e) => e.target.style.background = "transparent"}
            >
              SALIR
            </button>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL EN CONTENEDOR FLOTANTE */}
      <div style={{ maxWidth: "1100px", margin: "auto", padding: "0 20px" }}>
        <div style={{ background: "white", marginTop: "-30px", padding: "25px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", marginBottom: "40px" }}>
          
          {/* NAVEGACIÓN RESPONSIVA */}
          <nav style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
            <button onClick={() => setPestaña('album')} style={estiloBoton('album')}>📖 Álbum</button>
            <button onClick={() => setPestaña('trueques')} style={estiloBoton('trueques')}>🤝 Intercambio</button>
            <button onClick={() => setPestaña('estadisticas')} style={estiloBoton('estadisticas')}>📊 Datos</button>
            {esAdmin && (
              <>
                <button onClick={() => setPestaña('mapa')} style={{...estiloBoton('mapa'), border: "1.5px solid #002b5e"}}>📍 Mapa</button>
                <button onClick={() => setPestaña('admin')} style={estiloBoton('admin', true)}>🛡️ Admin</button>
              </>
            )}
          </nav>

          <main style={{ minHeight: "400px" }}>
            {pestaña === 'album' && <Album usuario={usuario} />}
            {pestaña === 'trueques' && <Trueques usuarioActual={usuario} />}
            {pestaña === 'estadisticas' && <Estadisticas />}
            {pestaña === 'mapa' && esAdmin && <MapaCiudades publicaciones={publicaciones} />}
            {pestaña === 'admin' && esAdmin && <Admin />}
          </main>
        </div>

        <footer style={{ textAlign: "center", paddingBottom: "30px" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.85em", margin: 0 }}>
            <b>MISMONAS</b> © 2026 | Sistema de Gestión Nacional<br/>
            Desarrollado con ❤️ por Miguel Acevedo
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;