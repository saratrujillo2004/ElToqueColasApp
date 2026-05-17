import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

// ─── Paleta: navy profundo + teal cálido + blancos limpios ───────────────────
export const C = {
    navy:       '#0F2D4A',   // fondo header / tabs
    navyMid:    '#1A4A6E',   // botón calcular
    teal:       '#1B7A8C',   // acento principal
    tealLight:  '#2AA8BE',   // bordes activos
    tealPale:   '#D6F0F5',   // fondos de chip / badges
    sky:        '#E8F6FA',   // fondo de tarjetas métricas
    bg:         '#F4F9FB',   // fondo general de la app
    white:      '#FFFFFF',
    textDark:   '#0D1F2D',   // texto principal
    textMid:    '#2C5F7A',   // labels, subtítulos
    textSoft:   '#6B8FA3',   // fórmulas, notas
    green:      '#1E8C5A',   // P0 y valores buenos
    greenPale:  '#D4F0E4',
    amber:      '#B86A00',   // advertencia moderada
    amberPale:  '#FFF0D6',
    red:        '#C0392B',   // saturación
    redPale:    '#FDECEA',
    border:     '#C5DDE8',
    divider:    '#E2EFF4',
};

// ─── Selector de modelo ──────────────────────────────────────────────────────
export const SelectorModelo = ({ modelo, setModelo, alCambiar }) => (
    <View style={s.selectorWrap}>
        {[
            { id: 'MM1', emoji: '🏪', label: 'M/M/1', sub: 'Una caja' },
            { id: 'MMS', emoji: '🏬', label: 'M/M/S', sub: 'Varias cajas' },
        ].map(t => {
            const activo = modelo === t.id;
            return (
                <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.8}
                    style={[s.selectorBtn, activo && s.selectorBtnActivo]}
                    onPress={() => { setModelo(t.id); alCambiar(); }}
                >
                    <Text style={s.selectorEmoji}>{t.emoji}</Text>
                    <Text style={[s.selectorLabel, activo && s.selectorLabelActivo]}>{t.label}</Text>
                    <Text style={[s.selectorSub, activo && s.selectorSubActivo]}>{t.sub}</Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

// ─── Tarjeta de métrica con interpretación ───────────────────────────────────
export const MetricaCard = ({ emoji, titulo, valor, formula, interpretacion, estadoBg, estadoColor }) => (
    <View style={[s.metricCard, estadoBg ? { borderLeftColor: estadoColor || C.teal } : {}]}>
        <View style={s.metricTop}>
            <Text style={s.metricEmoji}>{emoji}</Text>
            <View style={{ flex: 1 }}>
                <Text style={s.metricTitulo}>{titulo}</Text>
                <Text style={s.metricFormula}>{formula}</Text>
            </View>
            <Text style={[s.metricValor, { color: estadoColor || C.navyMid }]}>{valor}</Text>
        </View>
        <View style={[s.metricInterpBox, estadoBg ? { backgroundColor: estadoBg } : {}]}>
            <Text style={s.metricInterpText}>{interpretacion}</Text>
        </View>
    </View>
);

// ─── Tarjeta especial P0 ─────────────────────────────────────────────────────
export const P0Card = ({ valor, formula }) => {
    const pct = parseFloat(valor);
    const nivel = pct > 25
        ? `Hay un ${valor}% de probabilidad de encontrar la cafetería vacía. El sistema tiene buena holgura.`
        : pct > 10
        ? `Solo ${valor}% de probabilidad de sistema vacío. La cafetería está casi siempre ocupada.`
        : `Apenas ${valor}% de probabilidad de sistema vacío. El sistema está casi siempre lleno.`;
    return (
        <View style={[s.metricCard, { borderLeftColor: C.green }]}>
            <View style={s.metricTop}>
                <Text style={s.metricEmoji}>🟢</Text>
                <View style={{ flex: 1 }}>
                    <Text style={s.metricTitulo}>Prob. sistema vacío (P₀)</Text>
                    <Text style={s.metricFormula}>{formula}</Text>
                </View>
                <Text style={[s.metricValor, { color: C.green }]}>{valor}%</Text>
            </View>
            <View style={[s.metricInterpBox, { backgroundColor: C.greenPale }]}>
                <Text style={s.metricInterpText}>{nivel}</Text>
            </View>
        </View>
    );
};

// ─── Divisor de sección ──────────────────────────────────────────────────────
export const Divisor = ({ label }) => (
    <View style={s.divWrap}>
        <View style={s.divLine} />
        <Text style={s.divLabel}>{label}</Text>
        <View style={s.divLine} />
    </View>
);

// ─── Chip informativo ────────────────────────────────────────────────────────
export const InfoChip = ({ etiqueta, valor }) => (
    <View style={s.chip}>
        <Text style={s.chipLabel}>{etiqueta}</Text>
        <Text style={s.chipValor}>{valor}</Text>
    </View>
);

// ─── Fila de metodología ─────────────────────────────────────────────────────
export const MetodRow = ({ emoji, titulo, texto }) => (
    <View style={s.metodRow}>
        <Text style={s.metodEmoji}>{emoji}</Text>
        <View style={{ flex: 1 }}>
            <Text style={s.metodTitulo}>{titulo}</Text>
            <Text style={s.metodTexto}>{texto}</Text>
        </View>
    </View>
);

// ─── Estilos ─────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    // Selector
    selectorWrap:      { flexDirection:'row', gap:10, marginBottom:20 },
    selectorBtn:       { flex:1, alignItems:'center', paddingVertical:14, borderRadius:14,
                         backgroundColor:C.sky, borderWidth:2, borderColor:C.border },
    selectorBtnActivo: { backgroundColor:C.navy, borderColor:C.tealLight },
    selectorEmoji:     { fontSize:22, marginBottom:4 },
    selectorLabel:     { fontSize:15, fontWeight:'700', color:C.textMid },
    selectorLabelActivo:{ color:'#fff' },
    selectorSub:       { fontSize:11, color:C.textSoft, marginTop:2 },
    selectorSubActivo: { color:'#8EC8D8' },

    // Metric card
    metricCard:     { backgroundColor:C.white, borderRadius:14, padding:14, marginBottom:10,
                      borderLeftWidth:4, borderLeftColor:C.teal,
                      shadowColor:'#000', shadowOpacity:0.05, shadowRadius:6, elevation:2 },
    metricTop:      { flexDirection:'row', alignItems:'flex-start', marginBottom:10 },
    metricEmoji:    { fontSize:22, marginRight:10, marginTop:2 },
    metricTitulo:   { fontSize:13, fontWeight:'700', color:C.textDark, marginBottom:3 },
    metricFormula:  { fontSize:11, color:C.textSoft, fontStyle:'italic' },
    metricValor:    { fontSize:22, fontWeight:'800', color:C.navyMid, textAlign:'right', minWidth:70 },
    metricInterpBox:{ backgroundColor:C.sky, borderRadius:8, padding:10 },
    metricInterpText:{ fontSize:12, color:C.textMid, lineHeight:18 },

    // Divisor
    divWrap:  { flexDirection:'row', alignItems:'center', marginVertical:14 },
    divLine:  { flex:1, height:1, backgroundColor:C.divider },
    divLabel: { marginHorizontal:10, fontSize:12, fontWeight:'700', color:C.textSoft,
                textTransform:'uppercase', letterSpacing:0.8 },

    // Chip
    chip:      { backgroundColor:C.tealPale, borderRadius:10, padding:12, marginBottom:8 },
    chipLabel: { fontSize:11, color:C.textSoft, marginBottom:3, fontWeight:'600' },
    chipValor: { fontSize:15, color:C.navy, fontWeight:'700' },

    // Metod row
    metodRow:   { flexDirection:'row', marginBottom:14, alignItems:'flex-start' },
    metodEmoji: { fontSize:20, marginRight:12, marginTop:2 },
    metodTitulo:{ fontSize:13, fontWeight:'700', color:C.textDark, marginBottom:2 },
    metodTexto: { fontSize:12, color:C.textMid, lineHeight:18 },
});