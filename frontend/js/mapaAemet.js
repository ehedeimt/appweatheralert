async function cargarMapaAemet() {
    try {
      const res = await fetch('/api/aemet/mapa-analisis');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      document.getElementById('mapaAemet').src = url;
    } catch (error) {
      console.error("Error cargando el mapa de AEMET:", error);
      document.getElementById('mapaAemet').alt = "Error al cargar el mapa";
    }
  }
  
  window.addEventListener('DOMContentLoaded', cargarMapaAemet);  