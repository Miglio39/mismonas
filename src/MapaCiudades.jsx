// src/MapaCiudades.jsx
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

// Arreglar el icono por defecto de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Nodos seguros de intercambio (Ejemplos iniciales)
const puntosSeguros = [
  { id: 1, ciudad: "Villavicencio", nombre: "C.C. Primavera Urbana", lat: 4.1346, lng: -73.6404 },
  { id: 2, ciudad: "Villavicencio", nombre: "C.C. Unicentro", lat: 4.1415, lng: -73.6344 },
  { id: 3, ciudad: "Villavicencio", nombre: "C.C. Único Outlet", lat: 4.1287, lng: -73.6245 },
  { id: 4, ciudad: "Acacías", nombre: "Parque Principal", lat: 3.9865, lng: -73.7580 },
  { id: 5, ciudad: "Bogotá", nombre: "Parque Simón Bolívar", lat: 4.6580, lng: -74.0930 }
];

function MapaCiudades() {
  const [estadisticasCiudad, setEstadisticasCiudad] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      // Leeremos el muro de publicaciones para ver de dónde son los usuarios
      const snapshot = await getDocs(collection(db, "publicaciones"));
      const conteo = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        // Asumimos temporalmente una ciudad base, pero lo ideal es que 
        // al publicar, el usuario seleccione su municipio.
        const ciudadUser = data.ciudad || "Villavicencio"; 
        
        if (!conteo[ciudadUser]) {
          conteo[ciudadUser] = 0;
        }
        conteo[ciudadUser]++;
      });

      setEstadisticasCiudad(conteo);
      setCargando(false);
    };

    cargarDatos();
  }, []);

  if (cargando) return <p style={{textAlign: "center"}}>Cargando mapa interactivo...</p>;

  return (
    <div style={{ marginTop: "10px", borderRadius: "10px", overflow: "hidden", border: "2px solid #e2e8f0" }}>
      <div style={{ padding: "15px", background: "#f8fafc", textAlign: "center" }}>
        <h3 style={{ margin: "0", color: "#002b5e" }}>🗺️ Zonas Seguras de Intercambio</h3>
        <p style={{ margin: "5px 0 0 0", fontSize: "0.9em", color: "#666" }}>
          Reúnete en lugares públicos y concurridos. Haz clic en los marcadores.
        </p>
      </div>

      {/* Contenedor del Mapa (Centrado inicialmente en el Meta) */}
      <MapContainer 
        center={[4.13, -73.63]} // Coordenadas centrales
        zoom={12} 
        style={{ height: "400px", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {puntosSeguros.map(punto => {
          const usuariosEnCiudad = estadisticasCiudad[punto.ciudad] || 0;
          
          return (
            <div key={punto.id}>
              {/* Círculo de calor (más grande si hay más usuarios) */}
              <Circle 
                center={[punto.lat, punto.lng]} 
                pathOptions={{ fillColor: '#0284c7', color: 'transparent' }} 
                radius={usuariosEnCiudad > 0 ? 500 : 200} 
              />
              
              {/* Marcador Exacto */}
              <Marker position={[punto.lat, punto.lng]}>
                <Popup>
                  <div style={{ textAlign: "center" }}>
                    <b style={{ color: "#002b5e", fontSize: "1.1em" }}>{punto.nombre}</b><br/>
                    <span style={{ color: "#666" }}>{punto.ciudad}</span><br/><br/>
                    <div style={{ background: "#e0f2fe", padding: "5px", borderRadius: "5px" }}>
                      🔥 <b>{usuariosEnCiudad}</b> trueques activos en esta ciudad.
                    </div>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default MapaCiudades;