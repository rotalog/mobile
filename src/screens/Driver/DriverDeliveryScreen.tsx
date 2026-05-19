import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import SignatureScreen from 'react-native-signature-canvas';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

// ── Component ─────────────────────────────────────────────────────────────────
export function DriverDeliveryScreen({ navigation, route }: { navigation: any; route: any }) {
  const ponto = route?.params?.ponto ?? { id: '1', nome: 'Cliente', documento: '' };
  const routeId = route?.params?.routeId ?? ponto.routeId;

  const [fotoUri, setFotoUri]         = useState<string | null>(null);
  const [assinatura, setAssinatura]   = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);

  // Captura foto com câmera
  const handleCapturarFoto = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (permissao.status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de acesso à câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      setFotoUri(result.assets[0].uri);
    }
  };

  // Recebe assinatura do canvas
  const handleAssinatura = (sig: string) => {
    setAssinatura(sig);
  };

  // Finaliza entrega
  const handleFinalizar = async () => {
    if (!fotoUri) {
      Alert.alert('Atenção', 'Capture a foto do comprovante antes de finalizar.');
      return;
    }
    setLoading(true);
    try {
      // POST /api/v1/delivery-points/{id}/proof
      const formData = new FormData();
      formData.append('photo', {
        uri:  fotoUri,
        name: 'comprovante.jpg',
        type: 'image/jpeg',
      } as any);
      if (assinatura) {
        formData.append('signature', assinatura);
      }
      await api.post(`/api/v1/delivery-points/${ponto.id}/proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigation.goBack();
    } catch {
      Alert.alert('Erro', 'Não foi possível registrar a entrega. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <View style={s.container}>
      <TopBar title="Confirmação de Entrega" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={s.list}>

        {/* Foto do comprovante */}
        <Text style={s.sectionLabel}>— COMPROVANTE DE ENTREGA</Text>
        <TouchableOpacity
          style={[s.fotoBox, fotoUri ? s.fotoBoxDone : undefined]}
          onPress={handleCapturarFoto}
          activeOpacity={0.8}
        >
          {fotoUri ? (
            <Image source={{ uri: fotoUri }} style={s.fotoPreview} resizeMode="cover" />
          ) : (
            <>
              <Text style={{ fontSize: 40 }}>📷</Text>
              <Text style={s.fotoTxt}>Capturar Foto do Comprovante</Text>
              <Text style={s.fotoSub}>Certifique-se de que a imagem esteja nítida</Text>
            </>
          )}
        </TouchableOpacity>
        {fotoUri && (
          <TouchableOpacity onPress={handleCapturarFoto} style={s.refazerBtn}>
            <Text style={s.refazerTxt}>Refazer foto</Text>
          </TouchableOpacity>
        )}

        {/* Assinatura digital */}
        <Text style={s.sectionLabel}>— ASSINATURA DIGITAL</Text>
        <View style={s.assinaturaBox}>
          {assinatura ? (
            <View style={s.assinaturaFeita}>
              <Text style={{ fontSize: 32 }}>✅</Text>
              <Text style={s.assinaturaTxt}>Assinatura capturada</Text>
              <TouchableOpacity onPress={() => setAssinatura(null)}>
                <Text style={s.refazerTxt}>Limpar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <SignatureScreen
              onOK={handleAssinatura}
              onEmpty={() => {}}
              descriptionText="Assine aqui com o dedo"
              clearText="Limpar"
              confirmText="Confirmar"
              webStyle={signatureStyle}
              style={{ height: 200 }}
            />
          )}
        </View>

        {/* Dados do recebedor */}
        <Text style={s.sectionLabel}>— RECEBEDOR</Text>
        <View style={s.card}>
          <View style={s.recebedorRow}>
            <Text style={{ fontSize: 20 }}>👤</Text>
            <View>
              <Text style={s.recebedorNome}>{ponto.nome}</Text>
              <Text style={s.recebedorDoc}>{ponto.documento ?? 'Documento não informado'}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Rodapé */}
      <View style={s.footer}>
        <Button
          label="REGISTRAR PROBLEMA"
          onPress={() => navigation.navigate('DriverOccurrence', { ponto, routeId })}
          variant="danger"
          full
        />
        <Button
          label="FINALIZAR ENTREGA"
          onPress={handleFinalizar}
          loading={loading}
          full
        />
      </View>
    </View>
  );
}

// ── Signature style ───────────────────────────────────────────────────────────
const signatureStyle = `
  .m-signature-pad { background: #181C1F; border: 1px solid #1E2428; border-radius: 12px; }
  .m-signature-pad--body { background: #181C1F; }
  .m-signature-pad--footer { background: #111416; }
  .m-signature-pad--footer .button { color: #00E676; }
  body { background: #181C1F; }
`;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },
  list:            { padding: Spacing.xl, gap: 12 },
  sectionLabel:    { fontSize: FontSize.xs, fontWeight: '700', color: Colors.green, letterSpacing: 1.2 },

  fotoBox:         { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', padding: Spacing.xxl, gap: 8, minHeight: 160 },
  fotoBoxDone:     { borderStyle: 'solid', borderColor: Colors.green, padding: 0, overflow: 'hidden' },
  fotoPreview:     { width: '100%', height: 200, borderRadius: Radius.lg },
  fotoTxt:         { color: Colors.text, fontWeight: '700', fontSize: FontSize.base, textAlign: 'center' },
  fotoSub:         { color: Colors.muted, fontSize: FontSize.xs, textAlign: 'center' },
  refazerBtn:      { alignSelf: 'center', marginTop: 4 },
  refazerTxt:      { color: Colors.green, fontSize: FontSize.xs, fontWeight: '700' },

  assinaturaBox:   { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden', minHeight: 200 },
  assinaturaFeita: { height: 200, alignItems: 'center', justifyContent: 'center', gap: 8 },
  assinaturaTxt:   { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },

  card:            { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  recebedorRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  recebedorNome:   { color: Colors.text, fontWeight: '700', fontSize: FontSize.base },
  recebedorDoc:    { color: Colors.muted, fontSize: FontSize.sm },

  footer:          { padding: Spacing.xl, gap: 10, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
});
