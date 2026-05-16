// src/reports/plantillapdf.js

export const obtenerPlantillaHTML = (lambda, mu, servidores, modelo, resultados) => {
    return `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; line-height: 1.6; }
          h1 { color: #2c3e50; text-align: center; border-bottom: 3px solid #3498db; padding-bottom: 12px; margin-bottom: 30px; }
          .info-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px; border-left: 6px solid #3498db; }
          .info-box h3 { margin-top: 0; color: #2c3e50; }
          table { width: 100%; border-collapse: collapse; margin-top: 25px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
          th, td { border: 1px solid #e2e8f0; padding: 14px; text-align: left; }
          th { background-color: #34495e; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f8fafc; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        </style>
      </head>
      <body>
        <h1>Informe de Investigación Operativa<br>Cafetería "El Toque"</h1>
        <p><b>Metodología Aplicada:</b> Levantamiento de información contextual mediante observación directa en campo (Muestra: 30 usuarios).</p>
        
        <div class="info-box">
          <h3>Variables de Campo Recolectadas</h3>
          <p><b>Modelo Estructurado:</b> ${resultados.tipo}</p>
          <p><b>Tasa de Llegada de Estudiantes (&lambda;):</b> ${lambda} clientes/hora</p>
          <p><b>Tasa de Servicio por Caja (&mu;):</b> ${mu} clientes/hora</p>
          ${modelo === 'MMS' ? `<p><b>Número de Cajas/Servidores Activos (S):</b> ${servidores}</p>` : ''}
        </div>

        <h3>Resultados y Parámetros del Sistema</h3>
        <table>
          <thead>
            <tr>
              <th>Parámetro Operacional</th>
              <th>Ecuación de Cómputo</th>
              <th>Valor Estimado</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Utilización de la Cafetería (&rho;)</td><td>${resultados.ecuaciones.rho}</td><td><b>${resultados.rho}%</b></td></tr>
            <tr><td>Estudiantes promedio en el sistema (L)</td><td>${resultados.ecuaciones.L}</td><td><b>${resultados.L} estudiantes</b></td></tr>
            <tr><td>Estudiantes promedio en la fila (Lq)</td><td>${resultados.ecuaciones.Lq}</td><td><b>${resultados.Lq} estudiantes</b></td></tr>
            <tr><td>Tiempo promedio total en cafetería (W)</td><td>${resultados.ecuaciones.W}</td><td><b>${resultados.W} minutos</b></td></tr>
            <tr><td>Tiempo promedio de espera en fila (Wq)</td><td>${resultados.ecuaciones.Wq}</td><td><b>${resultados.Wq} minutos</b></td></tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Reporte automático generado por la app "El Toque Simulación" - Desarrollo React Native para Android APK.</p>
        </div>
      </body>
    </html>
  `;
};