import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, StyleSheet, Alert,
} from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Avatar, Badge } from '../../components/ui/index';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ENDERECOS } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Endereco {
  id: number;
  label: string;
  rua: string;
  bairro: string;
  cidade: string;
  principal: boolean;
}

// ── Screen ────────────────────────────────────────────────────────────────────
export function ProfileScreen({ navigation }: { navigation: any }) {
  // Dados pessoais
  const { user } = useAuth();
const [editing, setEditing]   = useState(false);
const [nome, setNome]         = useState(user?.name ??'');
const [email, setEmail]       = useState(user?.email ?? '');
const [telefone, setTelefone] = useState(user?.telefone ?? '');
  // Endereços
  const [enderecos, setEnderecos] = useState<Endereco[]>(ENDERECOS);
  const [modalVisible, setModalVisible] = useState(false);
  const [novoLabel, setNovoLabel]   = useState('');
  const [novoRua, setNovoRua]       = useState('');
  const [novoBairro, setNovoBairro] = useState('');
  const [novoCidade, setNovoCidade] = useState('Manaus - AM');

  const handleSavePerfil = () => {
    // TODO: await api.put('/api/v1/users/me', { nome, email, telefone })
    setEditing(false);
    Alert.alert('Sucesso', 'Dados atualizados!');
  };

  const handleAddEndereco = () => {
    if (!novoLabel || !novoRua || !novoBairro) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }
    const novo: Endereco = {
      id: Date.now(),
      label: novoLabel,
      rua: novoRua,
      bairro: novoBairro,
      cidade: novoCidade,
      principal: false,
    };
    // TODO: await api.post('/api/v1/addresses', novo)
    setEnderecos(prev => [...prev, novo]);
    setNovoLabel(''); setNovoRua(''); setNovoBairro(''); setNovoCidade('Manaus - AM');
    setModalVisible(false);
  };

  const handleSetPrincipal = (id: number) => {
    setEnderecos(prev => prev.map(e => ({ ...e, principal: e.id === id })));
  };

  return (
    <View style={s.container}>
      <TopBar
        title="Meu Perfil"
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity onPress={() => editing ? handleSavePerfil() : setEditing(true)} style={s.editBtn}>
            <Text style={s.editBtnTxt}>{editing ? 'Salvar' : 'Editar'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={s.list}>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <Avatar size={80} letter={(user?.name ?? 'U').charAt(0)} />
          <Text style={s.name}>{nome}</Text>
          <Text style={s.since}>Membro desde Jan 2024</Text>
        </View>

        {/* Dados pessoais */}
        <Text style={s.section}>DADOS PESSOAIS</Text>
        {editing ? (
          <View style={s.dataCard}>
            <Text style={s.inputLabel}>Nome</Text>
            <Input value={nome} onChangeText={setNome} placeholder="Seu nome" />
            <Text style={s.inputLabel}>E-mail</Text>
            <Input value={email} onChangeText={setEmail} placeholder="Seu e-mail" keyboardType="email-address" autoCapitalize="none" />
            <Text style={s.inputLabel}>Telefone</Text>
            <Input value={telefone} onChangeText={setTelefone} placeholder="(00) 00000-0000" keyboardType="phone-pad" />
            <Button label="SALVAR ALTERAÇÕES" onPress={handleSavePerfil} full />
          </View>
        ) : (
          <View style={s.dataCard}>
            {([['Nome', nome], ['E-mail', email], ['Telefone', telefone]] as [string, string][]).map(([k, v]) => (
              <View key={k} style={s.dataRow}>
                <Text style={s.dataKey}>{k}</Text>
                <Text style={s.dataVal}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Endereços */}
        <View style={s.addrHeader}>
          <Text style={s.section}>ENDEREÇOS</Text>
          <TouchableOpacity style={s.addBtn} onPress={() => setModalVisible(true)}>
            <Text style={{ color: '#0A0C0E', fontWeight: '800', fontSize: FontSize.xs }}>+ Novo</Text>
          </TouchableOpacity>
        </View>

        {enderecos.map(e => (
          <TouchableOpacity
            key={e.id}
            style={[s.addrCard, e.principal && s.addrCardPrincipal]}
            onPress={() => handleSetPrincipal(e.id)}
            activeOpacity={0.8}
          >
            <View style={s.addrTop}>
              <Text style={s.addrLabel}>{e.label}</Text>
              {e.principal && <Badge label="Principal" />}
            </View>
            <Text style={s.addrRua}>{e.rua}</Text>
            <Text style={s.addrSub}>{e.bairro} · {e.cidade}</Text>
            {!e.principal && (
              <Text style={s.addrAction}>Toque para definir como principal</Text>
            )}
          </TouchableOpacity>
        ))}

      </ScrollView>

      {/* Modal novo endereço */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Novo endereço</Text>

            <Text style={s.inputLabel}>Apelido (ex: Casa, Trabalho)</Text>
            <Input value={novoLabel} onChangeText={setNovoLabel} placeholder="Casa" />

            <Text style={s.inputLabel}>Rua e número</Text>
            <Input value={novoRua} onChangeText={setNovoRua} placeholder="R. das Flores, 123" />

            <Text style={s.inputLabel}>Bairro</Text>
            <Input value={novoBairro} onChangeText={setNovoBairro} placeholder="Centro" />

            <Text style={s.inputLabel}>Cidade</Text>
            <Input value={novoCidade} onChangeText={setNovoCidade} placeholder="Manaus - AM" />

            <View style={s.modalBtns}>
              <Button label="CANCELAR" onPress={() => setModalVisible(false)} variant="ghost" style={{ flex: 1 }} />
              <Button label="SALVAR" onPress={handleAddEndereco} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: Colors.bg },
  list:              { padding: Spacing.xl, gap: 10 },

  avatarWrap:        { alignItems: 'center', marginBottom: 8 },
  name:              { color: Colors.text, fontWeight: '800', fontSize: FontSize.xl, marginTop: 12 },
  since:             { color: Colors.muted, fontSize: FontSize.sm },

  editBtn:           { backgroundColor: `${Colors.green}22`, borderWidth: 1, borderColor: `${Colors.green}44`, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnTxt:        { color: Colors.green, fontWeight: '800', fontSize: FontSize.xs },

  section:           { color: Colors.muted, fontSize: FontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  inputLabel:        { color: Colors.muted, fontSize: FontSize.xs, fontWeight: '700', marginBottom: 4, marginTop: 4 },

  dataCard:          { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  dataRow:           { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dataKey:           { color: Colors.muted, fontSize: FontSize.sm },
  dataVal:           { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },

  addrHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn:            { backgroundColor: Colors.green, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  addrCard:          { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  addrCardPrincipal: { borderColor: Colors.green },
  addrTop:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  addrLabel:         { fontWeight: '800', color: Colors.text, fontSize: FontSize.base },
  addrRua:           { color: Colors.muted, fontSize: FontSize.sm },
  addrSub:           { color: Colors.muted, fontSize: FontSize.xs },
  addrAction:        { color: Colors.green, fontSize: FontSize.xs, marginTop: 6, fontWeight: '600' },

  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:         { backgroundColor: Colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, gap: 4 },
  modalTitle:        { color: Colors.text, fontWeight: '800', fontSize: FontSize.lg, marginBottom: 8 },
  modalBtns:         { flexDirection: 'row', gap: 12, marginTop: 8 },
});