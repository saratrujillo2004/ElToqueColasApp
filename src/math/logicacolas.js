// src/math/logicacolas.js

const factorial = (n) => {
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
};

const interpretarRho = (rho) => {
    if (rho >= 95) return 'Sistema al límite del colapso. Las colas crecen sin control.';
    if (rho >= 80) return `Utilización muy alta (${rho}%). Se generan esperas largas; se recomienda otro servidor.`;
    if (rho >= 60) return `Carga moderada-alta (${rho}%). El sistema funciona con esperas notables en hora pico.`;
    return `Carga saludable (${rho}%). El sistema atiende bien la demanda actual.`;
};

const interpretarL = (L) => {
    const v = parseFloat(L);
    if (v > 15) return `Promedio de ${L} personas simultáneas en la cafetería. Ambiente muy concurrido.`;
    if (v > 5) return `Hay ${L} personas en la cafetería en promedio. Se percibe ocupada.`;
    return `Solo ${L} personas en promedio. Ambiente tranquilo y fluido.`;
};

const interpretarLq = (Lq) => {
    const v = parseFloat(Lq);
    if (v > 8) return `Cola de ${Lq} personas en promedio. La fila es larga y muy visible.`;
    if (v > 3) return `Cola de ${Lq} personas en promedio. Espera perceptible pero manejable.`;
    if (v > 1) return `${Lq} personas esperando en promedio. Fila corta y tolerable.`;
    return `Menos de 1 persona en fila (${Lq}). Prácticamente sin espera.`;
};

const interpretarW = (W) => {
    const v = parseFloat(W);
    if (v > 15) return `${W} min totales en la cafetería. Tiempo alto; puede frustrar a los estudiantes.`;
    if (v > 7) return `${W} min de experiencia total. Aceptable para hora pico.`;
    return `Solo ${W} min en total. Experiencia rápida y cómoda.`;
};

const interpretarWq = (Wq) => {
    const v = parseFloat(Wq);
    if (v > 10) return `${Wq} min solo esperando en fila. Muy alto; muchos estudiantes abandonarán la cola.`;
    if (v > 4) return `${Wq} min de espera en cola. Moderado; abrir otro servidor mejoraría la experiencia.`;
    if (v > 1) return `${Wq} min de espera. Tolerable en hora pico.`;
    return `Menos de 1 min esperando (${Wq} min). Atención casi inmediata.`;
};

// ─── M/M/1 ───────────────────────────────────────────────────────────────────
export const calcularModeloMM1 = (l, m) => {
    const rho = l / m;
    const P0 = 1 - rho;
    const L = l / (m - l);
    const Lq = (l * l) / (m * (m - l));
    const W = (1 / (m - l)) * 60;
    const Wq = (l / (m * (m - l))) * 60;

    const rhoStr  = (rho * 100).toFixed(2);
    const P0Str   = (P0 * 100).toFixed(2);
    const LStr    = L.toFixed(2);
    const LqStr   = Lq.toFixed(2);
    const WStr    = W.toFixed(2);
    const WqStr   = Wq.toFixed(2);

    return {
        tipo: 'M/M/1',
        servidores: 1,
        rho:  rhoStr,
        P0:   P0Str,
        L:    LStr,
        Lq:   LqStr,
        W:    WStr,
        Wq:   WqStr,
        interpretaciones: {
            rho: interpretarRho(rhoStr),
            L:   interpretarL(LStr),
            Lq:  interpretarLq(LqStr),
            W:   interpretarW(WStr),
            Wq:  interpretarWq(WqStr),
        },
        ecuaciones: {
            rho: 'ρ = λ / μ',
            P0:  'P₀ = 1 − ρ',
            L:   'L = λ / (μ − λ)',
            Lq:  'Lq = λ² / [μ(μ − λ)]',
            W:   'W = 1 / (μ − λ)',
            Wq:  'Wq = λ / [μ(μ − λ)]',
        },
    };
};

// ─── M/M/S ───────────────────────────────────────────────────────────────────
export const calcularModeloMMS = (l, m, s) => {
    const rho = l / (s * m);
    let suma = 0;
    for (let n = 0; n < s; n++) {
        suma += Math.pow(l / m, n) / factorial(n);
    }
    const termS = Math.pow(l / m, s) / (factorial(s) * (1 - rho));
    const P0 = 1 / (suma + termS);
    const Lq = (P0 * Math.pow(l / m, s) * rho) / (factorial(s) * Math.pow(1 - rho, 2));
    const L  = Lq + (l / m);
    const W  = (L / l) * 60;
    const Wq = (Lq / l) * 60;

    const rhoStr  = (rho * 100).toFixed(2);
    const P0Str   = (P0 * 100).toFixed(2);
    const LStr    = L.toFixed(2);
    const LqStr   = Lq.toFixed(2);
    const WStr    = W.toFixed(2);
    const WqStr   = Wq.toFixed(2);

    return {
        tipo: `M/M/${s}`,
        servidores: s,
        rho:  rhoStr,
        P0:   P0Str,
        L:    LStr,
        Lq:   LqStr,
        W:    WStr,
        Wq:   WqStr,
        interpretaciones: {
            rho: interpretarRho(rhoStr),
            L:   interpretarL(LStr),
            Lq:  interpretarLq(LqStr),
            W:   interpretarW(WStr),
            Wq:  interpretarWq(WqStr),
        },
        ecuaciones: {
            rho: 'ρ = λ / (S × μ)',
            P0:  'P₀ = 1 / [Σ((λ/μ)ⁿ/n!) + ((λ/μ)ˢ / S!(1−ρ))]',
            L:   'L = Lq + (λ / μ)',
            Lq:  'Lq = [P₀ × (λ/μ)ˢ × ρ] / [S! × (1−ρ)²]',
            W:   'W = L / λ',
            Wq:  'Wq = Lq / λ',
        },
    };
};

// ─── Dataset de campo (46 observaciones reales) ───────────────────────────────
export const DATOS_CAMPO = {
    n: 46,
    mediaEsperaMin: 2.16,
    mediaAtencionMin: 1.36,
    stdEspera: 146.84,
    stdAtencion: 84.40,
    observaciones: [
        { fila:1,  espera:120.00, atencion:28.00  },
        { fila:2,  espera:6.00,   atencion:36.00  },
        { fila:3,  espera:33.50,  atencion:60.00  },
        { fila:4,  espera:21.93,  atencion:2.00   },
        { fila:5,  espera:44.23,  atencion:15.00  },
        { fila:6,  espera:2.98,   atencion:63.00  },
        { fila:7,  espera:24.00,  atencion:50.00  },
        { fila:8,  espera:60.00,  atencion:50.00  },
        { fila:9,  espera:55.93,  atencion:40.00  },
        { fila:10, espera:17.86,  atencion:50.00  },
        { fila:11, espera:55.33,  atencion:77.00  },
        { fila:12, espera:157.00, atencion:103.08 },
        { fila:13, espera:49.20,  atencion:127.57 },
        { fila:14, espera:82.00,  atencion:233.49 },
        { fila:15, espera:192.73, atencion:53.40  },
        { fila:16, espera:249.00, atencion:34.47  },
        { fila:17, espera:254.36, atencion:7.04   },
        { fila:18, espera:254.37, atencion:10.00  },
        { fila:19, espera:261.96, atencion:80.54  },
        { fila:20, espera:81.97,  atencion:69.08  },
        { fila:21, espera:97.95,  atencion:123.26 },
        { fila:22, espera:61.80,  atencion:32.16  },
        { fila:23, espera:20.51,  atencion:85.46  },
        { fila:24, espera:36.18,  atencion:123.23 },
        { fila:25, espera:96.53,  atencion:18.04  },
        { fila:26, espera:123.07, atencion:10.00  },
        { fila:27, espera:59.63,  atencion:54.32  },
        { fila:28, espera:20.89,  atencion:150.59 },
        { fila:29, espera:80.00,  atencion:10.38  },
        { fila:30, espera:58.57,  atencion:20.00  },
        { fila:31, espera:4.50,   atencion:20.32  },
        { fila:32, espera:5.87,   atencion:8.43   },
        { fila:33, espera:76.50,  atencion:35.92  },
        { fila:34, espera:58.45,  atencion:34.88  },
        { fila:35, espera:91.20,  atencion:105.39 },
        { fila:36, espera:98.45,  atencion:44.82  },
        { fila:37, espera:61.20,  atencion:150.11 },
        { fila:38, espera:281.60, atencion:56.86  },
        { fila:39, espera:179.99, atencion:135.00 },
        { fila:40, espera:98.14,  atencion:40.32  },
        { fila:41, espera:157.46, atencion:158.19 },
        { fila:42, espera:346.69, atencion:392.17 },
        { fila:43, espera:721.53, atencion:242.81 },
        { fila:44, espera:595.39, atencion:358.40 },
        { fila:45, espera:160.00, atencion:69.00  },
        { fila:46, espera:358.40, atencion:73.00  },
    ],
};