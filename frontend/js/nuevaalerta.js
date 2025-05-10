/*
nuevaalerta.js
Script para gestionar las distintas alertas que se cree el usuario.
Se crean para el proyecto cuatro tipos de alertas:
- Predicción de temperaturas máximas y mínimas por municipio.
- Predicción marítima por zonas costeras.
- Predicción de playas.
- Predicción de montaña.

Funciones:
- Carga de datos de las diferentes alertas. En función de la alerta que se configure se hará una llamada determinada a la AEMET.
- Relleno automático de campos al seleccionar las opciones.
- Envío de alertas al servidor con token de autenticación.
*/ 

//SE EVITA EJECUTARSE ANTES DE QUE EL DOM ESTÉ COMPLETAMENTE CARGADO.
document.addEventListener('DOMContentLoaded', () => {
  //=====ALERTA: PREDICCIÓN TEMPERATURAS MÁXIMAS Y MÍNIMAS POR MUNICIPIO=====
  const municipioSelect = document.getElementById('municipioSelect');//Captura el municipio elegido por el usuario.

  //CARGA LA PREDICCIÓN
  function cargarPrediccion(municipioId) {
    fetch(`/api/aemet/prediccion/${municipioId}`)//hace la llamada
      .then(async res => {
        if (!res.ok) {//Si la respuesta no es válida
          const errorText = await res.text();
          console.error('Respuesta inválida:', errorText);//se registra el error en consola.
          throw new Error('No se pudo obtener la predicción');
        }
        return res.json();//de lo contrario devuelve el JSON con los datos.
      })
      .then(data => {
        const hoy = data[0]?.prediccion?.dia?.[0];//extrae la predicción.
        document.getElementById('tdTempMax').textContent = hoy?.temperatura?.maxima || '-'; //Muestra la temperatura máxima.
        document.getElementById('tdTempMin').textContent = hoy?.temperatura?.minima || '-'; //Muestra la temperatura mínima.
      })
      .catch(err => {
        console.error('Error al cargar la predicción:', err.message); //Si se produce un error se registra y se muestra en consola.
      });
  }

  //Control para para que cargue correctamente si el usuario ha seleccionado una opción válida.
  municipioSelect.addEventListener('change', () => {
    const municipioId = municipioSelect.value;
         if (!municipioId) return;
    cargarPrediccion(municipioId);
  });

 if (municipioSelect.value) {
     cargarPrediccion(municipioSelect.value);
  }

  //BOTÓN GUARDAR ALERTA.
  document.getElementById('guardarMiAlertaBtn').addEventListener('click', () => {
    const municipioId = municipioSelect.value;
    const municipioNombre = municipioSelect.options[municipioSelect.selectedIndex].text;

    //SE HACE UNA LLAMADA POST A LA API/ALERTAS
    fetch('/api/alertas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      //CREACIÓN DEL JSON CON EL TÍTULO, EL ID DEL MUNICIPIO Y LA DESCRIPCIPCIÓN.
      body: JSON.stringify({
        titulo: municipioNombre,
        municipio_id: municipioId,
        descripcion: 'Temperaturas máximas y mínimas'
      })
    })
      //SI NO SE PRODUCEN ERRORES...
      .then(res => {
        if (!res.ok) throw new Error('No se pudo guardar la alerta');
        return res.json();
      })
      .then(() => {
        alert('Alerta de temperatura guardada correctamente'); //Se avisa al usuario que la alerta se ha guardado correctamente.
        window.location.href = 'misalertas.html';//Se redirige al usuario a misalertas.
      })
      //Para otros errores se mostrarán el aviso genérico y en consola el motivo.
      .catch(err => {
        console.error('Error al guardar alerta:', err.message);
        alert('No se pudo guardar la alerta');
      });
  });

  //=====ALERTA: PREDICCIÓN ZONAS COSTERAS=====
  const zonaCosteraSelect = document.getElementById('zonaCosteraSelect');//Almaceno selección de la zona.

  //LLAMADA A API COSTAS PASANDO EL ID DE LA ZONA.
  function cargarPrediccionCostas(zonaId) {
    fetch(`/api/aemet/costas/${zonaId}`)
      .then(async res => {
        //Si la respuesta no es correcta se registra en consola.
        if (!res.ok) {
          const errorText = await res.text();
          console.error('Respuesta costas inválida:', errorText);
          throw new Error('No se pudo obtener la predicción marítima');
        }
        //Si lo es, se devuelve el JSON.
        return res.json();
      })
      //SE COMPLETAN LOS DATOS DE LA PREDICCIÓN.
      .then(data => {
        const tbody = document.getElementById('tbodyCostas');
        tbody.innerHTML = '';
        //SI NO HAY INFORMACIÓN
        if (!Array.isArray(data) || data.length === 0) {
          const row = document.createElement('tr');
          row.innerHTML = `<td colspan="2">Sin información disponible para esta zona.</td>`;
          tbody.appendChild(row);
          return;
        }
        //SI NO, SE CARGA LA INFORMACIÓN EN UNA TABLA.  
        data.forEach(subzona => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${subzona.nombre}</td>
            <td>${subzona.estado}</td>
          `;
          tbody.appendChild(row);
        });
      })
      //SE MUESTRAN ERRORES QUE SE PUEDAN PRODUCIR EN CONSOLA.
      .catch(err => {
        console.error('Error al cargar predicción marítima:', err.message);
      });
  }

  //CONTROL PARA QUE SÓLO SE CARGUE SI SE SELECCIÓNA UNA OPCIÓN VÁLIDA. DE LO CONTRARIO SE VE UN ERROR EN LAS HERRAMIENTAS DE DESARROLLADOR DEL NAVEGADOR.
  zonaCosteraSelect.addEventListener('change', () => {
    const zonaId = zonaCosteraSelect.value;
    if (!zonaId) return;
    cargarPrediccionCostas(zonaId);
  });

  if (zonaCosteraSelect.value) {
    cargarPrediccionCostas(zonaCosteraSelect.value);
  }
  //BOTON PARA GUARDAR LA ALERTA.
  document.getElementById('guardarAlertaCostasBtn').addEventListener('click', () => {
    const zonaId = zonaCosteraSelect.value;
    const zonaNombre = zonaCosteraSelect.options[zonaCosteraSelect.selectedIndex].text;
    //SE HACE LLAMADA A LA API DEL BACKEND
    fetch('/api/alertas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      //Con la construcción del JSON con los datos para la alerta.
      body: JSON.stringify({
        titulo: zonaNombre,
        municipio_id: zonaId,
        descripcion: 'Estado marítimo y fenómenos costeros'
      })
    })
      //Si no se puede guardar, se registra error.
      .then(res => {
        if (!res.ok) throw new Error('No se pudo guardar la alerta');
        return res.json();
      })
      //De lo contrario, si la alerta se registra correctamente, se redirige al usuario a la sección misalertas.
      .then(() => {
        alert('Alerta de costas guardada correctamente');
        window.location.href = 'misalertas.html';
      })
      //Otro error se muestra aviso y se registra en consola el error registrado.
      .catch(err => {
        console.error('Error al guardar alerta marítima:', err.message);
        alert('No se pudo guardar la alerta');
      });
  });

  //=====ALERTA: PREDICCIÓN PLAYA=====
  const provinciaSelect = document.getElementById('provinciaSelect');//Constante de la provincia seleccionada.
  const playaSelect = document.getElementById('playaSelect');//Constante playa seleccionada.

  //CARGA DE LAS PROVINCIAS. SE USAN DEL FICHERO playas_por_provincia.js
  const provincias = Object.keys(playasPorProvincia).sort(); //Constante creada en el fichero playas_por_provincia.js
  provincias.forEach(prov => {
    const opt = document.createElement('option');
    opt.value = prov;
    opt.textContent = prov;
    provinciaSelect.appendChild(opt);
  });

  //Selección de la provincia.
  provinciaSelect.addEventListener('change', () => {
    const provincia = provinciaSelect.value;
    playaSelect.innerHTML = '';

    //Si no hay provincia seleccionada, se muestra el aviso que se elija primero la provincia antes de elegir la playa.
    if (!provincia || !playasPorProvincia[provincia]) {
      playaSelect.innerHTML = '<option value="">Primero elige provincia</option>';
      return;
    }

    //Playas.
    playasPorProvincia[provincia].forEach(([nombre, id]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = nombre;
      playaSelect.appendChild(option);
    });
  });

  //Carga de la playa.
  playaSelect.addEventListener('change', () => {
    cargarPrediccionPlaya(playaSelect.value);
  });

  //Llamada para obtener la predicción de la playa, pasando el código de la playa seleccionado.
  function cargarPrediccionPlaya(codigoPlaya) {
    fetch(`/api/aemet/playa/${codigoPlaya}`)
      .then(res => {
        if (!res.ok) throw new Error('No se pudo obtener la predicción de playa');
        return res.json();
      })
      //Carga de los datos.
      .then(data => {
        const hoy = data[0]?.prediccion?.dia?.[0];
        if (!hoy) return;

        const rawFecha = hoy.fecha?.toString() || '';
        const fechaFormateada = rawFecha.length === 8
          ? `${rawFecha.slice(6, 8)}/${rawFecha.slice(4, 6)}/${rawFecha.slice(0, 4)}`
          : '-';

        document.getElementById('tdFechaPlaya').textContent = fechaFormateada;
        document.getElementById('tdCieloPlaya').textContent = hoy.estadoCielo?.descripcion1 || '-';
        document.getElementById('tdUV').textContent = hoy.uvMax?.valor1 || '-';
        document.getElementById('tdTempAgua').textContent = hoy.tAgua?.valor1 || '-';
        document.getElementById('tdOleaje').textContent = hoy.oleaje?.descripcion1 || '-';
        document.getElementById('tdViento').textContent = hoy.viento?.descripcion1 || '-';
        document.getElementById('tdSTermica').textContent = hoy.sTermica?.descripcion1 || hoy.stermica?.descripcion1 || '-';
      })
      //Si se producen errores se mostrarán en consola.
      .catch(err => {
        console.error('Error al cargar predicción de playa:', err.message);
      });
  }

  //BOTÓN EVENTO GUARDADO DE LA ALERTA DE PREDICCIÓN DE PLAYAS.
  document.getElementById('guardarAlertaPlayaBtn').addEventListener('click', () => {
    const playaId = playaSelect.value;
    const playaNombre = playaSelect.options[playaSelect.selectedIndex]?.text;
    //ENVÍO LLAMADA POST
    fetch('/api/alertas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      //Con la estructura del JSON enviando título, municipio_id y descripción. NOTA: municipio_id fue el valor que asigné a la primera alerta y por eso quedan todas registradas con ese nombre, aunque no siempre se registre ahí el municipio.
      body: JSON.stringify({
        titulo: playaNombre,
        municipio_id: playaId,
        descripcion: 'Predicción para playa'
      })
    })
      //Aviso en caso de que no se pueda guardar la alerta.
      .then(res => {
        if (!res.ok) throw new Error('No se pudo guardar la alerta');
        return res.json();
      })
      //Aviso si se pudo guardar correctamente y redirijo al usuario a misalertas para que pueda verla almacenada.
      .then(() => {
        alert('Alerta de playa guardada correctamente');
        window.location.href = 'misalertas.html';
      })
      //Otros errores se avisará al usuario y se registrar en consola.
      .catch(err => {
        console.error('Error al guardar alerta de playa:', err.message);
        alert('No se pudo guardar la alerta');
      });
  });


//=====ALERTA: PREDICCIÓN MONTAÑA=====
const areaMontanaSelect = document.getElementById('areaMontanaSelect');//Constante de la selección del area.
const diaMontanaSelect = document.getElementById('diaMontanaSelect');//constante del día seleccionado.

//CONSTANTES PARA LAS AREAS PARA LUEGO REGISTRAR LAS ALERTAS CON LA DESCRIPCIÓN QUE CORRESPONDA A CADA CÓDIGO.
const nombresAreasMontana = {
  peu1: 'Picos de Europa',
  arn1: 'Pirineo Aragonés',
  nav1: 'Pirineo Navarro',
  cat1: 'Pirineo Catalán',
  rio1: 'Ibérica Riojana',
  arn2: 'Ibérica Aragonesa',
  mad2: 'Sierras de Guadarrama y Somosierra',
  gre1: 'Sierra de Gredos',
  nev1: 'Sierra Nevada'
};

//CONSTANTES PARA LOS DIAS PARA LUEGO REGISTRAR LAS ALERTAS CON LA DESCRIPCIÓN QUE CORRESPONDA A CADA CÓDIGO.
const nombresDiaMontana = {
  0: 'Hoy',
  1: 'Mañana',
  2: 'Pasado Mañana'
};

//FUNCIÓN DE CONSULTA A LA API PARA OBTENER LOS VALORES DE LA PREDICCIÓN.
function cargarPrediccionMontana(areaId, dia) {
  if (!areaId || dia === '') {
    console.warn('Faltan datos: área o día no seleccionados');
    return;
  }
  //LLAMADA A LA API PASADNO LOS PARÁMETRO AREA Y DÍA Y OBTENCIÓN DE LA PREDICCIÓN
  fetch(`/api/aemet/montana/${areaId}/${dia}`)
    .then(async res => {
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Respuesta de servidor montaña:', errorText);
        throw new Error('No se pudo obtener la predicción de montaña');
      }
      return res.json();
    })
    //CARGA DE LOS DATOS.
    .then(data => {
      const secciones = data[0]?.seccion || [];
      const prediccion = secciones.find(s => s.nombre === 'prediccion');
      const atmosferalibre = secciones.find(s => s.nombre === 'atmosferalibre');
      const sensacion = secciones.find(s => s.nombre === 'sensacion_termica');

      const predHTML = prediccion?.apartado.map(ap => `<p><strong>${ap.cabecera}:</strong> ${ap.texto}</p>`).join('') || '';
      const atmoHTML = atmosferalibre?.apartado.map(ap => `<p><strong>${ap.cabecera}:</strong> ${ap.texto}</p>`).join('') || '';
      const sensHTML = sensacion?.lugar.map(l =>
        `<p><strong>${l.nombre} (${l.altitud}):</strong> Mín: ${l.minima} ºC, Máx: ${l.maxima} ºC</p>`
      ).join('') || '';

      document.getElementById('resultadoMontana').innerHTML = predHTML + atmoHTML + sensHTML;
    })
    //REGISTRO DE ERRORES.
    .catch(err => {
      console.error('Error al cargar predicción de montaña:', err.message);
      document.getElementById('resultadoMontana').innerHTML = '<p>Error al cargar la predicción</p>';
    });
}

//CONTROL PARA EL ENVÍO  DE INFORMACIÓN EN LA LLAMADA.
areaMontanaSelect.addEventListener('change', () => {
  cargarPrediccionMontana(areaMontanaSelect.value, diaMontanaSelect.value);
});

diaMontanaSelect.addEventListener('change', () => {
  cargarPrediccionMontana(areaMontanaSelect.value, diaMontanaSelect.value);
});

//EVENTO DE GUARDADO AL PULSAR EL BOTÓN.
document.getElementById('guardarAlertaMontanaBtn').addEventListener('click', () => {
  const area = areaMontanaSelect.value;
  const dia = diaMontanaSelect.value;

  if (!area || dia === '') return alert('Selecciona área y día');

  const titulo = `${nombresAreasMontana[area]} - ${nombresDiaMontana[dia]}`;

  //SE ENVÍA LLAMADA POST CON LOS DATOS PARA GUARDAR LA ALERTA
  fetch('/api/alertas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    //CONSTRUCCIÓN DEL JSON.
    body: JSON.stringify({
      titulo,
      municipio_id: area,
      dia_alerta_montana: parseInt(dia, 10),
      descripcion: 'Predicción de montaña'
    })
  })
    //Error si no se puede guardar la alerta.
    .then(res => {
      if (!res.ok) throw new Error('No se pudo guardar la alerta');
      return res.json();
    })
    //Aviso si se ha guardado correctamente y redirección a mis alertas.
    .then(() => {
      alert('Alerta de montaña guardada correctamente');
      window.location.href = 'misalertas.html';
    })
    //Registro de otros errores tanto en aviso como en consola.
    .catch(err => {
      console.error('Error al guardar alerta de montaña:', err.message);
      alert('No se pudo guardar la alerta');
    });
});
});
