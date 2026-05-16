const calcularFactorial = (n) => {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
};

// Lógica para un solo cajero (M/M/1)
export const calcularModeloMM1 = (l, m) => {
    const rho = l / m;
    const P0 = 1 - rho; // En M/M/1, P0 es simplemente 1 - rho
    const L = l / (m - l);
    const Lq = (l * l) / (m * (m - l));
    const W = (1 / (m - l)) * 60;   
    const Wq = (l / (m * (m - l))) * 60; 

    return {
        tipo: 'M/M/1',
        servidores: 1,
        rho: (rho * 100).toFixed(2),
        P0: (P0 * 100).toFixed(2), // <-- AGREGADO
        L: L.toFixed(2),
        Lq: Lq.toFixed(2),
        W: W.toFixed(2),
        Wq: Wq.toFixed(2),
        ecuaciones: {
            rho: "ρ = λ / μ",
            P0: "P₀ = 1 - ρ", // <-- AGREGADO
            L: "L = λ / (μ - λ)",
            Lq: "Lq = λ² / [μ(μ - λ)]",
            W: "W = 1 / (μ - λ)",
            Wq: "Wq = λ / [μ(μ - λ)]"
        }
    };
};

// Lógica para múltiples cajeros (M/M/S)
export const calcularModeloMMS = (l, m, s) => {
    const rho = l / (s * m);

    // Calcular P0 (Probabilidad de sistema vacío)
    let sumatoria = 0;
    for (let n = 0; n < s; n++) {
        sumatoria += Math.pow(l / m, n) / calcularFactorial(n);
    }
    // CORRECCIÓN MATEMÁTICA: Quitamos el doble fraccionario confuso
    const terminoS = Math.pow(l / m, s) / (calcularFactorial(s) * (1 - rho));
    const P0 = 1 / (sumatoria + terminoS);

    // Calcular métricas
    const Lq = (P0 * Math.pow(l / m, s) * rho) / (calcularFactorial(s) * Math.pow(1 - rho, 2));
    const L = Lq + (l / m);
    const W = (L / l) * 60;   
    const Wq = (Lq / l) * 60; 

    return {
        tipo: `M/M/${s}`,
        servidores: s,
        rho: (rho * 100).toFixed(2),
        P0: (P0 * 100).toFixed(2), // <-- AGREGADO (en porcentaje para que sea legible)
        L: L.toFixed(2),
        Lq: Lq.toFixed(2),
        W: W.toFixed(2),
        Wq: Wq.toFixed(2),
        ecuaciones: {
            rho: "ρ = λ / (S * μ)",
            P0: "P₀ = 1 / [Σ((λ/μ)^n/n!) + ((λ/μ)^S / (S!(1-ρ)))]", // <-- AGREGADO
            L: "L = Lq + (λ / μ)",
            Lq: "Lq = [P₀ * (λ/μ)^S * ρ] / [S! * (1-ρ)²]",
            W: "W = L / λ",
            Wq: "Wq = Lq / λ"
        }
    };
};