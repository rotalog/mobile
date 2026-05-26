import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, StyleSheet, Alert,
} from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Avatar, Badge } from '../../components/ui/index';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ColorPalette, FontSize, Radius, Spacing } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

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
  const { colors } = useTheme();
  const s = React.useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);
  const [nome, setNome] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [telefone, setTelefone] = useState(user?.telefone ?? '');

  const [enderecos, setEnderecos] = useState<Endereco[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrRua, setAddrRua] = useState('');
  const [addrBairro, setAddrBairro] = useState('');
  const [addrCidade, setAddrCidade] = useState('Manaus - AM');

  const primeiraLetra = (nome || user?.name || 'U').charAt(0).toUpperCase();

  const handleSavePerfil = () => {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Informe pelo menos nome e e-mail.');
      return;
    }

    setNome(nome.trim());
    setEmail(email.trim());
    setTelefone(telefone.trim());
    setEditing(false);
  };

  const resetAddressForm = () => {
    setEditingAddressId(null);
    setAddrLabel('');
    setAddrRua('');
    setAddrBairro('');
    setAddrCidade('Manaus - AM');
  };

  const openNewAddress = () => {
    resetAddressForm();
    setModalVisible(true);
  };

  const openEditAddress = (endereco: Endereco) => {
    setEditingAddressId(endereco.id);
    setAddrLabel(endereco.label);
    setAddrRua(endereco.rua);
    setAddrBairro(endereco.bairro);
    setAddrCidade(endereco.cidade);
    setModalVisible(true);
  };

  const closeAddressModal = () => {
    setModalVisible(false);
    resetAddressForm();
  };

  const handleSaveEndereco = () => {
    if (!addrLabel.trim() || !addrRua.trim() || !addrBairro.trim()) {
      Alert.alert('Atenção', 'Preencha apelido, rua e bairro.');
      return;
    }

    const endereco: Endereco = {
      id: editingAddressId ?? Date.now(),
      label: addrLabel.trim(),
      rua: addrRua.trim(),
      bairro: addrBairro.trim(),
      cidade: addrCidade.trim() || 'Manaus - AM',
      principal: enderecos.length === 0 || enderecos.some(e => e.id === editingAddressId && e.principal),
    };

    setEnderecos(prev => {
      if (editingAddressId) {
        return prev.map(e => e.id === editingAddressId ? { ...endereco, principal: e.principal } : e);
      }
      return [...prev, endereco];
    });
    closeAddressModal();
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
          <TouchableOpacity
            onPress={() => editing ? handleSavePerfil() : setEditing(true)}
            style={s.editBtn}
          >
            <Text style={s.editBtnTxt}>{editing ? 'Salvar' : 'Editar'}</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={s.list}>
        <View style={s.avatarWrap}>
          <Avatar size={80} letter={primeiraLetra} />
          <Text style={s.name}>{nome || user?.name || 'Usuário'}</Text>
          <Text style={s.since}>{user?.role === 'SUPPLIER' ? 'Fornecedor' : 'Comprador'}</Text>
        </View>

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
            {([['Nome', nome || user?.name || '-'], ['E-mail', email || user?.email || '-'], ['Telefone', telefone || user?.telefone || '-']] as [string, string][]).map(([k, v]) => (
              <View key={k} style={s.dataRow}>
                <Text style={s.dataKey}>{k}</Text>
                <Text style={s.dataVal}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={s.addrHeader}>
          <Text style={s.section}>ENDEREÇOS</Text>
          <TouchableOpacity style={s.addBtn} onPress={openNewAddress}>
            <Text style={s.addBtnText}>+ Novo</Text>
          </TouchableOpacity>
        </View>

        {enderecos.length === 0 && (
          <Text style={s.emptyAddress}>Nenhum endereço cadastrado.</Text>
        )}

        {enderecos.map(e => (
          <View key={e.id} style={[s.addrCard, e.principal && s.addrCardPrincipal]}>
            <TouchableOpacity onPress={() => handleSetPrincipal(e.id)} activeOpacity={0.8}>
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
            <TouchableOpacity style={s.addrEditBtn} onPress={() => openEditAddress(e)}>
              <Text style={s.addrEditText}>Editar endereço</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>{editingAddressId ? 'Editar endereço' : 'Novo endereço'}</Text>

            <Text style={s.inputLabel}>Apelido (ex: Casa, Trabalho)</Text>
            <Input value={addrLabel} onChangeText={setAddrLabel} placeholder="Casa" />

            <Text style={s.inputLabel}>Rua e número</Text>
            <Input value={addrRua} onChangeText={setAddrRua} placeholder="R. das Flores, 123" />

            <Text style={s.inputLabel}>Bairro</Text>
            <Input value={addrBairro} onChangeText={setAddrBairro} placeholder="Centro" />

            <Text style={s.inputLabel}>Cidade</Text>
            <Input value={addrCidade} onChangeText={setAddrCidade} placeholder="Manaus - AM" />

            <View style={s.modalBtns}>
              <Button label="CANCELAR" onPress={closeAddressModal} variant="ghost" style={{ flex: 1 }} />
              <Button label="SALVAR" onPress={handleSaveEndereco} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ColorPalette) => StyleSheet.create({
  container:         { flex: 1, backgroundColor: colors.bg },
  list:              { padding: Spacing.xl, gap: 10 },

  avatarWrap:        { alignItems: 'center', marginBottom: 8 },
  name:              { color: colors.text, fontWeight: '800', fontSize: FontSize.xl, marginTop: 12 },
  since:             { color: colors.muted, fontSize: FontSize.sm },
  editBtn:           { backgroundColor: `${colors.green}22`, borderWidth: 1, borderColor: `${colors.green}44`, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnTxt:        { color: colors.green, fontWeight: '800', fontSize: FontSize.xs },
  section:           { color: colors.muted, fontSize: FontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  inputLabel:        { color: colors.muted, fontSize: FontSize.xs, fontWeight: '700', marginBottom: 4, marginTop: 4 },
  dataCard:          { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border, gap: 4 },
  dataRow:           { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  dataKey:           { color: colors.muted, fontSize: FontSize.sm },
  dataVal:           { color: colors.text, fontWeight: '600', fontSize: FontSize.sm, flex: 1, textAlign: 'right' },
  addrHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn:            { backgroundColor: colors.green, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  addBtnText:        { color: colors.onPrimary, fontWeight: '800', fontSize: FontSize.xs },
  emptyAddress:      { color: colors.muted, fontSize: FontSize.sm, textAlign: 'center', marginTop: 8 },
  addrCard:          { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: colors.border },
  addrCardPrincipal: { borderColor: colors.green },
  addrTop:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  addrLabel:         { fontWeight: '800', color: colors.text, fontSize: FontSize.base },
  addrRua:           { color: colors.muted, fontSize: FontSize.sm },
  addrSub:           { color: colors.muted, fontSize: FontSize.xs },
  addrAction:        { color: colors.green, fontSize: FontSize.xs, marginTop: 6, fontWeight: '600' },
  addrEditBtn:       { marginTop: 10, alignSelf: 'flex-start' },
  addrEditText:      { color: colors.green, fontSize: FontSize.xs, fontWeight: '800' },
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCard:         { backgroundColor: colors.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.xl, gap: 4 },
  modalTitle:        { color: colors.text, fontWeight: '800', fontSize: FontSize.lg, marginBottom: 8 },
  modalBtns:         { flexDirection: 'row', gap: 12, marginTop: 8 },
});