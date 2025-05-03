// Cargar el mapa de análisis meteorológico al cargar la página
async function cargarMapaAemet() {
  try {
    const res = await fetch('/api/aemet/mapa-analisis');
    if (!res.ok) throw new Error("No se pudo cargar el mapa de análisis");
    
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    document.getElementById('mapaAemet').src = url;
  } catch (error) {
    console.error("Error cargando el mapa de AEMET:", error);
    const mapa = document.getElementById('mapaAemet');
    if (mapa) {
      mapa.alt = "Error al cargar el mapa de análisis";
    }
  }
}

// Cargar el mapa de incendios según área y día seleccionados
async function cargarMapaIncendios(area, dia) {
  try {
    const res = await fetch(`/api/aemet/mapa-incendios?area=${area}&dia=${dia}`);
    if (!res.ok) throw new Error("No se pudo cargar el mapa de incendios");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    document.getElementById('mapaIncendios').src = url;
  } catch (error) {
    console.error("Error cargando el mapa de incendios:", error);
    const mapa = document.getElementById('mapaIncendios');
    if (mapa) {
      mapa.alt = "Error al cargar el mapa de incendios";
    }
  }
}

// Inicializar el formulario de incendios
function inicializarFormularioIncendios() {
  const form = document.getElementById('formIncendios');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const area = document.getElementById('area').value;
    const dia = document.getElementById('dia').value;

    cargarMapaIncendios(area, dia);
  });
}

// Ejecutar al cargar la página
window.addEventListener('DOMContentLoaded', () => {
  cargarMapaAemet();
  inicializarFormularioIncendios();
});
