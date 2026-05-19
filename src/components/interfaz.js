// src/components/interfaz.js
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

// ─── Paleta ──────────────────────────────────────────────────────────────────
export const C = {
  navy:        '#2d274d',
  primary:     '#996ce6',
  accent:      '#A78BFA',
  accentMid:   '#8B5CF6',

  bg:          '#F8F7FC',
  surface:     '#FFFFFF',
  surfaceSoft: '#F1EEFB',

  textDark:    '#1F1B2D',
  textMid:     '#5B5570',
  textSoft:    '#9B95B3',

  border:      '#E8E4F3',
  divider:     '#F0ECF8',

  green:       '#15803D',
  greenPale:   '#DCFCE7',

  amber:       '#D97706',
  amberPale:   '#FEF3C7',

  red:         '#DC2626',
  redPale:     '#FEE2E2',
};

export const SelectorModelo = ({ modelo, setModelo, alCambiar }) => (
    <View style={s.selRow}>
        {[
            { id: 'MM1', label: 'M/M/1', sub: 'Una caja' },
            { id: 'MMS', label: 'M/M/S', sub: 'Varias cajas' },
        ].map(t => {
            const activo = modelo === t.id;
            return (
                <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.8}
                    style={[s.selBtn, activo && s.selBtnActivo]}
                    onPress={() => { setModelo(t.id); alCambiar(); }}
                >
                    <Text style={[s.selLabel, activo && s.selLabelActivo]}>{t.label}</Text>
                    <Text style={[s.selSub, activo && s.selSubActivo]}>{t.sub}</Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

export const MetricaCard = ({ emoji, titulo, formula, valor, interpretacion, valorColor }) => (
    <View style={s.metricCard}>
        <View style={s.metricTop}>
            <View style={s.metricIconBox}>
                <Text style={s.metricEmoji}>{emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={s.metricTitulo}>{titulo}</Text>
                <Text style={s.metricFormula}>{formula}</Text>
            </View>
            <Text style={[s.metricValor, valorColor ? { color: valorColor } : {}]}>{valor}</Text>
        </View>
        <View style={s.interpBox}>
            <Text style={s.interpTxt}>{interpretacion}</Text>
        </View>
    </View>
);

export const P0Card = ({ valor, formula }) => {
    const pct = parseFloat(valor);
    const interp = pct > 25
        ? `Hay un ${valor}% de probabilidad de encontrar la cafetería vacía. El sistema tiene buena holgura.`
        : pct > 10
        ? `Solo ${valor}% de probabilidad de sistema vacío. La cafetería está casi siempre ocupada.`
        : `Apenas ${valor}%. El sistema está prácticamente lleno todo el tiempo.`;
    return (
        <View style={[s.metricCard, { borderLeftColor: C.green }]}>
            <View style={s.metricTop}>
                <View style={[s.metricIconBox, { backgroundColor: C.greenPale }]}>
                    <Text style={s.metricEmoji}>🟢</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={s.metricTitulo}>Prob. sistema vacío (P₀)</Text>
                    <Text style={s.metricFormula}>{formula}</Text>
                </View>
                <Text style={[s.metricValor, { color: C.green }]}>{valor}%</Text>
            </View>
            <View style={[s.interpBox, { backgroundColor: C.greenPale }]}>
                <Text style={s.interpTxt}>{interp}</Text>
            </View>
        </View>
    );
};

export const Divisor = ({ label }) => (
    <View style={s.divWrap}>
        <View style={s.divLine} />
        <Text style={s.divLabel}>{label}</Text>
        <View style={s.divLine} />
    </View>
);


export const InfoChip = ({ etiqueta, valor }) => (
    <View style={s.chip}>
        <Text style={s.chipLabel}>{etiqueta}</Text>
        <Text style={s.chipValor}>{valor}</Text>
    </View>
);


export const MetodRow = ({ emoji, titulo, texto }) => (
    <View style={s.metodRow}>
        <Text style={s.metodEmoji}>{emoji}</Text>
        <View style={{ flex: 1 }}>
            <Text style={s.metodTitulo}>{titulo}</Text>
            <Text style={s.metodTexto}>{texto}</Text>
        </View>
    </View>
);


const s = StyleSheet.create({
    // Selector
    selRow:        { flexDirection: 'row', gap: 10, marginBottom: 18 },
    selBtn:        { flex: 1, alignItems: 'center', paddingVertical: 12,
                     borderRadius: 12, backgroundColor: C.surfaceSoft,
                     borderWidth: 1.5, borderColor: C.border },
    selBtnActivo:  { backgroundColor: C.navy, borderColor: C.navy },
    selLabel:      { fontSize: 14, fontWeight: '600', color: C.textMid },
    selLabelActivo:{ color: '#fff' },
    selSub:        { fontSize: 10, color: C.textSoft, marginTop: 2 },
    selSubActivo:  { color: C.accent },

    // Metric card
    metricCard:    { backgroundColor: C.surface, borderRadius: 14, padding: 14,
                     marginBottom: 10, borderLeftWidth: 3, borderLeftColor: C.primary,
                     borderWidth: 0.5, borderColor: C.border },
    metricTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
    metricIconBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#EAF2F8',
                     alignItems: 'center', justifyContent: 'center', marginRight: 10 },
    metricEmoji:   { fontSize: 16 },
    metricTitulo:  { fontSize: 12, fontWeight: '700', color: C.textDark, marginBottom: 2 },
    metricFormula: { fontSize: 10, color: C.textSoft, fontStyle: 'italic' },
    metricValor:   { fontSize: 20, fontWeight: '700', color: C.primary, minWidth: 72, textAlign: 'right' },
    interpBox:     { backgroundColor: C.surfaceSoft, borderRadius: 8, padding: 8 },
    interpTxt:     { fontSize: 11, color: C.textMid, lineHeight: 17 },

    // Divisor
    divWrap:   { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
    divLine:   { flex: 1, height: 0.5, backgroundColor: C.border },
    divLabel:  { marginHorizontal: 10, fontSize: 11, fontWeight: '700', color: C.textSoft,
                 textTransform: 'uppercase', letterSpacing: 0.8 },

    // Chip
    chip:      { backgroundColor: '#EAF2F8', borderRadius: 10, padding: 12, marginBottom: 8,
                 borderLeftWidth: 3, borderLeftColor: C.accent },
    chipLabel: { fontSize: 10, color: C.textSoft, fontWeight: '600', marginBottom: 3 },
    chipValor: { fontSize: 14, color: C.navy, fontWeight: '700' },

    // Metod
    metodRow:   { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-start' },
    metodEmoji: { fontSize: 18, marginRight: 10, marginTop: 1 },
    metodTitulo:{ fontSize: 12, fontWeight: '700', color: C.textDark, marginBottom: 2 },
    metodTexto: { fontSize: 12, color: C.textMid, lineHeight: 17 },
});