const altScoreRouter = require('express').Router();
require('dotenv').config();

// Datos de ejemplo basados en la gráfica (aproximados)
const saturationData = [
    { pressure: 0.05, specific_volume_liquid: 0.00105, specific_volume_vapor: 30.00 },
    { pressure: 10, specific_volume_liquid: 0.0035, specific_volume_vapor: 0.0035 }, // Punto crítico
  ];

// Endpoint 1: GET /
altScoreRouter.get('/phase-change-diagram', (req, res) => {
    const pressure = parseFloat(req.query.pressure);

  if (isNaN(pressure)) {
    return res.status(400).json({ error: 'El parámetro "pressure" debe ser un número.' });
  }

  // Buscar en los datos de ejemplo la presión proporcionada
  const dataPoint = saturationData.find(item => Math.abs(item.pressure - pressure) < 0.001); // Comparación con tolerancia para números flotantes

  if (dataPoint) {
    res.json({
      specific_volume_liquid: dataPoint.specific_volume_liquid,
      specific_volume_vapor: dataPoint.specific_volume_vapor,
    });
  } else {
    // Lógica de interpolación lineal simple entre los puntos conocidos
    if (saturationData.length >= 2) {
      saturationData.sort((a, b) => a.pressure - b.pressure); // Asegurar que los puntos estén ordenados por presión

      let lower = null;
      let upper = null;

      for (let i = 0; i < saturationData.length - 1; i++) {
        if (pressure >= saturationData[i].pressure && pressure <= saturationData[i + 1].pressure) {
          lower = saturationData[i];
          upper = saturationData[i + 1];
          break;
        }
      }

      if (lower && upper) {
        // Interpolación lineal para el volumen específico del líquido
        const svl = lower.specific_volume_liquid + (pressure - lower.pressure) * (upper.specific_volume_liquid - lower.specific_volume_liquid) / (upper.pressure - lower.pressure);

        // Interpolación lineal para el volumen específico del vapor
        const svv = lower.specific_volume_vapor + (pressure - lower.pressure) * (upper.specific_volume_vapor - lower.specific_volume_vapor) / (upper.pressure - lower.pressure);

        return res.json({
          specific_volume_liquid: svl,
          specific_volume_vapor: svv
          //message: 'Valor interpolado entre los puntos conocidos.'
        });
      }
    }

    // Si no se encuentra un punto exacto ni se puede interpolar, devolvemos un mensaje
    console.log(`No se encontraron datos para la presión: ${pressure} MPa.`);
    res.status(404).json({ error: 'No se encontraron datos para la presión proporcionada.' });
  }
});

module.exports = {altScoreRouter};

