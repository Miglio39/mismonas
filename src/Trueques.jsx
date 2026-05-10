// src/Trueques.jsx
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Paleta de colores oficial del proyecto (Mundial 2026)
const WC_COLORS = {
  green: "#00B140",
  darkBlue: "#00205B",
  lightBlue: "#00A3E0",
  red: "#E4002B",
  lime: "#97D700",
  white: "#FFFFFF",
  grayBg: "#f8fafc"
};

// Base de datos local optimizada: 32 Departamentos + Bogotá D.C.
const COLOMBIA_DATA = {
  "AMAZONAS": ["Leticia", "Puerto Nariño"],
  "ANTIOQUIA": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Rionegro", "Turbo", "Caucasia", "Marinilla"],
  "ARAUCA": ["Arauca", "Tame", "Saravena", "Arauquita"],
  "ATLÁNTICO": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Baranoa"],
  "BOGOTÁ D.C.": ["Bogotá D.C."],
  "BOLÍVAR": ["Cartagena", "Magangué", "Turbaco", "Arjona", "El Carmen de Bolívar"],
  "BOYACÁ": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Puerto Boyacá"],
  "CALDAS": ["Manizales", "La Dorada", "Chinchiná", "Villamaría", "Riosucio"],
  "CAQUETÁ": ["Florencia", "San Vicente del Caguán", "Cartagena del Chairá"],
  "CASANARE": ["Yopal", "Aguazul", "Paz de Ariporo", "Villanueva"],
  "CAUCA": ["Popayán", "Santander de Quilichao", "Puerto Tejada", "El Tambo", "Patía"],
  "CESAR": ["Valledupar", "Aguachica", "Agustín Codazzi", "Bosconia"],
  "CHOCÓ": ["Quibdó", "Istmina", "Tadó"],
  "CÓRDOBA": ["Montería", "Santa Cruz de Lorica", "Tierralta", "Sahagún", "Cereté"],
  "CUNDINAMARCA": ["Soacha", "Chía", "Zipaquirá", "Facatativá", "Fusagasugá", "Girardot", "Mosquera", "Madrid", "Cajicá"],
  "GUAINÍA": ["Inírida"],
  "GUAVIARE": ["San José del Guaviare", "Calamar"],
  "HUILA": ["Neiva", "Pitalito", "Garzón", "La Plata"],
  "LA GUAJIRA": ["Riohacha", "Maicao", "Uribia", "San Juan del Cesar"],
  "MAGDALENA": ["Santa Marta", "Ciénaga", "Zona Bananera", "Fundación", "El Banco"],
  "META": ["Villavicencio", "Acacías", "Granada", "Puerto López", "Restrepo", "Cumaral", "San Martín"],
  "NARIÑO": ["Pasto", "Tumaco", "Ipiales", "Túquerres"],
  "NORTE DE SANTANDER": ["Cúcuta", "Ocaña", "Villa del Rosario", "Los Patios", "Pamplona"],
  "PUTUMAYO": ["Mocoa", "Puerto Asís", "Orito", "Valle del Guamuez"],
  "QUINDÍO": ["Armenia", "Calarcá", "Montenegro", "La Tebaida", "Quimbaya"],
  "RISARALDA": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia"],
  "SAN ANDRÉS Y PROVIDENCIA": ["San Andrés", "Providencia"],
  "SANTANDER": ["Bucaramanga", "Floridablanca", "Barrancabermeja", "Girón", "Piedecuesta", "San Gil", "Socorro"],
  "SUCRE": ["Sincelejo", "Corozal", "San Marcos", "Tolú"],
  "TOLIMA": ["Ibagué", "El Espinal", "Melgar", "Chaparral", "Honda", "Líbano"],
  "VALLE DEL CAUCA": ["Cali", "Buenaventura", "Palmira", "Tuluá", "Yumbo", "Cartago", "Buga", "Jamundí"],
  "VAUPÉS": ["Mitú"],
  "VICHADA": ["Puerto Carreño", "La Primavera", "Cumaribo"]
};

function Trueques({ usuarioActual }) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [tel, setTel] = useState('');
  const [depto, setDepto] = useState('BOGOTÁ D.C.');
  const [ciudad, setCiudad] = useState('Bogotá D.C.');
  const [filtroDepto, setFiltroDepto] = useState('Todas');
  const [cargandoMuro, setCargandoMuro] = useState(false);

  const cargarMuro = async () => {
    setCargandoMuro(true);
    const q = query(collection(db, "publicaciones"), orderBy("fecha", "desc"));
    const snap = await getDocs(q);
    let lista = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (filtroDepto !== 'Todas') lista = lista.filter(p => p.departamento === filtroDepto);
    setPublicaciones(lista);
    setCargandoMuro(false);
  };

  useEffect(() => { cargarMuro(); }, [filtroDepto]);

  const publicar = async () => {
    if (tel.length < 10) return alert("Por favor ingresa un número de WhatsApp válido.");
    
    // Evita duplicados borrando la publicación anterior del usuario
    const antigua = publicaciones.find(p => p.uid === usuarioActual.uid);
    if (antigua) await deleteDoc(doc(db, "publicaciones", antigua.id));
    
    const miDoc = await getDoc(doc(db, "inventarios", usuarioActual.uid));
    const inv = miDoc.data() || {};
    
    // Filtramos las monas
    const ofrece = Object.keys(inv).filter(id => inv[id] > 1);
    const busca = Object.keys(inv).filter(id => inv[id] === 0);
    
    await addDoc(collection(db, "publicaciones"), {
      uid: usuarioActual.uid, 
      email: usuarioActual.email,
      telefono: tel, 
      departamento: depto, 
      ciudad, 
      ofrece, 
      busca, 
      fecha: serverTimestamp()
    });
    
    alert("¡Anuncio publicado exitosamente en el muro!");
    cargarMuro();
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: "1000px", margin: "auto" }}>
      
      {/* PANEL DE PUBLICACIÓN */}
      <div style={{ background: WC_COLORS.white, padding: "25px", borderRadius: "16px", border: `2px solid ${WC_COLORS.lime}`, marginBottom: "30px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
          <div style={{ background: WC_COLORS.darkBlue, color: "white", padding: "8px", borderRadius: "8px", fontSize: "1.2em" }}>📢</div>
          <h3 style={{ margin: 0, color: WC_COLORS.darkBlue, fontSize: "1.4em", fontWeight: "900" }}>Publicar mi Inventario</h3>
        </div>
        
        <div style={{ display: "flex", flexWrap: "wrap", gap: "15px" }}>
          <input 
            type="number" 
            placeholder="WhatsApp (Ej: 3001234567)" 
            value={tel} 
            onChange={e => setTel(e.target.value)} 
            style={{ flex: "2 1 200px", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "1em", outline: "none", boxSizing: "border-box" }} 
          />
          <select 
            value={depto} 
            onChange={e => { setDepto(e.target.value); setCiudad(COLOMBIA_DATA[e.target.value][0]); }} 
            style={{ flex: "1 1 180px", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "1em", outline: "none", background: "white", boxSizing: "border-box" }}
          >
            {Object.keys(COLOMBIA_DATA).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select 
            value={ciudad} 
            onChange={e => setCiudad(e.target.value)} 
            style={{ flex: "1 1 180px", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "1em", outline: "none", background: "white", boxSizing: "border-box" }}
          >
            {COLOMBIA_DATA[depto]?.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button 
            onClick={publicar} 
            style={{ 
              width: "100%", background: WC_COLORS.green, color: "white", border: "none", 
              padding: "16px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", 
              fontSize: "1.1em", textTransform: "uppercase", letterSpacing: "1px",
              boxShadow: `0 4px 15px ${WC_COLORS.green}60`, transition: "transform 0.1s ease"
            }}
            onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            Publicar en el Muro Nacional
          </button>
        </div>
      </div>

      {/* ENCABEZADO DEL MURO Y FILTRO */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "15px", padding: "0 10px" }}>
        <h3 style={{ color: WC_COLORS.darkBlue, margin: 0, fontSize: "1.4em", fontWeight: "900" }}>📋 Muro de Coleccionistas</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "0.85em", fontWeight: "bold", color: "#64748b", textTransform: "uppercase" }}>Filtrar por:</span>
          <select 
            value={filtroDepto} 
            onChange={e => setFiltroDepto(e.target.value)} 
            style={{ padding: "10px 15px", borderRadius: "10px", border: `2px solid ${WC_COLORS.lightBlue}`, fontWeight: "bold", color: WC_COLORS.darkBlue, background: "white", outline: "none" }}
          >
            <option value="Todas">🇨🇴 Todo Colombia</option>
            {Object.keys(COLOMBIA_DATA).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* MURO DE PUBLICACIONES */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
        {cargandoMuro ?
          <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "40px", color: WC_COLORS.darkBlue }}>
            <div style={{ fontSize: "2em", animation: "spin 2s linear infinite", marginBottom: "10px" }}>🔄</div>
            <b>Cargando red de intercambios...</b>
          </div> 
        : publicaciones.length === 0 ?
          <div style={{ textAlign: "center", gridColumn: "1 / -1", padding: "40px", background: "white", borderRadius: "15px", border: "1px dashed #cbd5e1" }}>
            <span style={{ fontSize: "2em" }}>🏜️</span>
            <h4 style={{ color: WC_COLORS.darkBlue, margin: "10px 0 5px 0" }}>No hay anuncios aquí</h4>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.9em" }}>Sé el primero en publicar tu inventario en esta zona.</p>
          </div> 
        : publicaciones.map(pub => (
            <div key={pub.id} style={{ border: "1px solid #e2e8f0", padding: "20px", borderRadius: "16px", background: "white", boxShadow: "0 4px 15px rgba(0,0,0,0.03)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                <div>
                  <span style={{ background: WC_COLORS.grayBg, color: WC_COLORS.lightBlue, fontWeight: "900", fontSize: "0.75em", textTransform: "uppercase", padding: "4px 8px", borderRadius: "6px", letterSpacing: "0.5px" }}>
                    📍 {pub.ciudad}, {pub.departamento}
                  </span>
                  <p style={{ margin: "8px 0 0 0", fontWeight: "900", fontSize: "1.1em", color: WC_COLORS.darkBlue }}>
                    {pub.email.split('@')[0]}
                  </p>
                </div>
                {pub.uid === usuarioActual.uid ? 
                  <button onClick={async () => { if(confirm("¿Seguro que deseas borrar tu anuncio?")) { await deleteDoc(doc(db, "publicaciones", pub.id)); cargarMuro(); } }} style={{ background: WC_COLORS.red, color: "white", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "0.8em", fontWeight: "bold", cursor: "pointer" }}>Borrar</button> 
                : <button onClick={() => window.open(`https://wa.me/57${pub.telefono}?text=Hola! Vi tu anuncio en MisMonas 2026. Me interesan algunas de tus láminas.`)} style={{ background: "#25D366", color: "white", border: "none", borderRadius: "8px", padding: "8px 14px", fontWeight: "900", cursor: "pointer", fontSize: "0.85em", boxShadow: "0 4px 10px rgba(37, 211, 102, 0.3)" }}>WhatsApp</button>
                }
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {/* CAJA TENGO */}
                <div style={{ background: "rgba(151, 215, 0, 0.1)", padding: "12px", borderRadius: "10px", border: `1px solid ${WC_COLORS.lime}` }}>
                  <b style={{ color: WC_COLORS.darkBlue, fontSize: "0.75em", display: "block", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    TENGO REPETIDAS ({pub.ofrece?.length || 0})
                  </b>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "80px", overflowY: "auto", fontSize: "0.75em", fontWeight: "bold" }}>
                    {pub.ofrece?.length > 0 ? pub.ofrece.map(m => <span key={m} style={{ background: "white", padding: "2px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", color: WC_COLORS.darkBlue }}>{m}</span>) : <span style={{ color: "#94a3b8", fontWeight: "normal" }}>Nada por ahora</span>}
                  </div>
                </div>
                
                {/* CAJA BUSCO */}
                <div style={{ background: "rgba(228, 0, 43, 0.05)", padding: "12px", borderRadius: "10px", border: "1px solid #fecaca" }}>
                  <b style={{ color: WC_COLORS.red, fontSize: "0.75em", display: "block", marginBottom: "8px", letterSpacing: "0.5px" }}>
                    ME FALTAN ({pub.busca?.length || 0})
                  </b>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxHeight: "80px", overflowY: "auto", fontSize: "0.75em", fontWeight: "bold" }}>
                    {pub.busca?.length > 0 ? pub.busca.map(m => <span key={m} style={{ background: "white", padding: "2px 6px", borderRadius: "4px", border: "1px solid #fca5a5", color: WC_COLORS.red }}>{m}</span>) : <span style={{ color: "#94a3b8", fontWeight: "normal" }}>Álbum lleno!</span>}
                  </div>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default Trueques;