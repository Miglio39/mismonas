import { useState, useEffect } from 'react';
import { db } from './firebase';
import { 
  doc, setDoc, updateDoc, getDoc, 
  collection, getDocs, deleteDoc 
} from 'firebase/firestore';

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

const seccionesAlbum = [
  { prefijo: "", nombre: "Especial Panini", inicio: 0, fin: 0 },
  { prefijo: "FWC", nombre: "Especiales FIFA", inicio: 1, fin: 20 },
  { prefijo: "USA", nombre: "Estados Unidos", inicio: 1, fin: 20 },
  { prefijo: "MEX", nombre: "México", inicio: 1, fin: 20 },
  { prefijo: "CAN", nombre: "Canadá", inicio: 1, fin: 20 },
  { prefijo: "PAN", nombre: "Panamá", inicio: 1, fin: 20 },
  { prefijo: "HAI", nombre: "Haití", inicio: 1, fin: 20 },
  { prefijo: "CUW", nombre: "Curazao", inicio: 1, fin: 20 },
  { prefijo: "ARG", nombre: "Argentina", inicio: 1, fin: 20 },
  { prefijo: "BRA", nombre: "Brasil", inicio: 1, fin: 20 },
  { prefijo: "COL", nombre: "Colombia", inicio: 1, fin: 20 },
  { prefijo: "URU", nombre: "Uruguay", inicio: 1, fin: 20 },
  { prefijo: "ECU", nombre: "Ecuador", inicio: 1, fin: 20 },
  { prefijo: "PAR", nombre: "Paraguay", inicio: 1, fin: 20 },
  { prefijo: "ESP", nombre: "España", inicio: 1, fin: 20 },
  { prefijo: "ENG", nombre: "Inglaterra", inicio: 1, fin: 20 },
  { prefijo: "FRA", nombre: "Francia", inicio: 1, fin: 20 },
  { prefijo: "GER", nombre: "Alemania", inicio: 1, fin: 20 },
  { prefijo: "POR", nombre: "Portugal", inicio: 1, fin: 20 },
  { prefijo: "NED", nombre: "Países Bajos", inicio: 1, fin: 20 },
  { prefijo: "CRO", nombre: "Croacia", inicio: 1, fin: 20 },
  { prefijo: "BEL", nombre: "Bélgica", inicio: 1, fin: 20 },
  { prefijo: "SUI", nombre: "Suiza", inicio: 1, fin: 20 },
  { prefijo: "AUT", nombre: "Austria", inicio: 1, fin: 20 },
  { prefijo: "TUR", nombre: "Turquía", inicio: 1, fin: 20 },
  { prefijo: "BIH", nombre: "Bosnia", inicio: 1, fin: 20 },
  { prefijo: "SCO", nombre: "Escocia", inicio: 1, fin: 20 },
  { prefijo: "SWE", nombre: "Suecia", inicio: 1, fin: 20 },
  { prefijo: "NOR", nombre: "Noruega", inicio: 1, fin: 20 },
  { prefijo: "CZE", nombre: "República Checa", inicio: 1, fin: 20 },
  { prefijo: "MAR", nombre: "Marruecos", inicio: 1, fin: 20 },
  { prefijo: "SEN", nombre: "Senegal", inicio: 1, fin: 20 },
  { prefijo: "EGY", nombre: "Egipto", inicio: 1, fin: 20 },
  { prefijo: "CIV", nombre: "Costa de Marfil", inicio: 1, fin: 20 },
  { prefijo: "ALG", nombre: "Argelia", inicio: 1, fin: 20 },
  { prefijo: "GHA", nombre: "Ghana", inicio: 1, fin: 20 },
  { prefijo: "RSA", nombre: "Sudáfrica", inicio: 1, fin: 20 },
  { prefijo: "TUN", nombre: "Túnez", inicio: 1, fin: 20 },
  { prefijo: "COD", nombre: "RD Congo", inicio: 1, fin: 20 },
  { prefijo: "CPV", nombre: "Cabo Verde", inicio: 1, fin: 20 },
  { prefijo: "JPN", nombre: "Japón", inicio: 1, fin: 20 },
  { prefijo: "KOR", nombre: "Corea del Sur", inicio: 1, fin: 20 },
  { prefijo: "IRN", nombre: "Irán", inicio: 1, fin: 20 },
  { prefijo: "KSA", nombre: "Arabia Saudita", inicio: 1, fin: 20 },
  { prefijo: "AUS", nombre: "Australia", inicio: 1, fin: 20 },
  { prefijo: "QAT", nombre: "Qatar", inicio: 1, fin: 20 },
  { prefijo: "IRQ", nombre: "Irak", inicio: 1, fin: 20 },
  { prefijo: "JOR", nombre: "Jordania", inicio: 1, fin: 20 },
  { prefijo: "UZB", nombre: "Uzbekistán", inicio: 1, fin: 20 },
  { prefijo: "NZL", nombre: "Nueva Zelanda", inicio: 1, fin: 20 },
  { prefijo: "CC", nombre: "Coca-Cola", inicio: 1, fin: 14 }
];

export default function Admin() {
  const [textoLista, setTextoLista] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [totalListas, setTotalListas] = useState(0);
  const [inventarioFull, setInventarioFull] = useState({});
  const [top10, setTop10] = useState({ faltantes: [], repetidas: [] });
  const [usuariosRegistrados, setUsuariosRegistrados] = useState([]);
  const [publicacionesMuro, setPublicacionesMuro] = useState([]);
  const [busquedaGlobal, setBusquedaGlobal] = useState('');

  useEffect(() => {
    cargarDatosAdmin();
    cargarMuro();
  }, []);

  const cargarMuro = async () => {
    try {
      const muroRef = collection(db, 'publicaciones'); 
      const snap = await getDocs(muroRef);
      const posts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      posts.sort((a, b) => {
        const timeA = a.fecha?.toMillis() || 0;
        const timeB = b.fecha?.toMillis() || 0;
        return timeB - timeA;
      });
      
      setPublicacionesMuro(posts);
    } catch (error) {
      console.error("Error al cargar el muro:", error);
    }
  };

  const eliminarPublicacionMuro = async (id) => {
    if (window.confirm("⚠️ ¿Seguro que deseas eliminar esta publicación del muro de coleccionistas?")) {
      try {
        await deleteDoc(doc(db, "publicaciones", id)); 
        setMensaje("🗑️ Publicación eliminada del muro.");
        cargarMuro(); 
      } catch (e) {
        setMensaje("❌ Error al eliminar la publicación.");
      }
    }
  };

  const cargarDatosAdmin = async () => {
    const mercadoRef = doc(db, 'estadisticas', 'mercado_global');
    const snap = await getDoc(mercadoRef);
    const inventariosRef = collection(db, "inventarios");
    const inventariosSnap = await getDocs(inventariosRef);

    let mapNombres = {};
    try {
      const usersSnap = await getDocs(collection(db, "usuarios")); 
      usersSnap.forEach(uDoc => {
        const data = uDoc.data();
        mapNombres[uDoc.id] = data.nombre || data.displayName || data.email || "Sin Nombre";
      });
    } catch (e) {
      console.log("No se encontró la colección de usuarios.");
    }

    let conteoHibrido = {};
    let listaU = [];
    
    seccionesAlbum.forEach(seccion => {
      for (let i = seccion.inicio; i <= seccion.fin; i++) {
        let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
        conteoHibrido[codigo] = 0;
      }
    });

    if (snap.exists()) {
      const data = snap.data();
      const listasAdmin = data.total_listas_procesadas || 0;
      setTotalListas(listasAdmin);
      
      // DEDUCCIÓN LÓGICA DE LISTAS DE ADMIN
      Object.keys(conteoHibrido).forEach(cod => {
        conteoHibrido[cod] += listasAdmin; // Asume 1 copia pegada
      });

      Object.entries(data.faltantes || {}).forEach(([cod, cant]) => {
        if (conteoHibrido[cod] !== undefined) conteoHibrido[cod] -= cant; // Resta porque no la tiene
      });

      Object.entries(data.repetidas || {}).forEach(([cod, cant]) => {
        if (conteoHibrido[cod] !== undefined) conteoHibrido[cod] += cant; // Suma la copia extra
      });
    }

    inventariosSnap.forEach(docU => {
      const inv = docU.data();
      let totalMonaUsuario = 0;
      Object.entries(inv).forEach(([cod, cant]) => {
        if (conteoHibrido[cod] !== undefined) {
          conteoHibrido[cod] += cant;
          totalMonaUsuario += cant;
        }
      });
      listaU.push({ 
        id: docU.id, 
        nombre: mapNombres[docU.id] || "Usuario Anónimo", 
        total: totalMonaUsuario 
      });
    });

    setInventarioFull(conteoHibrido);
    setUsuariosRegistrados(listaU);

    if (snap.exists()) {
      const data = snap.data();
      const ordenar = (obj) => Object.entries(obj || {})
        .filter(([key]) => key !== 'total_listas_procesadas')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

      setTop10({
        faltantes: ordenar(data.faltantes),
        repetidas: ordenar(data.repetidas)
      });
    }
  };

  const eliminarInventarioUsuario = async (uid, nombre) => {
    if (window.confirm(`⚠️ ¿Eliminar el registro de "${nombre}" (${uid})? Esta acción borrará todas sus monas.`)) {
      try {
        await deleteDoc(doc(db, "inventarios", uid));
        setMensaje(`🗑️ El inventario de ${nombre} ha sido eliminado.`);
        cargarDatosAdmin();
      } catch (e) {
        setMensaje("❌ Error al eliminar usuario.");
      }
    }
  };

  const procesarTexto = (texto) => {
    const resultado = { faltantes: [], repetidas: [] };
    let modoActual = null;
    
    // Obtenemos los prefijos válidos de nuestra base de datos para ignorar URLs o basura
    const prefijosValidos = seccionesAlbum.map(s => s.prefijo).filter(p => p !== "");

    texto.split('\n').forEach(linea => {
      const str = linea.trim().toLowerCase();
      if (!str) return;
      if (str.includes('faltan') || str.includes('busco')) { modoActual = 'faltantes'; return; }
      if (str.includes('repetida') || str.includes('tengo')) { modoActual = 'repetidas'; return; }
      
      if (modoActual && linea.includes(':')) {
        const partes = linea.split(':');
        const matchPrefijo = partes[0].toUpperCase().match(/([A-Z]+)/);
        if (!matchPrefijo) return;
        
        const prefijo = matchPrefijo[1];
        // ESCUDO DE SEGURIDAD: Ignoramos cosas como "HTTPS"
        if (!prefijosValidos.includes(prefijo) && prefijo !== "00") return;

        const numeros = partes[1].split(',').map(n => n.trim().replace(/[^0-9]/g, '')).filter(n => n !== '');
        numeros.forEach(num => {
          const codigoFinal = num === '00' ? '00' : `${prefijo}${num}`;
          resultado[modoActual].push(codigoFinal);
        });
      }
    });
    return resultado;
  };

  const alimentarMercado = async () => {
    if (!textoLista.trim()) return;
    setProcesando(true);
    try {
      const datos = procesarTexto(textoLista);
      
      if (datos.faltantes.length === 0 && datos.repetidas.length === 0) {
        setMensaje('⚠️ No se detectaron códigos válidos para el álbum en este texto.');
        setProcesando(false);
        return;
      }

      const mercadoRef = doc(db, 'estadisticas', 'mercado_global');
      const snap = await getDoc(mercadoRef);
      
      let dataActual = { faltantes: {}, repetidas: {}, total_listas_procesadas: 0 };
      if (snap.exists()) {
        dataActual = snap.data();
      } else {
        await setDoc(mercadoRef, dataActual);
      }

      // SOLUCIÓN AL LÍMITE DE FIREBASE: Sumamos en JS en lugar de usar increment()
      const actualizaciones = { 
        total_listas_procesadas: (dataActual.total_listas_procesadas || 0) + 1 
      };

      if (datos.faltantes.length > 0) {
        datos.faltantes.forEach(c => { 
          const cantidadAnterior = (dataActual.faltantes && dataActual.faltantes[c]) ? dataActual.faltantes[c] : 0;
          if (actualizaciones[`faltantes.${c}`]) {
              actualizaciones[`faltantes.${c}`]++;
          } else {
              actualizaciones[`faltantes.${c}`] = cantidadAnterior + 1;
          }
        });
      }

      if (datos.repetidas.length > 0) {
        datos.repetidas.forEach(c => { 
          const cantidadAnterior = (dataActual.repetidas && dataActual.repetidas[c]) ? dataActual.repetidas[c] : 0;
          if (actualizaciones[`repetidas.${c}`]) {
              actualizaciones[`repetidas.${c}`]++;
          } else {
              actualizaciones[`repetidas.${c}`] = cantidadAnterior + 1;
          }
        });
      }

      await updateDoc(mercadoRef, actualizaciones);
      
      setMensaje(`✅ Éxito: +${datos.faltantes.length} faltantes y +${datos.repetidas.length} repetidas sumadas al mercado.`);
      setTextoLista('');
      cargarDatosAdmin();
    } catch (e) { 
      console.error(e);
      setMensaje('❌ Error al procesar: ' + e.message); 
    } finally { 
      setProcesando(false); 
    }
  };

  const reiniciarMercado = async () => {
    if (window.confirm("⚠️ ¿Resetear mercado global?") && window.prompt("Escribe 'BORRAR TODO':") === "BORRAR TODO") {
      await setDoc(doc(db, 'estadisticas', 'mercado_global'), { faltantes: {}, repetidas: {}, total_listas_procesadas: 0 });
      cargarDatosAdmin();
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "auto", padding: "20px", fontFamily: "sans-serif" }}>
      
      <div style={{ display: "flex", gap: "15px", marginBottom: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 200px", background: "#00205B", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
          <span style={{ fontSize: "0.8em", opacity: 0.8 }}>Listas Admin</span>
          <div style={{ fontSize: "2em", fontWeight: "bold" }}>{totalListas}</div>
        </div>
        <div style={{ flex: "1 1 200px", background: "#00B140", color: "white", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
          <span style={{ fontSize: "0.8em", opacity: 0.8 }}>Total Registros (Híbrido)</span>
          <div style={{ fontSize: "2em", fontWeight: "bold" }}>
            {Object.values(inventarioFull).reduce((a, b) => a + b, 0)}
          </div>
        </div>
      </div>

      <textarea 
        rows="5"
        placeholder="Pega la lista de WhatsApp aquí..."
        value={textoLista}
        onChange={(e) => setTextoLista(e.target.value)}
        style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "2px solid #eee", marginBottom: "10px", fontSize: "16px", boxSizing: "border-box" }}
      />
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "30px", flexWrap: "wrap" }}>
        <button onClick={alimentarMercado} disabled={procesando} style={{ flex: "1 1 200px", background: "#00B140", color: "white", padding: "12px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
          {procesando ? 'Procesando...' : '📥 Cargar Lista'}
        </button>
        <button onClick={reiniciarMercado} style={{ flex: "1 1 100px", background: "none", border: "1px solid #E4002B", color: "#E4002B", padding: "12px", borderRadius: "8px", cursor: "pointer" }}>🗑️ Reset</button>
      </div>

      {mensaje && <p style={{ textAlign: "center", fontWeight: "bold", color: mensaje.includes('✅') || mensaje.includes('🗑️') ? "green" : "red" }}>{mensaje}</p>}

      {/* GESTIÓN DEL MURO */}
      <div style={{ background: "white", border: "1px solid #ddd", borderRadius: "12px", marginBottom: "30px", overflow: "hidden" }}>
        <div style={{ background: "#E4002B", color: "white", padding: "12px", fontWeight: "bold" }}>📢 Gestión del Muro de Coleccionistas</div>
        <div style={{ maxHeight: "300px", overflowY: "auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left", fontSize: "0.85em" }}>
                <th style={{ padding: "10px" }}>FECHA</th>
                <th style={{ padding: "10px" }}>USUARIO</th>
                <th style={{ padding: "10px" }}>UBICACIÓN</th>
                <th style={{ padding: "10px", textAlign: "center" }}>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {publicacionesMuro.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>No hay publicaciones en el muro.</td></tr>
              ) : (
                publicacionesMuro.map(pub => (
                  <tr key={pub.id} style={{ borderTop: "1px solid #eee" }}>
                    <td style={{ padding: "10px", fontSize: "0.80em", color: "#64748b", whiteSpace: "nowrap" }}>
                      {pub.fecha ? new Date(pub.fecha.toDate()).toLocaleString() : 'Reciente'}
                    </td>
                    <td style={{ padding: "10px", fontWeight: "bold", color: WC_COLORS.darkBlue, whiteSpace: "nowrap" }}>
                      {pub.email ? pub.email.split('@')[0] : 'Anónimo'}
                    </td>
                    <td style={{ padding: "10px", fontSize: "0.85em", color: "#334155", whiteSpace: "nowrap" }}>
                      📍 {pub.ciudad}, {pub.departamento}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <button 
                        onClick={() => eliminarPublicacionMuro(pub.id)}
                        style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "6px 12px", borderRadius: "5px", cursor: "pointer", fontSize: "0.8em", fontWeight: "bold" }}
                      >
                        Borrar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* GESTIÓN DE USUARIOS */}
      <div style={{ background: "white", border: "1px solid #ddd", borderRadius: "12px", marginBottom: "30px", overflow: "hidden" }}>
        <div style={{ background: "#00205B", color: "white", padding: "12px", fontWeight: "bold" }}>👥 Gestión de Usuarios Registrados</div>
        <div style={{ maxHeight: "250px", overflowY: "auto", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left", fontSize: "0.85em" }}>
                <th style={{ padding: "10px" }}>NOMBRE</th>
                <th style={{ padding: "10px" }}>ID / UID</th>
                <th style={{ padding: "10px" }}>TOTAL MONAS</th>
                <th style={{ padding: "10px", textAlign: "center" }}>ACCIÓN</th>
              </tr>
            </thead>
            <tbody>
              {usuariosRegistrados.map(u => (
                <tr key={u.id} style={{ borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "10px", fontWeight: "bold", color: WC_COLORS.darkBlue, whiteSpace: "nowrap" }}>{u.nombre}</td>
                  <td style={{ padding: "10px", fontSize: "0.80em", color: "#64748b" }}>{u.id}</td>
                  <td style={{ padding: "10px", fontWeight: "bold" }}>{u.total}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <button 
                      onClick={() => eliminarInventarioUsuario(u.id, u.nombre)}
                      style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer", fontSize: "0.8em", fontWeight: "bold" }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "15px", border: "1px solid #e2e8f0", marginBottom: "30px" }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#00205B" }}>🔍 Inventario Global Detallado</h3>
        <input 
          type="text" 
          placeholder="Busca cualquier mona (Ej: MEX1, FWC8...)" 
          value={busquedaGlobal}
          onChange={(e) => setBusquedaGlobal(e.target.value.toUpperCase())}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "15px" }}
        />
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: "10px", maxHeight: "300px", overflowY: "auto", padding: "5px" }}>
          {Object.entries(inventarioFull)
            .filter(([cod]) => cod.includes(busquedaGlobal))
            .map(([cod, cant]) => (
              <div key={cod} style={{ background: "white", padding: "8px", borderRadius: "8px", border: "1px solid #eee", textAlign: "center", fontSize: "0.85em" }}>
                <b style={{ color: "#00205B" }}>{cod}</b>
                <div style={{ color: cant > 0 ? WC_COLORS.green : "#94a3b8", fontWeight: "bold" }}>{cant} unid.</div>
              </div>
            ))
          }
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 300px", maxWidth: "100%", background: "white", border: "1px solid #ddd", borderRadius: "12px", overflowX: "auto" }}>
          <div style={{ background: "#E4002B", color: "white", padding: "10px", fontWeight: "bold" }}>💎 Top 10 Buscadas (Admin)</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {top10.faltantes.map(([cod, cant]) => (
                <tr key={cod} style={{ borderTop: "1px solid #eee" }}><td style={{ padding: "10px" }}>{cod}</td><td style={{ textAlign: "right", padding: "10px", color: "#E4002B" }}><b>{cant} veces</b></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: "1 1 300px", maxWidth: "100%", background: "white", border: "1px solid #ddd", borderRadius: "12px", overflowX: "auto" }}>
          <div style={{ background: "#00A3E0", color: "white", padding: "10px", fontWeight: "bold" }}>📦 Top 10 Repetidas (Admin)</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {top10.repetidas.map(([cod, cant]) => (
                <tr key={cod} style={{ borderTop: "1px solid #eee" }}><td style={{ padding: "10px" }}>{cod}</td><td style={{ textAlign: "right", padding: "10px", color: "#00A3E0" }}><b>{cant} veces</b></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}