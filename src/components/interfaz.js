// src/components/interfaz.js
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export const SelectorModelo = ({ modelo, setModelo, alCambiar }) => (
    <View style={styles.selectorContainer}>
        <TouchableOpacity
            style={[styles.radioBoton, modelo === 'MM1' && styles.radioBotonActivo]}
            onPress={() => { setModelo('MM1'); alCambiar(); }}
        >
            <Text style={[styles.radioTexto, modelo === 'MM1' && styles.radioTextoActivo]}>Modelo M/M/1</Text>
        </TouchableOpacity>

        <TouchableOpacity
            style={[styles.radioBoton, modelo === 'MMS' && styles.radioBotonActivo]}
            onPress={() => { setModelo('MMS'); alCambiar(); }}
        >
            <Text style={[styles.radioTexto, modelo === 'MMS' && styles.radioTextoActivo]}>Modelo M/M/S</Text>
        </TouchableOpacity>
    </View>
);

// Tu componente original (sigue funcionando igual para L, Lq, W, Wq)
export const FilaResultado = ({ titulo, valor, formula }) => (
    <View style={styles.itemResultado}>
        <Text style={styles.resultadoText}>{titulo}: <Text style={styles.bold}>{valor}</Text></Text>
        <Text style={styles.ecuacionText}>Ecuación: {formula}</Text>
    </View>
);

// ✨ NUEVO COMPONENTE AGREGADO EXCLUSIVO PARA P0 ✨
export const FilaResultadoP0 = ({ valor, formula }) => (
    <View style={[styles.itemResultado, styles.itemP0]}>
        <Text style={styles.resultadoText}>
            Probabilidad de sistema vacío (P₀): <Text style={[styles.bold, styles.textoDestacado]}>{valor}%</Text>
        </Text>
        <Text style={styles.ecuacionText}>Ecuación: {formula}</Text>
    </View>
);

const styles = StyleSheet.create({
    selectorContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    radioBoton: { flex: 1, backgroundColor: '#cbd5e1', padding: 14, alignItems: 'center', borderRadius: 10, marginHorizontal: 5 },
    radioBotonActivo: { backgroundColor: '#3498db' },
    radioTexto: { color: '#475569', fontWeight: 'bold', fontSize: 15 },
    radioTextoActivo: { color: '#fff' },
    itemResultado: { marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
    resultadoText: { fontSize: 16, color: '#334155' },
    ecuacionText: { fontSize: 12, color: '#64748b', fontStyle: 'italic', marginTop: 3 },
    bold: { fontWeight: 'bold', color: '#0f172a' },
    // Estilos nuevos para que el P0 se vea más estético e importante
    itemP0: { backgroundColor: '#f8fafc', padding: 8, borderRadius: 8, borderLeftWidth: 4, borderLeftColor: '#2ecc71' },
    textoDestacado: { color: '#27ae60' }
});