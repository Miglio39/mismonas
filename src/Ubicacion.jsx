// src/Ubicacion.jsx
import { db } from './firebase';
import { doc, updateDoc, GeoPoint } from 'firebase/firestore';

export const registrarUbicacion = (usuarioId) => {
  if (!navigator.geolocation) {
    alert("Tu navegador no soporta geolocalización");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const { latitude, longitude } = position.coords;
    
    // Guardamos la ubicación en Firestore como un objeto GeoPoint profesional
    const userRef = doc(db, "usuarios", usuarioId);
    await updateDoc(userRef, {
      ubicacion: new GeoPoint(latitude, longitude),
      ultimaActualizacion: new Date()
    });
    
    alert("Ubicación actualizada correctamente");
  }, (error) => {
    alert("Error al obtener ubicación: " + error.message);
  });
};