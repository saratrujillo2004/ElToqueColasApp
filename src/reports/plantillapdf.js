// src/reports/plantillapdf.js

const fechaHoy = () => new Date().toLocaleDateString('es-CO', {
    year: 'numeric', month: 'long', day: 'numeric',
});

const COLOR = {
    navy:    '#1a1a2e',
    primary: '#33658A',
    accent:  '#A8D4E6',
    bg:      '#F5F3EF',
    surface: '#FFFFFF',
    soft:    '#EAF2F8',
    green:   '#2D7A4F',
    greenBg: '#E6F3EC',
    amber:   '#C47F1A',
    red:     '#A32D2D',
    text:    '#1a1a2e',
    textMid: '#33658A',
    textSoft:'#9B9790',
    border:  '#E8E5DF',
};

export const obtenerPlantillaHTML = (lambda, mu, servidores, modelo, res) => {
    const rhoNum = parseFloat(res.rho);
    const rhoColor = rhoNum >= 85 ? COLOR.red : rhoNum >= 60 ? COLOR.amber : COLOR.green;

    const fila = (nombre, ecuacion, valor, colorVal, interp) => `
      <tr>
        <td style="padding:12px 14px;border-bottom:1px solid ${COLOR.border};font-weight:600;color:${COLOR.text};font-size:13px;">${nombre}</td>
        <td style="padding:12px 14px;border-bottom:1px solid ${COLOR.border};font-style:italic;color:${COLOR.textSoft};font-size:11px;">${ecuacion}</td>
        <td style="padding:12px 14px;border-bottom:1px solid ${COLOR.border};font-weight:700;font-size:16px;color:${colorVal};white-space:nowrap;">${valor}</td>
        <td style="padding:12px 14px;border-bottom:1px solid ${COLOR.border};font-size:12px;color:${COLOR.textMid};line-height:1.6;">${interp}</td>
      </tr>`;

    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8">
<style>
  body { margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; background:${COLOR.bg}; color:${COLOR.text}; }
  .wrap { max-width:820px; margin:0 auto; padding:32px 28px; background:${COLOR.surface}; }
  .header { background:${COLOR.navy}; border-radius:14px; padding:26px; color:#fff; margin-bottom:26px; }
  .header h1 { margin:0 0 6px; font-size:19px; }
  .header p  { margin:0; font-size:12px; opacity:.7; }
  .badge { display:inline-block; margin-top:12px; margin-right:8px;
           background:rgba(168,212,230,0.2); border:1px solid rgba(168,212,230,0.35);
           border-radius:20px; padding:4px 14px; font-size:11px; }
  .sec { font-size:11px; font-weight:700; color:${COLOR.primary}; text-transform:uppercase;
         letter-spacing:1px; border-bottom:2px solid ${COLOR.accent}; padding-bottom:5px; margin:20px 0 14px; }
  .vars { width:100%; border-collapse:collapse; margin-bottom:22px; }
  .var-cell { width:25%; padding:0 8px 0 0; vertical-align:top; }
  .var-card { background:${COLOR.soft}; border-left:4px solid ${COLOR.primary};
              border-radius:10px; padding:12px 14px; }
  .var-label { font-size:10px; color:${COLOR.textSoft}; font-weight:600;
               text-transform:uppercase; letter-spacing:.4px; margin-bottom:4px; }
  .var-val   { font-size:20px; font-weight:700; color:${COLOR.navy}; }
  .var-unit  { font-size:10px; color:${COLOR.textMid}; margin-top:2px; }
  table.res  { width:100%; border-collapse:collapse; font-size:13px; }
  table.res thead th { background:${COLOR.navy}; color:#fff; padding:11px 14px;
                       font-size:10px; font-weight:700; text-transform:uppercase;
                       letter-spacing:.5px; text-align:left; }
  .p0bg td  { background:${COLOR.greenBg}; }
  .footer { margin-top:28px; text-align:center; font-size:10px; color:${COLOR.textSoft};
            border-top:1px solid ${COLOR.border}; padding-top:12px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1> Informe de colas | Cafetería El Toque</h1>
    <p>Modelamiento matemático del flujo de atención en hora pico</p>
    <span class="badge">Modelo ${res.tipo}</span>
    <span class="badge">${fechaHoy()}</span>
  </div>

  <div class="sec">Variables del sistema</div>
  <table class="vars"><tr>
    <td class="var-cell"><div class="var-card">
      <div class="var-label">Tasa de llegada (λ)</div>
      <div class="var-val">${lambda}</div>
      <div class="var-unit">clientes / hora</div>
    </div></td>
    <td class="var-cell"><div class="var-card">
      <div class="var-label">Tasa de servicio (μ)</div>
      <div class="var-val">${mu}</div>
      <div class="var-unit">clientes / hora · caja</div>
    </div></td>
    ${modelo === 'MMS' ? `
    <td class="var-cell"><div class="var-card">
      <div class="var-label">Servidores (S)</div>
      <div class="var-val">${servidores}</div>
      <div class="var-unit">cajas abiertas</div>
    </div></td>
    <td class="var-cell"><div class="var-card">
      <div class="var-label">Capacidad total</div>
      <div class="var-val">${(parseInt(servidores) * parseFloat(mu)).toFixed(0)}</div>
      <div class="var-unit">clientes / hora (S×μ)</div>
    </div></td>` : '<td class="var-cell"></td><td class="var-cell"></td>'}
  </tr></table>

  <div class="sec">Resultados del modelo</div>
  <table class="res">
    <thead><tr>
      <th>Parámetro</th><th>Ecuación</th><th>Valor</th><th>Interpretación</th>
    </tr></thead>
    <tbody>
      ${fila('Utilización del sistema (ρ)',   res.ecuaciones.rho, res.rho + '%',      rhoColor,      res.interpretaciones.rho)}
      <tr class="p0bg">
        <td style="padding:12px 14px;border-bottom:1px solid ${COLOR.border};font-weight:600;font-size:13px;">Prob. sistema vacío (P₀)</td>
        <td style="padding:12px 14px;border-bottom:1px solid ${COLOR.border};font-style:italic;color:${COLOR.textSoft};font-size:11px;">${res.ecuaciones.P0}</td>
        <td style="padding:12px 14px;border-bottom:1px solid ${COLOR.border};font-weight:700;font-size:16px;color:${COLOR.green};">${res.P0}%</td>
        <td style="padding:12px 14px;border-bottom:1px solid ${COLOR.border};font-size:12px;color:${COLOR.textMid};line-height:1.6;">Probabilidad de no encontrar a nadie en la cafetería al llegar.</td>
      </tr>
      ${fila('Clientes en el sistema (L)',    res.ecuaciones.L,   res.L + ' pers.',   COLOR.primary, res.interpretaciones.L)}
      ${fila('Clientes en la fila (Lq)',      res.ecuaciones.Lq,  res.Lq + ' pers.',  COLOR.primary, res.interpretaciones.Lq)}
      ${fila('Tiempo total en cafetería (W)', res.ecuaciones.W,   res.W + ' min',     COLOR.navy,    res.interpretaciones.W)}
      ${fila('Tiempo de espera en fila (Wq)', res.ecuaciones.Wq,  res.Wq + ' min',    COLOR.navy,    res.interpretaciones.Wq)}
    </tbody>
  </table>

  <div class="footer">El Toque Simulación · Investigación Operativa · ${fechaHoy()}</div>
</div>
</body></html>`;
};


export const obtenerPlantillaExperimentoHTML = (datos) => {
    const muEst = (60 / datos.mediaAtencionMin).toFixed(1);

    const filas = datos.observaciones.map((o, i) => `
      <tr style="background:${i % 2 === 0 ? COLOR.soft : COLOR.surface};">
        <td style="padding:7px 12px;text-align:center;font-weight:700;color:${COLOR.primary};border-bottom:1px solid ${COLOR.border};">${o.fila}</td>
        <td style="padding:7px 12px;text-align:center;border-bottom:1px solid ${COLOR.border};">${o.espera.toFixed(2)}</td>
        <td style="padding:7px 12px;text-align:center;border-bottom:1px solid ${COLOR.border};">${(o.espera / 60).toFixed(2)}</td>
        <td style="padding:7px 12px;text-align:center;border-bottom:1px solid ${COLOR.border};">${o.atencion.toFixed(2)}</td>
        <td style="padding:7px 12px;text-align:center;border-bottom:1px solid ${COLOR.border};">${(o.atencion / 60).toFixed(2)}</td>
      </tr>`).join('');

    const statCell = (label, val, unit) => `
      <td style="width:16%;padding:0 6px 0 0;vertical-align:top;">
        <div style="background:${COLOR.soft};border-left:4px solid ${COLOR.primary};border-radius:10px;padding:10px 12px;text-align:center;">
          <div style="font-size:10px;color:${COLOR.textSoft};font-weight:600;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px;">${label}</div>
          <div style="font-size:19px;font-weight:700;color:${COLOR.navy};">${val}</div>
          <div style="font-size:10px;color:${COLOR.textMid};margin-top:2px;">${unit}</div>
        </div>
      </td>`;

    return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8">
<style>
  body { margin:0; padding:0; font-family:Arial,Helvetica,sans-serif; background:${COLOR.bg}; color:${COLOR.text}; }
  .wrap { max-width:820px; margin:0 auto; padding:32px 28px; background:${COLOR.surface}; }
  .header { background:${COLOR.navy}; border-radius:14px; padding:26px; color:#fff; margin-bottom:26px; }
  .header h1 { margin:0 0 6px; font-size:19px; }
  .header p  { margin:0; font-size:12px; opacity:.7; }
  .sec { font-size:11px; font-weight:700; color:${COLOR.primary}; text-transform:uppercase;
         letter-spacing:1px; border-bottom:2px solid ${COLOR.accent}; padding-bottom:5px; margin:20px 0 14px; }
  .ctx { background:${COLOR.soft}; border-left:4px solid ${COLOR.accent}; border-radius:10px;
         padding:14px 16px; font-size:13px; line-height:1.8; margin-bottom:20px; }
  .ctx b { color:${COLOR.navy}; }
  table.data { width:100%; border-collapse:collapse; font-size:12px; }
  table.data thead th { background:${COLOR.navy}; color:#fff; padding:9px 12px; font-size:10px;
                        font-weight:700; text-transform:uppercase; letter-spacing:.4px; text-align:center; }
  .footer { margin-top:28px; text-align:center; font-size:10px; color:${COLOR.textSoft};
            border-top:1px solid ${COLOR.border}; padding-top:12px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>Datos de Campo - Experimento de obervación directa</h1>
    <p>Cafetería El Toque - Flujo de atención en hora pico universitaria · ${fechaHoy()}</p>
  </div>

  <div class="sec">Contexto del experimento</div>
  <div class="ctx">
    <b>Sitio:</b> Cafetería universitaria El Toque, zona de alto tráfico en hora pico (11:30 am – 1:00 pm).<br>
    <b>Metodología:</b> Observación directa. Tres observadores registraron el tiempo de espera en fila y el tiempo de atención en caja de cada usuario.<br>
    <b>Muestra:</b> ${datos.n} usuarios observados consecutivamente. Representa una sesión típica de alta demanda.<br>
    <b>Variables:</b> Tiempo de espera en cola (seg) y tiempo de atención en caja (seg) por individuo.<br>
  </div>

  <div class="sec">Estadísticas descriptivas</div>
  <table style="width:100%;border-collapse:collapse;margin-bottom:22px;"><tr>
    ${statCell('Observaciones (N)', datos.n, 'usuarios')}
    ${statCell('Espera promedio', datos.mediaEsperaMin.toFixed(2), 'min (Wq obs.)')}
    ${statCell('Atención promedio', datos.mediaAtencionMin.toFixed(2), 'min por persona')}
    ${statCell('μ estimada', muEst, 'clientes/h·caja')}
    ${statCell('Desv. Std espera', datos.stdEspera.toFixed(0), 'segundos')}
    ${statCell('Desv. Std atención', datos.stdAtencion.toFixed(0), 'segundos')}
  </tr></table>

  <div class="sec">Registro completo - N = ${datos.n} observaciones</div>
  <table class="data">
    <thead><tr>
      <th>#</th><th>Espera (seg)</th><th>Espera (min)</th><th>Atención (seg)</th><th>Atención (min)</th>
    </tr></thead>
    <tbody>${filas}</tbody>
  </table>

  <div class="footer">El Toque - Datos recolectados mediante observación directa · ${fechaHoy()}</div>
</div>
</body></html>`;
};