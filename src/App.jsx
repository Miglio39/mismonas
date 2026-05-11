// src/App.jsx
import { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore'; // Importamos doc y getDoc
import Login from './Login';
import Album from './Album';
import Trueques from './Trueques';
import Estadisticas from './Estadisticas';
import Progreso from './Progreso';
import MapaCiudades from './MapaCiudades';
import Admin from './Admin';

// COLORES OFICIALES MUNDIAL 2026
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
  const [nombreUsuario, setNombreUsuario] = useState(''); // <-- NUEVO ESTADO PARA EL NOMBRE
  const [pestaña, setPestaña] = useState('album');
  const [publicaciones, setPublicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const EMAILS_ADMIN = ["miglio3929@gmail.com"]; 
  const esAdmin = usuario && EMAILS_ADMIN.includes(usuario.email);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);
      
      if (user) {
        // <-- NUEVA LÓGICA: Buscar el nombre del usuario en Firestore
        try {
          const userDoc = await getDoc(doc(db, "usuarios", user.uid));
          if (userDoc.exists() && userDoc.data().nombre) {
            // Juntamos el nombre y el apellido
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

  const cargarGlobal = async () => {
    try {
        const q = query(collection(db, "publicaciones"), orderBy("fecha", "desc"));
        const snap = await getDocs(q);
        setPublicaciones(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error("Error cargando datos globales:", e); }
  };

  useEffect(() => { if (usuario) cargarGlobal(); }, [usuario, pestaña]);

 if (cargando) return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      background: "#16171d", /* Fondo oscuro base para alto contraste */
      color: "white", display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", zIndex: 9999, fontFamily: "'Inter', sans-serif"
    }}>
      {/* Fondo de Estadio Difuminado */}
      <img 
        src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1974&auto=format&fit=crop" 
        alt="Fondo Estadio" 
        style={{
          position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.15, filter: "blur(5px)", 
          zIndex: -1
        }}
      />
      
      {/* Balón de Fútbol Girando */}
      <img 
        src="/balon-de-futbol.png" 
        alt="Cargando..." 
        style={{
          width: "90px", height: "90px", marginBottom: "25px",
          animation: "giroSuave 2s linear infinite",
          filter: "drop-shadow(0px 10px 15px rgba(0,0,0,0.5))" /* Sombra para que resalte más */
        }}
      />
      
      {/* Textos Claros y Legibles */}
      <h2 style={{
        margin: "0 0 10px 0", fontSize: "1.8em", fontWeight: "900",
        letterSpacing: "1px", color: "#fff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" 
      }}>
        MisMonas 2026
      </h2>
      <p style={{
        margin: 0, fontSize: "0.95em", color: WC_COLORS.lightBlue,
        opacity: 0.9, letterSpacing: "2px", textTransform: "uppercase", fontWeight: "bold",
        textShadow: "0 1px 3px rgba(0,0,0,0.8)"
      }}>
        Iniciando Plataforma...
      </p>

      {/* Animación inyectada directamente para que funcione sin tocar CSS extra */}
      <style>{`
        @keyframes giroSuave {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );

  if (!usuario) return <Login />;

  const estiloBoton = (id, especial = false) => ({
    flex: "1 1 120px",
    padding: "12px 5px",
    borderRadius: "12px",
    border: "none",
    background: pestaña === id ? (especial ? WC_COLORS.red : WC_COLORS.green) : "#f1f5f9",
    color: pestaña === id ? WC_COLORS.white : WC_COLORS.darkBlue,
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9em",
    transition: "0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "5px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    boxShadow: pestaña === id ? `0 4px 10px ${WC_COLORS.green}40` : "none"
  });

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', system-ui, sans-serif", color: "#1e293b" }}>
      
      <header style={{ background: WC_COLORS.darkBlue, color: WC_COLORS.white, padding: "20px 0", borderBottom: `4px solid ${WC_COLORS.lime}`, boxShadow: "0 4px 15px rgba(0,0,0,0.15)" }}>
        <div style={{ maxWidth: "1100px", margin: "auto", padding: "0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ background: WC_COLORS.white, width: "45px", height: "45px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5em", boxShadow: "0 4px 10px rgba(0,0,0,0.2)" }}>
              ⚽
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.8em", fontWeight: "900", letterSpacing: "-1px" }}>
                Mis<span style={{ color: WC_COLORS.lime }}>Monas</span>
              </h1>
              <p style={{ margin: 0, fontSize: "0.75em", opacity: 0.8, textTransform: "uppercase", letterSpacing: "1px" }}>Colección Oficial 2026</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ textAlign: "right" }}>
              {/* <-- AQUÍ MOSTRAMOS EL NOMBRE DEL USUARIO EN LUGAR DEL CORREO --> */}
              <div style={{ fontSize: "0.9em", fontWeight: "bold", textTransform: "capitalize" }}>
                {nombreUsuario || usuario.email.split('@')[0]}
              </div>
              {esAdmin && <span style={{ background: WC_COLORS.red, color: WC_COLORS.white, padding: "2px 8px", borderRadius: "4px", fontSize: "0.65em", fontWeight: "bold" }}>ADMIN</span>}
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

      <div style={{ maxWidth: "1100px", margin: "auto", padding: "0 20px" }}>
        <div style={{ background: "white", marginTop: "-20px", padding: "25px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)", marginBottom: "40px" }}>
          
          <nav style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
            <button onClick={() => setPestaña('album')} style={estiloBoton('album')}>📖 Mi Álbum</button>
            <button onClick={() => setPestaña('progreso')} style={estiloBoton('progreso')}>📈 Progreso</button>
            <button onClick={() => setPestaña('trueques')} style={estiloBoton('trueques')}>🤝 Intercambio</button>
            <button onClick={() => setPestaña('estadisticas')} style={estiloBoton('estadisticas')}>🌍 Mercado</button>
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
            {pestaña === 'trueques' && <Trueques usuarioActual={usuario} />}
            {pestaña === 'estadisticas' && <Estadisticas />}
            {pestaña === 'mapa' && esAdmin && <MapaCiudades publicaciones={publicaciones} />}
            {pestaña === 'admin' && esAdmin && <Admin />}
          </main>
        </div>

        <footer style={{ textAlign: "center", paddingBottom: "30px" }}>
          <p style={{ color: "#94a3b8", fontSize: "0.85em", margin: 0 }}>
            <b>MisMonas</b> © 2026 | Sistema de Coleccionistas<br/>            
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;