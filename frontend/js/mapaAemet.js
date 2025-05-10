/*
mapaAemet.js
Script para manejar la carga de los mapas que están en la página de inicio index.html.
Funciones:
- Carga automática del mampa de análisis meteorólógico.
- Carga del mapa de incendios mediante demanda del usuario una vez registra las opciones de los dos combos.
- Manejo de errores y respuestas para depuración.
*/ 


//CARGA EL MAPA DE ANÁLISIS DE LA AEMET AL CARGAR LA PÁGINA. 
//OJO: La carga de este mapa en las primeras llamadas a la AEMET tras hacer deploy suele fallar.
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

//CARGA EL MAPA DE INCENDIOS DESPUÉS DE QUE EL USUARIO SELECCIONE EL AREA Y EL DÍA.
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

//INICIO FORMULARIO DE INCENDIOS
function inicializarFormularioIncendios() {
  const form = document.getElementById('formIncendios');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const area = document.getElementById('area').value;//Obtengo area seleccionada por el usuario.
    const dia = document.getElementById('dia').value;//Obtengo día seleccionada por el usuario.

    cargarMapaIncendios(area, dia);
  });
}

//EJECUTA LA CARGA DE LA PÁGINA CUANDO EL DOM ESTÉ COMPLETAMENTE CARGADO.
window.addEventListener('DOMContentLoaded', () => {
  cargarMapaAemet();
  inicializarFormularioIncendios();
});
