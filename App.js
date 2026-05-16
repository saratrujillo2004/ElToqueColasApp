// App.js
import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

// IMPORTACIONES DE NUESTRAS CARPETAS PROPIAS
import { calcularModeloMM1, calcularModeloMMS } from './src/math/logicacolas';
import { obtenerPlantillaHTML } from './src/reports/plantillapdf';
// SE ACTUALIZÓ ESTA IMPORTACIÓN PARA INCLUIR FilaResultadoP0
import { SelectorModelo, FilaResultado, FilaResultadoP0 } from './src/components/interfaz';

export default function App() {
  const [lambda, setLambda] = useState('45');
  const [mu, setMu] = useState('60');
  const [servidores, setServidores] = useState('2');
  const [modelo, setModelo] = useState('MM1');
  const [resultados, setResultados] = useState(null);

  const procesarCalculos = () => {
    const l = parseFloat(lambda);
    const m = parseFloat(mu);
    const s = parseInt(servidores);

    if (isNaN(l) || isNaN(m) || l <= 0 || m <= 0) {
      Alert.alert("Campos Inválidos", "Por favor ingresa números válidos mayores a 0.");
      return;
    }

    if (modelo === 'MM1') {
      if (l >= m) {
        Alert.alert("Sistema Colapsado", "La tasa de servicio (μ) debe ser estrictamente mayor que la de llegada (λ).");
        return;
      }
      setResultados(calcularModeloMM1(l, m));
    } else {
      if (isNaN(s) || s < 1) {
        Alert.alert("Error de Entrada", "El número de servidores (S) debe ser igual o mayor a 1.");
        return;
      }
      if (l >= s * m) {
        Alert.alert("Sistema Colapsado", "La capacidad total (S * μ) debe ser mayor que la llegada (λ).");
        return;
      }
      setResultados(calcularModeloMMS(l, m, s));
    }
  };

  const ejecutarDescargaPDF = async () => {
    if (!resultados) return;
    try {
      const html = obtenerPlantillaHTML(lambda, mu, servidores, modelo, resultados);
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert("Error", "Error al procesar el archivo PDF o al compartir.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.tituloHeader}>Simulador "El Toque"</Text>
      
      <SelectorModelo modelo={modelo} setModelo={setModelo} alCambiar={() => setResultados(null)} />

      {/* Tarjeta de Entrada de Datos */}
      <View style={styles.cardInput}>
        <Text style={styles.label}>Tasa de Llegada (λ) [Estudiantes/Hora]:</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={lambda} onChangeText={setLambda} />

        <Text style={styles.label}>Tasa de Servicio (μ) [Capacidad por caja/Hora]:</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={mu} onChangeText={setMu} />

        {modelo === 'MMS' && (
          <>
            <Text style={styles.label}>Número de Servidores / Cajas Abiertas (S):</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={servidores} onChangeText={setServidores} />
          </>
        )}

        <TouchableOpacity style={styles.botonCalcular} onPress={procesarCalculos}>
          <Text style={styles.botonTexto}>Estimar Parámetros del Sistema</Text>
        </TouchableOpacity>
      </View>

      {/* Tarjeta de Resultados */}
      {resultados && (
        <View style={styles.cardResultados}>
          <Text style={styles.subtitulo}>Métricas Estimadas ({resultados.tipo}):</Text>
          
          <FilaResultado titulo="• Uso del sistema (ρ)" valor={`${resultados.rho}%`} formula={resultados.ecuaciones.rho} />
          
          {/* ✨ SE AGREGÓ LA FILA DE P0 AQUÍ ABAJO ✨ */}
          <FilaResultadoP0 valor={resultados.P0} formula={resultados.ecuaciones.P0} />

          <FilaResultado titulo="• Estudiantes en sistema (L)" valor={`${resultados.L} estud.`} formula={resultados.ecuaciones.L} />
          <FilaResultado titulo="• Estudiantes en fila (Lq)" valor={`${resultados.Lq} estud.`} formula={resultados.ecuaciones.Lq} />
          <FilaResultado titulo="• Tiempo total en cafetería (W)" valor={`${resultados.W} min`} formula={resultados.ecuaciones.W} />
          <FilaResultado titulo="• Tiempo de espera en fila (Wq)" valor={`${resultados.Wq} min`} formula={resultados.ecuaciones.Wq} />

          <TouchableOpacity style={styles.botonPdf} onPress={ejecutarDescargaPDF}>
            <Text style={styles.botonTexto}>Generar Informe PDF Automático</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60, backgroundColor: '#f1f5f9', flexGrow: 1 },
  tituloHeader: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', color: '#1e293b', marginBottom: 25 },
  subtitulo: { fontSize: 18, fontWeight: '700', color: '#1e293b', marginBottom: 15 },
  cardInput: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 25 },
  cardResultados: { backgroundColor: '#fff', padding: 20, borderRadius: 12, borderLeftWidth: 6, borderLeftColor: '#10b981', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 4, marginBottom: 25 },
  label: { fontSize: 13, fontWeight: '700', color: '#475569', marginBottom: 6 },
  input: { borderBottomWidth: 1.5, borderBottomColor: '#94a3b8', marginBottom: 20, padding: 6, fontSize: 17, color: '#0f172a', fontWeight: '500' },
  botonCalcular: { backgroundColor: '#3498db', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  botonPdf: { backgroundColor: '#10b981', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 25 },
  botonTexto: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});