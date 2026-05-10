// src/Trueques.jsx
import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';

// Base de datos local optimizada
const COLOMBIA_DATA = {
  "AMAZONAS": ["Leticia"], "ANTIOQUIA": ["Medellín", "Bello", "Envigado"],
  "ATLÁNTICO": ["Barranquilla", "Soledad"], "BOGOTÁ D.C.": ["Bogotá D.C."],
  "CUNDINAMARCA": ["Soacha", "Chía", "Zipaquirá"],
  "META": ["Villavicencio", "Acacías", "Granada", "Restrepo", "Cumaral"],
  "SANTANDER": ["Bucaramanga", "Floridablanca"], "VALLE DEL CAUCA": ["Cali", "Palmira"]
};

function Trueques({ usuarioActual }) {
  const [publicaciones, setPublicaciones] = useState([]);
  const [tel, setTel] = useState('');
  const [depto, setDepto] = useState('META');
  const [ciudad, setCiudad] = useState('Villavicencio');
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
    if (tel.length < 10) return alert("WhatsApp inválido");
    const antigua = publicaciones.find(p => p.uid === usuarioActual.uid);
    if (antigua) await deleteDoc(doc(db, "publicaciones", antigua.id));

    const miDoc = await getDoc(doc(db, "inventarios", usuarioActual.uid));
    const inv = miDoc.data() || {};
    const ofrece = Object.keys(inv).filter(id => inv[id] > 1);
    const busca = Object.keys(inv).filter(id => inv[id] === 0);

    await addDoc(collection(db, "publicaciones"), {
      uid: usuarioActual.uid, email: usuarioActual.email,
      telefono: tel, departamento: depto, ciudad, ofrece, busca, fecha: serverTimestamp()
    });
    alert("¡Anuncio actualizado en el muro!");
    cargarMuro();
  };

  return (
    <div>
      {/* PANEL DE PUBLICACIÓN - REDISEÑADO ANCHO */}
      <div style={{ background: "#f0f9ff", padding: "20px", borderRadius: "15px", border: "2px solid #bae6fd", marginBottom: "25px" }}>
        <h3 style={{ margin: "0 0 15px 0", color: "#0369a1", textAlign: "center" }}>📢 Publicar/Actualizar mi anuncio</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          <input 
            type="number" 
            placeholder="WhatsApp (sin el 57)" 
            value={tel} 
            onChange={e => setTel(e.target.value)} 
            style={{ flex: "2 1 200px", padding: "12px", borderRadius: "10px", border: "1px solid #ccc", fontSize: "1em" }} 
          />
          <select value={depto} onChange={e => { setDepto(e.target.value); setCiudad(COLOMBIA_DATA[e.target.value][0]); }} style={{ flex: "1 1 150px", padding: "12px", borderRadius: "10px", fontSize: "1em" }}>
            {Object.keys(COLOMBIA_DATA).map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={ciudad} onChange={e => setCiudad(e.target.value)} style={{ flex: "1 1 150px", padding: "12px", borderRadius: "10px", fontSize: "1em" }}>
            {COLOMBIA_DATA[depto]?.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button onClick={publicar} style={{ width: "100%", background: "#0284c7", color: "white", border: "none", padding: "15px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "1.1em" }}>
            Publicar Ahora en Todo Colombia
          </button>
        </div>
      </div>

      {/* ENCABEZADO DEL MURO Y FILTRO */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
        <h3 style={{ color: "#002b5e", margin: 0 }}>📋 Muro de Intercambios</h3>
        <select value={filtroDepto} onChange={e => setFiltroDepto(e.target.value)} style={{ padding: "8px", borderRadius: "10px", border: "1px solid #002b5e", fontWeight: "bold" }}>
          <option value="Todas">🇨🇴 Todo Colombia</option>
          {Object.keys(COLOMBIA_DATA).map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* MURO DE PUBLICACIONES - TIPO TARJETAS ANCHAS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "15px" }}>
        {cargandoMuro ? <p style={{textAlign: "center"}}>Cargando muro...</p> : 
          publicaciones.length === 0 ? <p style={{textAlign: "center", color: "#666"}}>No hay anuncios en esta zona.</p> :
          publicaciones.map(pub => (
            <div key={pub.id} style={{ border: "1px solid #eee", padding: "15px", borderRadius: "15px", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <span style={{ color: "#0284c7", fontWeight: "bold", fontSize: "0.8em", textTransform: "uppercase" }}>📍 {pub.ciudad}</span>
                  <p style={{ margin: "3px 0", fontWeight: "bold", fontSize: "1em", color: "#333" }}>{pub.email.split('@')[0]}</p>
                </div>
                {pub.uid === usuarioActual.uid ? 
                  <button onClick={async () => { if(confirm("¿Borrar?")) { await deleteDoc(doc(db, "publicaciones", pub.id)); cargarMuro(); } }} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "5px", padding: "4px 8px", fontSize: "0.8em", cursor: "pointer" }}>Borrar</button> :
                  <button onClick={() => window.open(`https://wa.me/57${pub.telefono}?text=Hola, vi tu anuncio en Panini Pro. Me interesan tus monas.`)} style={{ background: "#25D366", color: "white", border: "none", borderRadius: "5px", padding: "6px 12px", fontWeight: "bold", cursor: "pointer", fontSize: "0.85em" }}>WhatsApp</button>
                }
              </div>
              
              {/* Cajas de Monas - Con Scroll Interno */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "#f0fdf4", padding: "10px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                  <b style={{ color: "#166534", fontSize: "0.7em", display: "block", marginBottom: "5px" }}>TENGO ({pub.ofrece?.length}):</b>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", maxHeight: "60px", overflowY: "auto", fontSize: "0.7em" }}>
                    {pub.ofrece?.map(m => <span key={m} style={{ background: "white", padding: "1px 4px", borderRadius: "3px", border: "1px solid #86efac" }}>{m}</span>)}
                  </div>
                </div>
                <div style={{ background: "#fef2f2", padding: "10px", borderRadius: "10px", border: "1px solid #fecaca" }}>
                  <b style={{ color: "#991b1b", fontSize: "0.7em", display: "block", marginBottom: "5px" }}>BUSCO ({pub.busca?.length}):</b>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", maxHeight: "60px", overflowY: "auto", fontSize: "0.7em" }}>
                    {pub.busca?.map(m => <span key={m} style={{ background: "white", padding: "1px 4px", borderRadius: "3px", border: "1px solid #fca5a5" }}>{m}</span>)}
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