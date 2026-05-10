import { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [publicaciones, setPublicaciones] = useState([]);

  const cargarAdmin = async () => {
    const uSnap = await getDocs(collection(db, "inventarios")); // Usamos inventarios para ver usuarios activos
    setUsuarios(uSnap.docs.map(d => ({ id: d.id })));
    const pSnap = await getDocs(collection(db, "publicaciones"));
    setPublicaciones(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => { cargarAdmin(); }, []);

  return (
    <div style={{ padding: "10px" }}>
      <h3 style={{ color: "#991b1b", borderBottom: "2px solid #fee2e2", paddingBottom: "10px" }}>🛡️ Panel de Moderación</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "25px" }}>
        <div style={{ background: "#fee2e2", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
          <b style={{ fontSize: "0.9em" }}>Usuarios Registrados</b><br/><span style={{ fontSize: "2em", fontWeight: "bold" }}>{usuarios.length}</span>
        </div>
        <div style={{ background: "#fef3c7", padding: "20px", borderRadius: "12px", textAlign: "center" }}>
          <b style={{ fontSize: "0.9em" }}>Anuncios Activos</b><br/><span style={{ fontSize: "2em", fontWeight: "bold" }}>{publicaciones.length}</span>
        </div>
      </div>

      <h4>Gestionar Publicaciones</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {publicaciones.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "white", padding: "12px", borderRadius: "10px", border: "1px solid #ddd" }}>
            <div style={{ fontSize: "0.85em" }}>
              <b>{p.email}</b> <span style={{ color: "#666" }}>({p.ciudad})</span>
            </div>
            <button onClick={async () => { if(confirm("¿Eliminar como Admin?")) { await deleteDoc(doc(db, "publicaciones", p.id)); cargarAdmin(); } }} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontWeight: "bold" }}>Eliminar</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Admin;