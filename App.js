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
import {
    SelectorModelo, MetricaCard, P0Card, Divisor, InfoChip, MetodRow, C,
} from './src/components/interfaz';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

// ─── Helper: color del valor rho ─────────────────────────────────────────────
const colorRho = (rho) => {
    const v = parseFloat(rho);
    if (v >= 85) return { color: C.red,   bg: C.redPale };
    if (v >= 60) return { color: C.amber, bg: C.amberPale };
    return { color: C.green, bg: C.greenPale };
};

// ─── Tarjeta de estadística ───────────────────────────────────────────────────
const StatCard = ({ label, valor, unidad, accentColor }) => (
    <View style={[st.statCard, { borderTopColor: accentColor || C.teal }]}>
        <Text style={[st.statVal, { color: accentColor || C.navy }]}>{valor}</Text>
        <Text style={st.statLabel}>{label}</Text>
        {unidad ? <Text style={st.statUnit}>{unidad}</Text> : null}
    </View>
);

// ─── Tab bar ─────────────────────────────────────────────────────────────────
const TabBar = ({ tab, setTab }) => (
    <View style={st.tabBar}>
        {[
            { id: 'experimento', label: '📊  Experimento' },
            { id: 'calculadora', label: '⚙️  Calculadora' },
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

// ─── Botón principal ──────────────────────────────────────────────────────────
const Boton = ({ label, onPress, color, disabled }) => (
    <TouchableOpacity
        activeOpacity={0.82}
        style={[st.btn, { backgroundColor: color || C.navyMid }, disabled && st.btnDisabled]}
        onPress={onPress}
        disabled={!!disabled}
    >
        <Text style={st.btnTxt}>{label}</Text>
    </TouchableOpacity>
);

// ─── App principal ────────────────────────────────────────────────────────────
export default function App() {
    const [tab, setTab]           = useState('experimento');
    const [lambda, setLambda]     = useState('50');
    const [mu, setMu]             = useState('60');
    const [servidores, setServ]   = useState('2');
    const [modelo, setModelo]     = useState('MM1');
    const [resultados, setRes]    = useState(null);
    const [pdfLoading, setPdf]    = useState(false);

    // ── Calcular ──────────────────────────────────────────────────────────────
    const calcular = () => {
        const l = parseFloat(lambda);
        const m = parseFloat(mu);
        const s = parseInt(servidores);

        if (isNaN(l) || isNaN(m) || l <= 0 || m <= 0) {
            Alert.alert('Datos inválidos', 'Por favor ingresa valores numéricos positivos.');
            return;
        }

        if (modelo === 'MM1') {
            // M/M/1 necesita estrictamente λ < μ
            if (l >= m) {
                Alert.alert(
                    'Sistema inestable',
                    'Para M/M/1 la tasa de servicio (μ) debe ser MAYOR que la de llegada (λ).\n\nIntenta aumentar μ o reducir λ, o usa M/M/S con varios servidores.'
                );
                return;
            }
            setRes(calcularModeloMM1(l, m));
        } else {
            // M/M/S
            if (isNaN(s) || s < 1) {
                Alert.alert('Error', 'El número de servidores (S) debe ser al menos 1.');
                return;
            }
            if (l >= s * m) {
                Alert.alert(
                    'Sistema inestable',
                    `La demanda (λ=${l}) supera la capacidad total (S×μ=${s * m}).\n\nAumenta el número de servidores o reduce λ.`
                );
                return;
            }
            setRes(calcularModeloMMS(l, m, s));
        }
    };

    // ── PDF resultados ────────────────────────────────────────────────────────
    const pdfResultados = async () => {
        if (!resultados) return;
        setPdf(true);
        try {
            const html = obtenerPlantillaHTML(lambda, mu, servidores, modelo, resultados);
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Informe de Resultados' });
        } catch (e) {
            Alert.alert('Error', 'No se pudo generar el PDF. Inténtalo de nuevo.');
        } finally {
            setPdf(false);
        }
    };

    // ── PDF experimento ───────────────────────────────────────────────────────
    const pdfExperimento = async () => {
        setPdf(true);
        try {
            const html = obtenerPlantillaExperimentoHTML(DATOS_CAMPO);
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Análisis de Datos de Campo' });
        } catch (e) {
            Alert.alert('Error', 'No se pudo generar el PDF. Inténtalo de nuevo.');
        } finally {
            setPdf(false);
        }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // TAB: EXPERIMENTO
    // ─────────────────────────────────────────────────────────────────────────
    const pantExperimento = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

            {/* Hero */}
            <View style={st.hero}>
                <Text style={st.heroEmoji}>☕</Text>
                <Text style={st.heroTitle}>Cafetería "El Toque"</Text>
                <Text style={st.heroSub}>
                    Modelamiento del flujo de atención en hora pico universitaria · Teoría de Colas
                </Text>
            </View>

            {/* Contexto */}
            <View style={st.card}>
                <Text style={st.cardTitle}>🔬  Contexto del Estudio</Text>
                <Text style={st.parr}>
                    Se analizó el comportamiento de la cola en la cafetería universitaria durante la hora
                    pico (11:30 am – 1:00 pm), periodo de máxima demanda estudiantil. La cafetería opera
                    con <Text style={st.bold}>1 a 2 cajas activas</Text> según el turno y atiende desde
                    bebidas rápidas hasta platos del día, generando alta variabilidad en el servicio.
                </Text>
            </View>

            {/* Metodología */}
            <View style={st.card}>
                <Text style={st.cardTitle}>📋  Metodología</Text>
                <MetodRow emoji="🎯" titulo="Método de recolección"
                    texto="Observación directa en campo. Dos observadores registraron tiempos simultáneamente para evitar sesgos." />
                <MetodRow emoji="👥" titulo="Tamaño de muestra"
                    texto="46 usuarios observados consecutivamente durante la hora pico. Muestra representativa de una sesión típica de alta demanda." />
                <MetodRow emoji="⏱️" titulo="Variables medidas"
                    texto="Tiempo de espera en fila y tiempo de atención en caja, en segundos, por cada individuo." />
                <MetodRow emoji="📐" titulo="Supuestos del modelo"
                    texto="Llegadas Poisson, servicio exponencial (M/M/1 o M/M/S), disciplina FIFO, capacidad ilimitada." />
            </View>

            {/* Estadísticas */}
            <View style={st.card}>
                <Text style={st.cardTitle}>📈  Estadísticas del Levantamiento</Text>
                <View style={st.statGrid}>
                    <StatCard label="Observaciones" valor="46"    unidad="usuarios"       accentColor={C.teal}     />
                    <StatCard label="Espera promedio" valor="2.16" unidad="min en fila"   accentColor={C.navyMid}  />
                    <StatCard label="Atención prom." valor="1.36"  unidad="min por caja"  accentColor={C.tealLight} />
                    <StatCard label="μ estimada"      valor="44.2" unidad="clientes/h"    accentColor={C.green}    />
                    <StatCard label="Máx. espera"     valor="12.0" unidad="min (obs.)"    accentColor={C.amber}    />
                    <StatCard label="W total prom."   valor="3.52" unidad="min en sist."  accentColor={C.navy}     />
                </View>
            </View>

            {/* Valores recomendados */}
            <View style={st.card}>
                <Text style={st.cardTitle}>💡  Valores Recomendados para la Calculadora</Text>
                <Text style={st.parr}>
                    Basados en el levantamiento de campo, estos valores replican las condiciones reales observadas:
                </Text>
                <InfoChip etiqueta="λ · Tasa de llegada" valor="50 clientes / hora" />
                <InfoChip etiqueta="μ · Tasa de servicio por caja" valor="60 clientes / hora" />
                <InfoChip etiqueta="S · Servidores (para M/M/S)" valor="2 cajas abiertas" />
                <View style={st.notaBox}>
                    <Text style={st.notaTxt}>
                        ℹ️  Con λ=50, μ=60 y S=2 el modelo M/M/S da ρ ≈ 41.7% — sistema estable con esperas bajas.
                        Con S=1 y μ=60 el sistema M/M/1 da ρ ≈ 83% — esperas altas, refleja la presión real.
                    </Text>
                </View>
            </View>

            {/* Botón PDF experimento */}
            <Boton
                label={pdfLoading ? '⏳  Generando PDF...' : '📥  Descargar Análisis de Datos (PDF)'}
                color={C.teal}
                onPress={pdfExperimento}
                disabled={pdfLoading}
            />
            <View style={{ height: 32 }} />
        </ScrollView>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // TAB: CALCULADORA
    // ─────────────────────────────────────────────────────────────────────────
    const pantCalculadora = () => (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.scroll}>

            {/* Selector de modelo */}
            <View style={st.card}>
                <Text style={st.cardTitle}>⚙️  Selecciona el Modelo</Text>
                <SelectorModelo
                    modelo={modelo}
                    setModelo={setModelo}
                    alCambiar={() => setRes(null)}
                />

                {/* Inputs */}
                <Text style={st.inputLabel}>Tasa de Llegada (λ) — estudiantes / hora</Text>
                <TextInput
                    style={st.input}
                    keyboardType="numeric"
                    value={lambda}
                    onChangeText={setLambda}
                    placeholder="ej. 50"
                    placeholderTextColor={C.textSoft}
                />

                <Text style={st.inputLabel}>Tasa de Servicio (μ) — capacidad por caja / hora</Text>
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
                        <Text style={st.inputLabel}>Número de Servidores (S) — cajas abiertas</Text>
                        <TextInput
                            style={st.input}
                            keyboardType="numeric"
                            value={servidores}
                            onChangeText={setServ}
                            placeholder="ej. 2"
                            placeholderTextColor={C.textSoft}
                        />
                    </>
                )}

                <Boton label="▶  Calcular Parámetros" onPress={calcular} />
            </View>

            {/* Resultados */}
            {resultados && (() => {
                const { color: rhoC, bg: rhoBg } = colorRho(resultados.rho);
                return (
                    <View>
                        <Divisor label={`Resultados · ${resultados.tipo}`} />

                        <MetricaCard
                            emoji="📊"
                            titulo="Utilización del sistema (ρ)"
                            valor={`${resultados.rho}%`}
                            formula={resultados.ecuaciones.rho}
                            interpretacion={resultados.interpretaciones.rho}
                            estadoBg={rhoBg}
                            estadoColor={rhoC}
                        />

                        <P0Card valor={resultados.P0} formula={resultados.ecuaciones.P0} />

                        <MetricaCard
                            emoji="👥"
                            titulo="Clientes en el sistema (L)"
                            valor={`${resultados.L} pers.`}
                            formula={resultados.ecuaciones.L}
                            interpretacion={resultados.interpretaciones.L}
                        />

                        <MetricaCard
                            emoji="🧍"
                            titulo="Clientes en la fila (Lq)"
                            valor={`${resultados.Lq} pers.`}
                            formula={resultados.ecuaciones.Lq}
                            interpretacion={resultados.interpretaciones.Lq}
                        />

                        <MetricaCard
                            emoji="⏱️"
                            titulo="Tiempo total en cafetería (W)"
                            valor={`${resultados.W} min`}
                            formula={resultados.ecuaciones.W}
                            interpretacion={resultados.interpretaciones.W}
                        />

                        <MetricaCard
                            emoji="⌛"
                            titulo="Tiempo de espera en fila (Wq)"
                            valor={`${resultados.Wq} min`}
                            formula={resultados.ecuaciones.Wq}
                            interpretacion={resultados.interpretaciones.Wq}
                        />

                        <Boton
                            label={pdfLoading ? '⏳  Generando PDF...' : '📄  Descargar Informe de Resultados (PDF)'}
                            color={C.teal}
                            onPress={pdfResultados}
                            disabled={pdfLoading}
                        />
                    </View>
                );
            })()}

            <View style={{ height: 32 }} />
        </ScrollView>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <View style={st.root}>
            <StatusBar barStyle="light-content" backgroundColor={C.navy} />

            {/* Header */}
            <View style={st.header}>
                <Text style={st.headerTitle}>☕  El Toque</Text>
                <Text style={st.headerSub}>Simulador de Teoría de Colas</Text>
            </View>

            <TabBar tab={tab} setTab={setTab} />

            <View style={st.body}>
                {tab === 'experimento' ? pantExperimento() : pantCalculadora()}
            </View>
        </View>
    );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
    root:   { flex:1, backgroundColor:C.bg },
    body:   { flex:1 },
    scroll: { padding:16, paddingBottom:32 },

    // Header
    header: { backgroundColor:C.navy, paddingTop:52, paddingBottom:16, paddingHorizontal:20 },
    headerTitle: { fontSize:24, fontWeight:'800', color:'#fff', letterSpacing:-0.3 },
    headerSub:   { fontSize:13, color:'#7BAFC8', marginTop:3 },

    // Tabs
    tabBar:       { flexDirection:'row', backgroundColor:C.navy, paddingHorizontal:12, paddingBottom:2 },
    tabBtn:       { flex:1, paddingVertical:12, alignItems:'center',
                    borderBottomWidth:3, borderBottomColor:'transparent' },
    tabBtnActivo: { borderBottomColor:C.tealLight },
    tabTxt:       { fontSize:13, fontWeight:'600', color:'#7BAFC8' },
    tabTxtActivo: { color:'#fff', fontWeight:'700' },

    // Cards
    card: { backgroundColor:C.white, borderRadius:16, padding:18, marginBottom:14,
            shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8, elevation:3 },
    cardTitle: { fontSize:15, fontWeight:'700', color:C.textDark, marginBottom:14 },

    // Hero
    hero: { backgroundColor:C.navy, borderRadius:18, padding:24, marginBottom:14, alignItems:'center' },
    heroEmoji: { fontSize:40, marginBottom:10 },
    heroTitle: { fontSize:22, fontWeight:'800', color:'#fff', textAlign:'center', marginBottom:6 },
    heroSub:   { fontSize:13, color:'#8EC8D8', textAlign:'center', lineHeight:20 },

    // Texto
    parr: { fontSize:13, color:C.textMid, lineHeight:20, marginBottom:10 },
    bold: { fontWeight:'700', color:C.textDark },

    // Stat grid
    statGrid: { flexDirection:'row', flexWrap:'wrap', gap:10, marginTop:4 },
    statCard: { width:CARD_W, backgroundColor:C.sky, borderRadius:12, padding:12,
                borderTopWidth:3, borderTopColor:C.teal },
    statVal:  { fontSize:22, fontWeight:'800', color:C.navy, marginBottom:4 },
    statLabel:{ fontSize:11, color:C.textSoft, fontWeight:'600' },
    statUnit: { fontSize:10, color:C.textSoft, marginTop:2 },

    // Nota
    notaBox: { backgroundColor:C.tealPale, borderRadius:10, padding:12, marginTop:6 },
    notaTxt: { fontSize:12, color:C.tealLight === C.tealLight ? C.navyMid : C.textMid, lineHeight:18 },

    // Inputs
    inputLabel: { fontSize:12, fontWeight:'700', color:C.textMid, marginBottom:6, marginTop:4 },
    input: {
        borderWidth:1.5, borderColor:C.border, borderRadius:10,
        padding:12, fontSize:16, color:C.textDark, fontWeight:'500',
        marginBottom:14, backgroundColor:C.sky,
    },

    // Botón
    btn:        { padding:15, borderRadius:12, alignItems:'center', marginTop:6 },
    btnDisabled:{ opacity:0.55 },
    btnTxt:     { color:'#fff', fontWeight:'700', fontSize:15, letterSpacing:0.2 },
});