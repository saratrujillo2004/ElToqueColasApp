// src/reports/plantillapdf.js

const fecha = () => new Date().toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
});

// ─── PDF de resultados de la calculadora ─────────────────────────────────────
export const obtenerPlantillaHTML = (lambda, mu, servidores, modelo, res) => {
    const rhoNum = parseFloat(res.rho);
    const rhoColor = rhoNum >= 85 ? '#C0392B' : rhoNum >= 60 ? '#B86A00' : '#1E8C5A';

    const fila = (nombre, ecuacion, valor, colorVal, interp) => `
      <tr>
        <td style="font-weight:600;color:#0D1F2D;padding:12px 14px;border-bottom:1px solid #E2EFF4;">${nombre}</td>
        <td style="font-style:italic;color:#6B8FA3;font-size:12px;padding:12px 14px;border-bottom:1px solid #E2EFF4;">${ecuacion}</td>
        <td style="font-weight:800;font-size:16px;color:${colorVal};padding:12px 14px;border-bottom:1px solid #E2EFF4;white-space:nowrap;">${valor}</td>
        <td style="font-size:12px;color:#2C5F7A;line-height:1.6;padding:12px 14px;border-bottom:1px solid #E2EFF4;">${interp}</td>
      </tr>`;

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#F4F9FB; color:#0D1F2D; }
    .wrap { max-width:820px; margin:0 auto; padding:32px 28px; background:#fff; }
    .header { background: #0F2D4A; border-radius:16px; padding:28px 26px; color:#fff; margin-bottom:26px; }
    .header h1 { margin:0 0 6px; font-size:20px; font-weight:800; }
    .header p  { margin:0; font-size:13px; opacity:.75; }
    .badge { display:inline-block; margin-top:12px; background:rgba(255,255,255,.15);
             border:1px solid rgba(255,255,255,.25); border-radius:20px;
             padding:4px 14px; font-size:12px; font-weight:600; margin-right:8px; }
    .seccion { font-size:12px; font-weight:700; color:#1B7A8C; text-transform:uppercase;
               letter-spacing:1px; border-bottom:2px solid #D6F0F5; padding-bottom:6px; margin:22px 0 14px; }
    .vars { display:flex; flex-wrap:wrap; gap:12px; margin-bottom:22px; }
    .var-card { flex:1; min-width:160px; background:#E8F6FA; border-left:4px solid #1B7A8C;
                border-radius:10px; padding:12px 14px; }
    .var-label { font-size:10px; color:#6B8FA3; font-weight:600; text-transform:uppercase;
                 letter-spacing:.5px; margin-bottom:4px; }
    .var-val   { font-size:20px; font-weight:800; color:#0F2D4A; }
    .var-unit  { font-size:10px; color:#2C5F7A; margin-top:2px; }
    table { width:100%; border-collapse:collapse; font-size:13px; }
    thead th { background:#0F2D4A; color:#fff; padding:12px 14px; font-size:11px;
               font-weight:700; text-transform:uppercase; letter-spacing:.5px; text-align:left; }
    .p0row td { background:#D4F0E4; }
    .footer { margin-top:30px; text-align:center; font-size:11px; color:#6B8FA3;
              border-top:1px solid #E2EFF4; padding-top:14px; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>☕ Informe de Colas — Cafetería "El Toque"</h1>
    <p>Investigación Operativa · Modelamiento matemático del flujo en hora pico</p>
    <span class="badge">Modelo ${res.tipo}</span>
    <span class="badge">${fecha()}</span>
  </div>

  <div class="seccion">Variables del sistema</div>
  <div class="vars">
    <div class="var-card">
      <div class="var-label">Tasa de Llegada (λ)</div>
      <div class="var-val">${lambda}</div>
      <div class="var-unit">clientes / hora</div>
    </div>
    <div class="var-card">
      <div class="var-label">Tasa de Servicio (μ)</div>
      <div class="var-val">${mu}</div>
      <div class="var-unit">clientes / hora · caja</div>
    </div>
    ${modelo === 'MMS' ? `
    <div class="var-card">
      <div class="var-label">Servidores (S)</div>
      <div class="var-val">${servidores}</div>
      <div class="var-unit">cajas abiertas</div>
    </div>
    <div class="var-card">
      <div class="var-label">Capacidad total</div>
      <div class="var-val">${(parseInt(servidores) * parseFloat(mu)).toFixed(0)}</div>
      <div class="var-unit">clientes / hora (S×μ)</div>
    </div>` : ''}
  </div>

  <div class="seccion">Resultados del modelo</div>
  <table>
    <thead>
      <tr>
        <th>Parámetro</th>
        <th>Ecuación</th>
        <th>Valor</th>
        <th>Interpretación</th>
      </tr>
    </thead>
    <tbody>
      ${fila('Utilización del sistema (ρ)',   res.ecuaciones.rho, res.rho + '%',       rhoColor,   res.interpretaciones.rho)}
      <tr class="p0row">
        <td style="font-weight:600;color:#0D1F2D;padding:12px 14px;border-bottom:1px solid #E2EFF4;">Prob. sistema vacío (P₀)</td>
        <td style="font-style:italic;color:#6B8FA3;font-size:12px;padding:12px 14px;border-bottom:1px solid #E2EFF4;">${res.ecuaciones.P0}</td>
        <td style="font-weight:800;font-size:16px;color:#1E8C5A;padding:12px 14px;border-bottom:1px solid #E2EFF4;">${res.P0}%</td>
        <td style="font-size:12px;color:#2C5F7A;line-height:1.6;padding:12px 14px;border-bottom:1px solid #E2EFF4;">Probabilidad de no encontrar a nadie en la cafetería al llegar.</td>
      </tr>
      ${fila('Clientes en el sistema (L)',    res.ecuaciones.L,   res.L + ' pers.',    '#1A4A6E',  res.interpretaciones.L)}
      ${fila('Clientes en la fila (Lq)',      res.ecuaciones.Lq,  res.Lq + ' pers.',   '#1A4A6E',  res.interpretaciones.Lq)}
      ${fila('Tiempo total en cafetería (W)', res.ecuaciones.W,   res.W + ' min',      '#0F2D4A',  res.interpretaciones.W)}
      ${fila('Tiempo de espera en fila (Wq)', res.ecuaciones.Wq,  res.Wq + ' min',     '#0F2D4A',  res.interpretaciones.Wq)}
    </tbody>
  </table>

  <div class="footer">
    El Toque Simulación · Investigación Operativa · App React Native · ${fecha()}
  </div>
</div>
</body>
</html>`;
};

// ─── PDF del experimento de campo ─────────────────────────────────────────────
export const obtenerPlantillaExperimentoHTML = (datos) => {
    const filas = datos.observaciones.map((o, i) => `
      <tr style="background:${i % 2 === 0 ? '#F4F9FB' : '#fff'};">
        <td style="padding:7px 12px;text-align:center;font-weight:600;color:#1B7A8C;border-bottom:1px solid #E2EFF4;">${o.fila}</td>
        <td style="padding:7px 12px;text-align:center;border-bottom:1px solid #E2EFF4;">${o.espera.toFixed(2)}</td>
        <td style="padding:7px 12px;text-align:center;border-bottom:1px solid #E2EFF4;">${(o.espera / 60).toFixed(2)}</td>
        <td style="padding:7px 12px;text-align:center;border-bottom:1px solid #E2EFF4;">${o.atencion.toFixed(2)}</td>
        <td style="padding:7px 12px;text-align:center;border-bottom:1px solid #E2EFF4;">${(o.atencion / 60).toFixed(2)}</td>
      </tr>`).join('');

    const muEst = (60 / datos.mediaAtencionMin).toFixed(1);

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { margin:0; padding:0; font-family: Arial, Helvetica, sans-serif; background:#F4F9FB; color:#0D1F2D; }
    .wrap { max-width:820px; margin:0 auto; padding:32px 28px; background:#fff; }
    .header { background:#0F2D4A; border-radius:16px; padding:28px 26px; color:#fff; margin-bottom:26px; }
    .header h1 { margin:0 0 6px; font-size:20px; font-weight:800; }
    .header p  { margin:0; font-size:13px; opacity:.75; }
    .seccion { font-size:12px; font-weight:700; color:#1B7A8C; text-transform:uppercase;
               letter-spacing:1px; border-bottom:2px solid #D6F0F5; padding-bottom:6px; margin:22px 0 14px; }
    .context { background:#E8F6FA; border-left:4px solid #2AA8BE; border-radius:10px;
               padding:16px 18px; font-size:13px; line-height:1.8; margin-bottom:20px; }
    .context b { color:#0F2D4A; }
    .stats { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:22px; }
    .stat { flex:1; min-width:140px; background:#E8F6FA; border-left:4px solid #1B7A8C;
            border-radius:10px; padding:12px 14px; text-align:center; }
    .stat-label { font-size:10px; color:#6B8FA3; font-weight:600; text-transform:uppercase;
                  letter-spacing:.4px; margin-bottom:4px; }
    .stat-val   { font-size:22px; font-weight:800; color:#0F2D4A; }
    .stat-unit  { font-size:10px; color:#2C5F7A; margin-top:2px; }
    table { width:100%; border-collapse:collapse; font-size:12px; }
    thead th { background:#0F2D4A; color:#fff; padding:10px 12px; font-size:10px;
               font-weight:700; text-transform:uppercase; letter-spacing:.5px; text-align:center; }
    .footer { margin-top:28px; text-align:center; font-size:11px; color:#6B8FA3;
              border-top:1px solid #E2EFF4; padding-top:14px; }
  </style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>📊 Datos de Campo — Experimento de Observación Directa</h1>
    <p>Cafetería "El Toque" · Flujo de atención en hora pico · ${fecha()}</p>
  </div>

  <div class="seccion">Contexto del experimento</div>
  <div class="context">
    <b>Sitio:</b> Cafetería universitaria "El Toque", zona de alto tráfico en hora pico (11:30 am – 1:00 pm).<br>
    <b>Metodología:</b> Observación directa. Dos observadores registraron el tiempo de espera en fila y el tiempo de atención en caja de cada usuario.<br>
    <b>Muestra:</b> ${datos.n} usuarios observados consecutivamente durante una sesión de hora pico.<br>
    <b>Variables:</b> Tiempo de espera en cola (segundos) y tiempo de atención en caja (segundos).<br>
    <b>Supuestos:</b> Llegadas Poisson, servicio exponencial, disciplina FIFO, capacidad ilimitada (M/M/1 o M/M/S).
  </div>

  <div class="seccion">Estadísticas descriptivas</div>
  <div class="stats">
    <div class="stat">
      <div class="stat-label">Observaciones (N)</div>
      <div class="stat-val">${datos.n}</div>
      <div class="stat-unit">usuarios</div>
    </div>
    <div class="stat">
      <div class="stat-label">Espera promedio</div>
      <div class="stat-val">${datos.mediaEsperaMin.toFixed(2)}</div>
      <div class="stat-unit">min (Wq obs.)</div>
    </div>
    <div class="stat">
      <div class="stat-label">Atención promedio</div>
      <div class="stat-val">${datos.mediaAtencionMin.toFixed(2)}</div>
      <div class="stat-unit">min por persona</div>
    </div>
    <div class="stat">
      <div class="stat-label">μ estimada</div>
      <div class="stat-val">${muEst}</div>
      <div class="stat-unit">clientes/h por caja</div>
    </div>
    <div class="stat">
      <div class="stat-label">Desv. Std Espera</div>
      <div class="stat-val">${datos.stdEspera.toFixed(0)}</div>
      <div class="stat-unit">segundos</div>
    </div>
    <div class="stat">
      <div class="stat-label">Desv. Std Atención</div>
      <div class="stat-val">${datos.stdAtencion.toFixed(0)}</div>
      <div class="stat-unit">segundos</div>
    </div>
  </div>

  <div class="seccion">Registro completo — N = ${datos.n} observaciones</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Espera (seg)</th>
        <th>Espera (min)</th>
        <th>Atención (seg)</th>
        <th>Atención (min)</th>
      </tr>
    </thead>
    <tbody>${filas}</tbody>
  </table>

  <div class="footer">
    El Toque Simulación · Datos recolectados mediante observación directa · ${fecha()}
  </div>
</div>
</body>
</html>`;
};