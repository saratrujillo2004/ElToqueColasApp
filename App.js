// App.js
import React, { useState } from 'react';
import {
    StyleSheet, Text, View, TextInput, TouchableOpacity,
    ScrollView, Alert, StatusBar, Dimensions,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { calcularModeloMM1, calcularModeloMMS, DATOS_CAMPO } from './src/math/logicacolas';
import { obtenerPlantillaHTML, obtenerPlantillaExperimentoHTML } from './src/reports/plantillapdf';
import { SelectorModelo, MetricaCard, P0Card, Divisor, InfoChip, MetodRow, C } from './src/components/interfaz';

const { width } = Dimensions.get('window');
const CARD_W = (width - 52) / 2;

const estadoRho = (rhoStr) => {
    const v = parseFloat(rhoStr);
    if (v >= 85) return { color: C.red,   bg: C.redPale };
    if (v >= 60) return { color: C.amber, bg: C.amberPale };
    return { color: C.green, bg: C.greenPale };
};


const StatCard = ({ valor, label, unidad, accentColor }) => (
    <View style={[st.statCard, { borderTopColor: accentColor || C.primary }]}>
        <Text style={[st.statVal, { color: accentColor || C.navy }]}>{valor}</Text>
        <Text style={st.statLabel}>{label}</Text>
        {unidad ? <Text style={st.statUnit}>{unidad}</Text> : null}
    </View>
);


const TabBar = ({ tab, setTab }) => (
    <View style={st.tabBar}>
        {[
            { id: 'experimento', label: 'Experimento' },
            { id: 'calculadora', label: 'Calculadora' },
        ].map(t => {
            const activo = tab === t.id;
            return (
                <TouchableOpacity
                    key={t.id}
                    activeOpacity={0.8}
                    style={[st.tabBtn, activo && st.tabBtnActivo]}
                    onPress={() => setTab(t.id)}
                >
                    <Text style={[st.tabTxt, activo && st.tabTxtActivo]}>{t.label}</Text>
                </TouchableOpacity>
            );
        })}
    </View>
);

const Boton = ({ label, onPress, bgColor, disabled }) => (
    <TouchableOpacity
        activeOpacity={0.82}
        style={[st.btn, { backgroundColor: bgColor || C.navy }, disabled && st.btnOff]}
        onPress={onPress}
        disabled={!!disabled}
    >
        <Text style={st.btnTxt}>{label}</Text>
    </TouchableOpacity>
);


export default function App() {
    const [tab, setTab]         = useState('experimento');
    const [lambda, setLambda]   = useState('50');
    const [mu, setMu]           = useState('60');
    const [serv, setServ]       = useState('2');
    const [modelo, setModelo]   = useState('MM1');
    const [resultado, setRes]   = useState(null);
    const [loading, setLoading] = useState(false);

    const calcular = () => {
        const l = parseFloat(lambda);
        const m = parseFloat(mu);
        const s = parseInt(serv);

        if (isNaN(l) || isNaN(m) || l <= 0 || m <= 0) {
            Alert.alert('Datos inválidos', 'Ingresa valores numéricos positivos en todos los campos.');
            return;
        }

        if (modelo === 'MM1') {
            if (l >= m) {
                Alert.alert(
                    'Sistema inestable (M/M/1)',
                    `Para M/M/1 la tasa de servicio μ debe ser estrictamente mayor que λ.\n\nActual: λ=${l}, μ=${m}.\n\nAumenta μ, reduce λ, o cambia a M/M/S con varios servidores.`
                );
                return;
            }
            setRes(calcularModeloMM1(l, m));
        } else {
            if (isNaN(s) || s < 1) {
                Alert.alert('Error', 'El número de servidores debe ser un entero mayor o igual a 1.');
                return;
            }
            if (l >= s * m) {
                Alert.alert(
                    'Sistema inestable (M/M/S)',
                    `La demanda λ=${l} supera la capacidad total S×μ=${s * m}.\n\nAumenta S o reduce λ.`
                );
                return;
            }
            setRes(calcularModeloMMS(l, m, s));
        }
    };

    
    const pdfResultados = async () => {
        if (!resultado) return;
        setLoading(true);
        try {
            const html = obtenerPlantillaHTML(lambda, mu, serv, modelo, resultado);
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Informe de resultados' });
        } catch {
            Alert.alert('Error', 'No se pudo generar el PDF.');
        } finally {
            setLoading(false);
        }
    };

    
    const pdfExperimento = async () => {
        setLoading(true);
        try {
            const html = obtenerPlantillaExperimentoHTML(DATOS_CAMPO);
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Análisis de Datos de Campo' });
        } catch {
            Alert.alert('Error', 'No se pudo generar el PDF.');
        } finally {
            setLoading(false);
        }
    };

    
    const pantExperimento = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

            {/* Hero */}
            <View style={st.hero}>
                <View style={st.heroBadge}>
                    <Text style={st.heroBadgeTxt}>Hora pico · 11:30 – 13:00</Text>
                </View>
                <Text style={st.heroTitle}>Cafetería universitaria: El Toque</Text>
                <Text style={st.heroSub}>
                    Flujo de atención observado directamente en campo.
                </Text>
            </View>

            {/* Stats */}
            <View style={st.statGrid}>
                <StatCard valor="46"   label="Observaciones"      unidad="usuarios"      accentColor={C.primary}   />
                <StatCard valor="2.16" label="Espera promedio"     unidad="min en fila"   accentColor={C.amber}     />
                <StatCard valor="1.36" label="Atención promedio"   unidad="min por caja"  accentColor={C.accentMid} />
                <StatCard valor="44.2" label="μ estimada"          unidad="clientes/h"    accentColor={C.green}     />
            </View>

            {/* Contexto */}
            <View style={st.card}>
                <Text style={st.cardTitle}>Contexto del estudio</Text>
                <Text style={st.parr}>
                    Se analizó el comportamiento de la cola durante la hora pico, periodo de máxima demanda
                    estudiantil. La cafetería opera con <Text style={st.bold}>1 caja activa</Text> y
                    atiende desde bebidas rápidas hasta platos del día, generando alta variabilidad en el servicio.
                </Text>
            </View>

            {/* Metodología */}
            <View style={st.card}>
                <Text style={st.cardTitle}>Metodología</Text>
                <MetodRow emoji="🎯" titulo="Método" texto="Observación directa en campo. Dos observadores registraron tiempos de forma simultánea para evitar sesgos." />
                <MetodRow emoji="👥" titulo="Muestra" texto="46 usuarios observados consecutivamente en una sesión de hora pico. Muestra representativa de la demanda real." />
                <MetodRow emoji="⏱️" titulo="Variables" texto="Tiempo de espera en fila y tiempo de atención en caja, en segundos, por cada individuo." />
            </View>

            {/* Valores recomendados */}
            <View style={st.card}>
                <Text style={st.cardTitle}>Valores recomendados para la calculadora</Text>
                <Text style={st.parr}>Basados en el levantamiento, estos valores replican las condiciones reales observadas:</Text>
                <InfoChip etiqueta="λ · Tasa de llegada"            valor="50 clientes / hora" />
                <InfoChip etiqueta="μ · Tasa de servicio por caja"  valor="60 clientes / hora" />
                <InfoChip etiqueta="S · Servidores (para M/M/S)"    valor="2 cajas abiertas" />
                <View style={st.notaBox}>
                    <Text style={st.notaTxt}>
                        Con λ=50, μ=60 y S=1 (M/M/1) el sistema queda al 83% de uso, refleja la presión real.
                        Con S=2 (M/M/S) baja a 42%, mucho más cómodo para los estudiantes.
                    </Text>
                </View>
            </View>

            <Boton
                label={loading ? '⏳  Generando PDF...' : 'Descargar análisis de datos (PDF)'}
                bgColor={C.primary}
                onPress={pdfExperimento}
                disabled={loading}
            />
            <View style={{ height: 32 }} />
        </ScrollView>
    );

    const pantCalculadora = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

            <View style={st.card}>
                <Text style={st.cardTitle}>Modelo de colas</Text>

                <SelectorModelo
                    modelo={modelo}
                    setModelo={setModelo}
                    alCambiar={() => setRes(null)}
                />

                <Text style={st.inputLabel}>Tasa de llegada (λ) — estudiantes / hora</Text>
                <TextInput
                    style={st.input}
                    keyboardType="numeric"
                    value={lambda}
                    onChangeText={setLambda}
                    placeholder="ej. 50"
                    placeholderTextColor={C.textSoft}
                />

                <Text style={st.inputLabel}>Tasa de servicio (μ) — capacidad por caja / hora</Text>
                <TextInput
                    style={st.input}
                    keyboardType="numeric"
                    value={mu}
                    onChangeText={setMu}
                    placeholder="ej. 60"
                    placeholderTextColor={C.textSoft}
                />

                {modelo === 'MMS' && (
                    <>
                        <Text style={st.inputLabel}>Número de servidores (S) — cajas abiertas</Text>
                        <TextInput
                            style={st.input}
                            keyboardType="numeric"
                            value={serv}
                            onChangeText={setServ}
                            placeholder="ej. 2"
                            placeholderTextColor={C.textSoft}
                        />
                    </>
                )}

                <Boton label="Calcular parámetros" onPress={calcular} />
            </View>

            {resultado && (() => {
                const { color: rhoColor, bg: rhoBg } = estadoRho(resultado.rho);
                return (
                    <>
                        <Divisor label={`Resultados · ${resultado.tipo}`} />

                        <MetricaCard
                            emoji="📊"
                            titulo="Utilización del sistema (ρ)"
                            formula={resultado.ecuaciones.rho}
                            valor={`${resultado.rho}%`}
                            interpretacion={resultado.interpretaciones.rho}
                            valorColor={rhoColor}
                        />

                        <P0Card valor={resultado.P0} formula={resultado.ecuaciones.P0} />

                        <MetricaCard
                            emoji="👥"
                            titulo="Clientes en el sistema (L)"
                            formula={resultado.ecuaciones.L}
                            valor={`${resultado.L} pers.`}
                            interpretacion={resultado.interpretaciones.L}
                        />

                        <MetricaCard
                            emoji="🧍"
                            titulo="Clientes en la fila (Lq)"
                            formula={resultado.ecuaciones.Lq}
                            valor={`${resultado.Lq} pers.`}
                            interpretacion={resultado.interpretaciones.Lq}
                        />

                        <MetricaCard
                            emoji="⏱️"
                            titulo="Tiempo total en cafetería (W)"
                            formula={resultado.ecuaciones.W}
                            valor={`${resultado.W} min`}
                            interpretacion={resultado.interpretaciones.W}
                        />

                        <MetricaCard
                            emoji="⌛"
                            titulo="Tiempo de espera en fila (Wq)"
                            formula={resultado.ecuaciones.Wq}
                            valor={`${resultado.Wq} min`}
                            interpretacion={resultado.interpretaciones.Wq}
                        />

                        <Boton
                            label={loading ? '⏳  Generando PDF...' : 'Descargar informe de resultados (PDF)'}
                            bgColor={C.primary}
                            onPress={pdfResultados}
                            disabled={loading}
                        />
                    </>
                );
            })()}

            <View style={{ height: 32 }} />
        </ScrollView>
    );

    return (
        <View style={st.root}>
            <StatusBar barStyle="light-content" backgroundColor={C.navy} />

            {/* Header */}
            <View style={st.header}>
                <View style={st.logoRow}>
                    <View style={st.logoDot}>
                        <Text style={st.logoEmoji}>🌯</Text>
                    </View>
                    <View>
                        <Text style={st.logoTitle}>El Toque</Text>
                        <Text style={st.logoSub}>Simulador de Teoría de Colas</Text>
                    </View>
                </View>
            </View>

            <TabBar tab={tab} setTab={setTab} />

            <View style={st.body}>
                {tab === 'experimento' ? pantExperimento() : pantCalculadora()}
            </View>
        </View>
    );
}

const st = StyleSheet.create({
    root:   { flex: 1, backgroundColor: C.bg },
    body:   { flex: 1 },
    scroll: { padding: 16, paddingBottom: 32 },

    // Header
    header:    { backgroundColor: C.navy, paddingTop: 52, paddingBottom: 0, paddingHorizontal: 20 },
    logoRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 16 },
    logoDot:   { width: 38, height: 38, backgroundColor: C.primary, borderRadius: 10,
                 alignItems: 'center', justifyContent: 'center' },
    logoEmoji: { fontSize: 20 },
    logoTitle: { fontSize: 18, fontWeight: '700', color: '#fff', letterSpacing: -0.2 },
    logoSub:   { fontSize: 11, color: C.accent, marginTop: 1 },

    // Tabs
    tabBar:       { flexDirection: 'row', backgroundColor: C.navy, paddingHorizontal: 16 },
    tabBtn:       { flex: 1, paddingVertical: 11, alignItems: 'center',
                    borderBottomWidth: 2.5, borderBottomColor: 'transparent' },
    tabBtnActivo: { borderBottomColor: C.accent },
    tabTxt:       { fontSize: 13, fontWeight: '500', color: '#7BAFC8' },
    tabTxtActivo: { color: '#fff', fontWeight: '700' },

    // Hero
    hero:         { backgroundColor: C.navy, borderRadius: 16, padding: 22, marginBottom: 14 },
    heroBadge:    { backgroundColor: 'rgba(168,212,230,0.18)', borderWidth: 1,
                    borderColor: 'rgba(168,212,230,0.3)', borderRadius: 20,
                    alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10 },
    heroBadgeTxt: { fontSize: 10, color: C.accent, fontWeight: '600' },
    heroTitle:    { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 6 },
    heroSub:      { fontSize: 12, color: '#7BAFC8', lineHeight: 18 },

    // Stat grid
    statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
    statCard: { width: CARD_W, backgroundColor: C.surface, borderRadius: 12, padding: 14,
                borderTopWidth: 3, borderTopColor: C.primary,
                borderWidth: 0.5, borderColor: C.border },
    statVal:  { fontSize: 22, fontWeight: '700', color: C.navy, marginBottom: 4 },
    statLabel:{ fontSize: 11, color: C.textSoft, fontWeight: '600' },
    statUnit: { fontSize: 10, color: C.textSoft, marginTop: 1 },

    // Cards
    card:      { backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 12,
                 borderWidth: 0.5, borderColor: C.border },
    cardTitle: { fontSize: 13, fontWeight: '700', color: C.textDark,
                 textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },

    // Texto
    parr: { fontSize: 13, color: C.textMid, lineHeight: 20, marginBottom: 10 },
    bold: { fontWeight: '700', color: C.textDark },

    // Nota
    notaBox: { backgroundColor: '#EAF2F8', borderRadius: 10, padding: 12, marginTop: 4 },
    notaTxt: { fontSize: 11, color: C.primary, lineHeight: 17 },

    // Inputs
    inputLabel: { fontSize: 10, fontWeight: '700', color: C.textSoft, marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: 0.5 },
    input:      { backgroundColor: C.surfaceSoft, borderWidth: 1, borderColor: C.border,
                  borderRadius: 10, padding: 12, fontSize: 15,
                  color: C.textDark, fontWeight: '500', marginBottom: 14 },

    // Botón
    btn:    { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
    btnOff: { opacity: 0.5 },
    btnTxt: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: 0.2 },
});