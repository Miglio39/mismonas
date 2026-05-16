// src/Admin.jsx
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, updateDoc, getDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

const WC_COLORS = { green: "#00B140", darkBlue: "#00205B", lightBlue: "#00A3E0", red: "#E4002B", lime: "#97D700" };

// ORDEN PERSONALIZADO SINCRONIZADO CON FWC CORREGIDO HASTA 19
const seccionesAlbum = [
  { prefijo: "", nombre: "Especial Panini", bandera: "/logo_panini_especial.png", inicio: 0, fin: 0 },
  { prefijo: "FWC", nombre: "Especiales FIFA", bandera: "https://upload.wikimedia.org/wikipedia/commons/a/aa/FIFA_logo_without_slogan.svg", inicio: 1, fin: 19 },
  { prefijo: "MEX", nombre: "México", bandera: "https://flagcdn.com/w40/mx.png", inicio: 1, fin: 20 },
  { prefijo: "RSA", nombre: "Sudáfrica", bandera: "https://flagcdn.com/w40/za.png", inicio: 1, fin: 20 },
  { prefijo: "KOR", nombre: "Corea del Sur", bandera: "https://flagcdn.com/w40/kr.png", inicio: 1, fin: 20 },
  { prefijo: "CZE", nombre: "República Checa", bandera: "https://flagcdn.com/w40/cz.png", inicio: 1, fin: 20 },
  { prefijo: "CAN", nombre: "Canadá", bandera: "https://flagcdn.com/w40/ca.png", inicio: 1, fin: 20 },
  { prefijo: "BIH", nombre: "Bosnia y Herzegovina", bandera: "https://flagcdn.com/w40/ba.png", inicio: 1, fin: 20 },
  { prefijo: "QAT", nombre: "Qatar", bandera: "https://flagcdn.com/w40/qa.png", inicio: 1, fin: 20 },
  { prefijo: "SUI", nombre: "Suiza", bandera: "https://flagcdn.com/w40/ch.png", inicio: 1, fin: 20 },
  { prefijo: "BRA", nombre: "Brasil", bandera: "https://flagcdn.com/w40/br.png", inicio: 1, fin: 20 },
  { prefijo: "MAR", nombre: "Marruecos", bandera: "https://flagcdn.com/w40/ma.png", inicio: 1, fin: 20 },
  { prefijo: "HAI", nombre: "Haití", bandera: "https://flagcdn.com/w40/ht.png", inicio: 1, fin: 20 },
  { prefijo: "SCO", nombre: "Escocia", bandera: "https://flagcdn.com/w40/gb-sct.png", inicio: 1, fin: 20 },
  { prefijo: "USA", nombre: "Estados Unidos", bandera: "https://flagcdn.com/w40/us.png", inicio: 1, fin: 20 },
  { prefijo: "PAR", nombre: "Paraguay", bandera: "https://flagcdn.com/w40/py.png", inicio: 1, fin: 20 },
  { prefijo: "AUS", nombre: "Australia", bandera: "https://flagcdn.com/w40/au.png", inicio: 1, fin: 20 },
  { prefijo: "TUR", nombre: "Turquía", bandera: "https://flagcdn.com/w40/tr.png", inicio: 1, fin: 20 },
  { prefijo: "GER", nombre: "Alemania", bandera: "https://flagcdn.com/w40/de.png", inicio: 1, fin: 20 },
  { prefijo: "CUW", nombre: "Curazao", bandera: "https://flagcdn.com/w40/cw.png", inicio: 1, fin: 20 },
  { prefijo: "CIV", nombre: "Costa de Marfil", bandera: "https://flagcdn.com/w40/ci.png", inicio: 1, fin: 20 },
  { prefijo: "ECU", nombre: "Ecuador", bandera: "https://flagcdn.com/w40/ec.png", inicio: 1, fin: 20 },
  { prefijo: "NED", nombre: "Países Bajos", bandera: "https://flagcdn.com/w40/nl.png", inicio: 1, fin: 20 },
  { prefijo: "JPN", nombre: "Japón", bandera: "https://flagcdn.com/w40/jp.png", inicio: 1, fin: 20 },
  { prefijo: "SWE", nombre: "Suecia", bandera: "https://flagcdn.com/w40/se.png", inicio: 1, fin: 20 },
  { prefijo: "TUN", nombre: "Túnez", bandera: "https://flagcdn.com/w40/tn.png", inicio: 1, fin: 20 },
  { prefijo: "BEL", nombre: "Bélgica", bandera: "https://flagcdn.com/w40/be.png", inicio: 1, fin: 20 },
  { prefijo: "EGY", nombre: "Egipto", bandera: "https://flagcdn.com/w40/eg.png", inicio: 1, fin: 20 },
  { prefijo: "IRN", nombre: "Irán", bandera: "https://flagcdn.com/w40/ir.png", inicio: 1, fin: 20 },
  { prefijo: "NZL", nombre: "Nueva Zelanda", bandera: "https://flagcdn.com/w40/nz.png", inicio: 1, fin: 20 },
  { prefijo: "ESP", nombre: "España", bandera: "https://flagcdn.com/w40/es.png", inicio: 1, fin: 20 },
  { prefijo: "CPV", nombre: "Cabo Verde", bandera: "https://flagcdn.com/w40/cv.png", inicio: 1, fin: 20 },
  { prefijo: "KSA", nombre: "Arabia Saudita", bandera: "https://flagcdn.com/w40/sa.png", inicio: 1, fin: 20 },
  { prefijo: "URU", nombre: "Uruguay", bandera: "https://flagcdn.com/w40/uy.png", inicio: 1, fin: 20 },
  { prefijo: "FRA", nombre: "Francia", bandera: "https://flagcdn.com/w40/fr.png", inicio: 1, fin: 20 },
  { prefijo: "SEN", nombre: "Senegal", bandera: "https://flagcdn.com/w40/sn.png", inicio: 1, fin: 20 },
  { prefijo: "IRQ", nombre: "Irak", bandera: "https://flagcdn.com/w40/iq.png", inicio: 1, fin: 20 },
  { prefijo: "NOR", nombre: "Noruega", bandera: "https://flagcdn.com/w40/no.png", inicio: 1, fin: 20 },
  { prefijo: "ARG", nombre: "Argentina", bandera: "https://flagcdn.com/w40/ar.png", inicio: 1, fin: 20 },
  { prefijo: "ALG", nombre: "Argelia", bandera: "https://flagcdn.com/w40/dz.png", inicio: 1, fin: 20 },
  { prefijo: "AUT", nombre: "Austria", bandera: "https://flagcdn.com/w40/at.png", inicio: 1, fin: 20 },
  { prefijo: "JOR", nombre: "Jordania", bandera: "https://flagcdn.com/w40/jo.png", inicio: 1, fin: 20 },
  { prefijo: "POR", nombre: "Portugal", bandera: "https://flagcdn.com/w40/pt.png", inicio: 1, fin: 20 },
  { prefijo: "COD", nombre: "RD Congo", bandera: "https://flagcdn.com/w40/cd.png", inicio: 1, fin: 20 },
  { prefijo: "UZB", nombre: "Uzbekistán", bandera: "https://flagcdn.com/w40/uz.png", inicio: 1, fin: 20 },
  { prefijo: "COL", nombre: "Colombia", bandera: "https://flagcdn.com/w40/co.png", inicio: 1, fin: 20 },
  { prefijo: "ENG", nombre: "Inglaterra", bandera: "https://flagcdn.com/w40/gb-eng.png", inicio: 1, fin: 20 },
  { prefijo: "CRO", nombre: "Croacia", bandera: "https://flagcdn.com/w40/hr.png", inicio: 1, fin: 20 },
  { prefijo: "GHA", nombre: "Ghana", bandera: "https://flagcdn.com/w40/gh.png", inicio: 1, fin: 20 },
  { prefijo: "PAN", nombre: "Panamá", bandera: "https://flagcdn.com/w40/pa.png", inicio: 1, fin: 20 },
  { prefijo: "CC", nombre: "Coca-Cola", bandera: "https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg", inicio: 1, fin: 14 }
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

  // ESTADOS PARA EL NUEVO VISOR DE ÁLBUMES DE USUARIO
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState('');
  const [inventarioTarget, setInventarioTarget] = useState(null);
  const [cargandoAlbum, setCargandoAlbum] = useState(false);

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
      
      Object.keys(conteoHibrido).forEach(cod => {
        conteoHibrido[cod] += listasAdmin; 
      });

      Object.entries(data.faltantes || {}).forEach(([cod, cant]) => {
        if (conteoHibrido[cod] !== undefined) conteoHibrido[cod] -= cant; 
      });

      Object.entries(data.repetidas || {}).forEach(([cod, cant]) => {
        if (conteoHibrido[cod] !== undefined) conteoHibrido[cod] += cant; 
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

    listaU.sort((a, b) => a.nombre.localeCompare(b.nombre));
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

  // EFECTO PARA CARGAR EL INVENTARIO DEL USUARIO SELECCIONADO
  useEffect(() => {
    if (!usuarioSeleccionado) {
      setInventarioTarget(null);
      return;
    }

    const cargarInventarioTarget = async () => {
      setCargandoAlbum(true);
      try {
        const docRef = doc(db, "inventarios", usuarioSeleccionado);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInventarioTarget(docSnap.data());
        } else {
          setInventarioTarget({});
        }
      } catch (error) {
        console.error("Error al cargar el inventario del usuario:", error);
      }
      setCargandoAlbum(false);
    };

    cargarInventarioTarget();
  }, [usuarioSeleccionado]);

  // Cálculos estadísticos para el usuario seleccionado
  let uFaltan = 0, uLlevo = 0, uRepetidas = 0;
  if (inventarioTarget) {
    seccionesAlbum.forEach(seccion => {
      for (let i = seccion.inicio; i <= seccion.fin; i++) {
        let codigo = seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`;
        let cant = inventarioTarget[codigo] || 0;
        if (cant === 0) uFaltan++;
        else {
          uLlevo++;
          if (cant > 1) uRepetidas += (cant - 1);
        }
      }
    });
  }

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

      {/* NUEVO MÓDULO: VISOR DE ÁLBUMES DE USUARIO */}
      <div style={{ background: "white", padding: "20px", borderRadius: "12px", border: `2px solid ${WC_COLORS.darkBlue}`, marginBottom: "30px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
        <h3 style={{ margin: "0 0 15px 0", color: WC_COLORS.darkBlue }}>👁️ Auditoría de Álbum</h3>
        
        <select 
          value={usuarioSeleccionado} 
          onChange={(e) => setUsuarioSeleccionado(e.target.value)}
          style={{ width: "100%", padding: "12px 15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1em", outline: "none", cursor: "pointer", background: "#f8fafc", marginBottom: "20px" }}
        >
          <option value="">-- Selecciona un usuario para auditar su álbum --</option>
          {usuariosRegistrados.map(u => (
            <option key={`select-${u.id}`} value={u.id}>{u.nombre} (Total: {u.total})</option>
          ))}
        </select>

        {cargandoAlbum && <p style={{ textAlign: "center", color: WC_COLORS.darkBlue, fontWeight: "bold" }}>🔄 Cargando álbum...</p>}

        {!cargandoAlbum && inventarioTarget && (
          <div style={{ animation: "aparecer 0.4s ease-out" }}>
            
            <div style={{ background: WC_COLORS.darkBlue, color: "white", padding: "15px", borderRadius: "10px", marginBottom: "20px", display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.75em", opacity: 0.8, textTransform: "uppercase" }}>Faltan</span>
                <b style={{ display: "block", fontSize: "1.5em", color: WC_COLORS.red }}>{uFaltan}</b>
              </div>
              <div style={{ textAlign: "center", borderLeft: "1px solid rgba(255,255,255,0.2)", borderRight: "1px solid rgba(255,255,255,0.2)", padding: "0 20px" }}>
                <span style={{ fontSize: "0.75em", opacity: 0.8, textTransform: "uppercase" }}>Llevo</span>
                <b style={{ display: "block", fontSize: "1.5em", color: WC_COLORS.green }}>{uLlevo}</b>
              </div>
              <div style={{ textAlign: "center" }}>
                <span style={{ fontSize: "0.75em", opacity: 0.8, textTransform: "uppercase" }}>Repetidas</span>
                <b style={{ display: "block", fontSize: "1.5em", color: WC_COLORS.lightBlue }}>{uRepetidas}</b>
              </div>
            </div>

            <div style={{ background: WC_COLORS.red, color: "white", textAlign: "center", padding: "5px", borderRadius: "5px", marginBottom: "15px", fontSize: "0.8em", fontWeight: "bold" }}>
              MODO SOLO LECTURA
            </div>

            {seccionesAlbum.map(seccion => {
              const monasVisibles = [];
              for (let i = seccion.inicio; i <= seccion.fin; i++) {
                monasVisibles.push(seccion.prefijo === "" && i === 0 ? "00" : `${seccion.prefijo}${i}`);
              }

              return (
                <div key={`album-${seccion.nombre}`} style={{ marginBottom: "20px" }}>
                  <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: "8px", marginBottom: "10px", fontWeight: "900", color: WC_COLORS.darkBlue, fontSize: "0.9em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "10px" }}>
                    {seccion.bandera && <img src={seccion.bandera} alt={seccion.nombre} style={{ width: "20px", borderRadius: "2px" }} />}
                    {seccion.nombre}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
                    {monasVisibles.map(codigo => {
                      const cant = inventarioTarget[codigo] || 0;
                      return (
                        <div key={`mona-${codigo}`} style={{ position: "relative" }}>
                          <div style={{ 
                            background: cant > 1 ? WC_COLORS.lightBlue : cant === 1 ? WC_COLORS.green : "#ffffff",
                            border: "1px solid #e2e8f0", height: "40px", display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: "6px", fontWeight: "bold", color: cant >= 1 ? "white" : WC_COLORS.darkBlue,
                            opacity: cant === 0 ? 0.6 : 1, fontSize: "0.8em"
                          }}>
                            {codigo}
                          </div>
                          {cant > 1 && (
                            <div style={{ position: "absolute", top: "-5px", left: "-5px", fontSize: "0.7em", color: WC_COLORS.darkBlue, background: "white", border: `1px solid ${WC_COLORS.lightBlue}`, borderRadius: "10px", padding: "1px 5px", fontWeight: "900" }}>
                              x{cant}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* INVENTARIO GLOBAL DETALLADO */}
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
              <div key={`global-${cod}`} style={{ background: "white", padding: "8px", borderRadius: "8px", border: "1px solid #eee", textAlign: "center", fontSize: "0.85em" }}>
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
                <tr key={`topF-${cod}`} style={{ borderTop: "1px solid #eee" }}><td style={{ padding: "10px" }}>{cod}</td><td style={{ textAlign: "right", padding: "10px", color: "#E4002B" }}><b>{cant} veces</b></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ flex: "1 1 300px", maxWidth: "100%", background: "white", border: "1px solid #ddd", borderRadius: "12px", overflowX: "auto" }}>
          <div style={{ background: "#00A3E0", color: "white", padding: "10px", fontWeight: "bold" }}>📦 Top 10 Repetidas (Admin)</div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {top10.repetidas.map(([cod, cant]) => (
                <tr key={`topR-${cod}`} style={{ borderTop: "1px solid #eee" }}><td style={{ padding: "10px" }}>{cod}</td><td style={{ textAlign: "right", padding: "10px", color: "#00A3E0" }}><b>{cant} veces</b></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes aparecer { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

    </div>
  );
}