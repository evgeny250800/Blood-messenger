import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, 
  SafeAreaView, Alert, StatusBar, Image, Modal 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

// Тестовая база пользователей для поиска
const GLOBAL_USERS = [
  { name: 'Ivan Blood', username: '@ivan' },
  { name: 'Admin', username: '@admin' },
  { name: 'Dmitry', username: '@dimas' },
];

export default function App() {
  const [screen, setScreen] = useState('loading'); 
  const [tab, setTab] = useState('chats'); 
  const [myProfile, setMyProfile] = useState({ 
    name: '', username: '', phone: '', bio: 'Использую BLOOD', avatar: null 
  });
  const [items, setItems] = useState([]); 
  
  // Состояния для регистрации
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regUser, setRegUser] = useState('');

  // Состояния для поиска контактов
  const [modalVisible, setModalVisible] = useState(false);
  const [searchUser, setSearchUser] = useState('');

  useEffect(() => {
    StatusBar.setHidden(true);
    const loadData = async () => {
      const saved = await AsyncStorage.getItem('blood_v19_save');
      if (saved) {
        setMyProfile(JSON.parse(saved));
        setScreen('main');
      } else {
        setScreen('auth');
      }
    };
    loadData();
  }, []);

  // ФИЛЬТР НОМЕРА (1 плюс в начале)
  const cleanPhone = (t) => {
    let cleaned = t.replace(/[^0-9+]/g, '');
    if (cleaned.includes('+')) {
      const startsWithPlus = cleaned.startsWith('+');
      cleaned = cleaned.replace(/\+/g, '');
      if (startsWithPlus) cleaned = '+' + cleaned;
    }
    return cleaned;
  };

  // СОХРАНЕНИЕ ИЗМЕНЕНИЙ В ПРОФИЛЕ
  const updateProfile = async (field, val) => {
    const updated = { ...myProfile, [field]: val };
    setMyProfile(updated);
    await AsyncStorage.setItem('blood_v19_save', JSON.stringify(updated));
  };

  // ДОБАВЛЕНИЕ КОНТАКТА
  const tryAddContact = () => {
    const formatted = searchUser.startsWith('@') ? searchUser : '@' + searchUser;
    const found = GLOBAL_USERS.find(u => u.username.toLowerCase() === formatted.toLowerCase());

    if (found) {
      const newChat = { id: Date.now(), name: found.name, username: found.username };
      setItems([newChat, ...items]);
      setModalVisible(false);
      setSearchUser('');
    } else {
      Alert.alert("BLOOD", "Пользователь не найден в базе");
    }
  };

  // ЗАВЕРШЕНИЕ РЕГИСТРАЦИИ
  const saveAuth = async () => {
    if (regName && regPhone && regUser) {
      const p = { name: regName, username: regUser, phone: regPhone, bio: 'Использую BLOOD', avatar: null };
      setMyProfile(p);
      await AsyncStorage.setItem('blood_v19_save', JSON.stringify(p));
      setScreen('main');
    } else {
      Alert.alert("Ошибка", "Заполните все поля");
    }
  };

  if (screen === 'loading') return <View style={styles.container} />;

  // --- ЭКРАН РЕГИСТРАЦИИ ---
  if (screen === 'auth') {
    return (
      <View style={styles.container}>
        <View style={styles.centerBox}>
          <Ionicons name="boat" size={80} color="#5288c1" />
          <Text style={styles.logoText}>BLOOD</Text>
          <TextInput style={styles.input} placeholder="Имя" placeholderTextColor="#5e7d95" onChangeText={setRegName} />
          <TextInput style={styles.input} placeholder="@username" placeholderTextColor="#5e7d95" autoCapitalize="none" onChangeText={setRegUser} />
          <TextInput 
            style={styles.input} 
            placeholder="Номер телефона" 
            placeholderTextColor="#5e7d95" 
            keyboardType="phone-pad" 
            value={regPhone} 
            onChangeText={(t) => setRegPhone(cleanPhone(t))} 
          />
          <TouchableOpacity style={styles.btn} onPress={saveAuth}><Text style={styles.btnText}>НАЧАТЬ</Text></TouchableOpacity>
        </View>
      </View>
    );
  }

  // --- ОСНОВНОЕ ПРИЛОЖЕНИЕ ---
  return (
    <SafeAreaView style={styles.container}>
      <View style={{flex: 1}}>
        {tab === 'chats' ? (
          <View style={{flex: 1}}>
            <View style={styles.header}><Text style={styles.headerTitle}>BLOOD</Text></View>
            <ScrollView>
              {items.length === 0 ? (
                <Text style={{color: '#5e7d95', textAlign: 'center', marginTop: 50}}>У вас пока нет чатов</Text>
              ) : (
                items.map(item => (
                  <TouchableOpacity key={item.id} style={styles.chatItem}>
                    <View style={styles.avatarCircle}><Text style={{color: '#fff'}}>{item.name[0]}</Text></View>
                    <View style={{marginLeft: 15}}>
                      <Text style={styles.nameText}>{item.name}</Text>
                      <Text style={{color: '#5e7d95', fontSize: 12}}>{item.username}</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
              <Ionicons name="pencil" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={{flex: 1}}>
            <View style={styles.profileHeader}>
               <View style={styles.avatarLarge}><Ionicons name="person" size={50} color="#fff" /></View>
               <Text style={styles.heroName}>{myProfile.name}</Text>
               <Text style={{color: '#5288c1'}}>{myProfile.username}</Text>
            </View>
            
            <View style={styles.settingsBox}>
              <Text style={styles.label}>ИМЯ</Text>
              <TextInput style={styles.profileInp} value={myProfile.name} onChangeText={(t) => updateProfile('name', t)} />

              <Text style={styles.label}>USERNAME</Text>
              <TextInput style={styles.profileInp} value={myProfile.username} onChangeText={(t) => updateProfile('username', t)} />

              <Text style={styles.label}>НОМЕР ТЕЛЕФОНА</Text>
              <TextInput 
                style={styles.profileInp} 
                keyboardType="phone-pad"
                value={myProfile.phone} 
                onChangeText={(t) => updateProfile('phone', cleanPhone(t))} 
              />

              <Text style={styles.label}>О СЕБЕ</Text>
              <TextInput style={styles.profileInp} value={myProfile.bio} onChangeText={(t) => updateProfile('bio', t)} />
            </View>

            <TouchableOpacity style={{padding: 30, alignItems: 'center'}} onPress={async () => {await AsyncStorage.clear(); setScreen('auth')}}>
              <Text style={{color: '#ec3942', fontWeight: 'bold'}}>ВЫЙТИ ИЗ АККАУНТА</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      {/* НИЖНЕЕ МЕНЮ */}
      <View style={styles.tabBar}>
        <TouchableOpacity onPress={() => setTab('chats')} style={styles.tabItem}>
          <Ionicons name="chatbubbles" size={24} color={tab === 'chats' ? '#5288c1' : '#5e7d95'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTab('profile')} style={styles.tabItem}>
          <Ionicons name="person" size={24} color={tab === 'profile' ? '#5288c1' : '#5e7d95'} />
        </TouchableOpacity>
      </View>

      {/* ОКНО ПОИСКА */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={{color: '#fff', fontSize: 18, marginBottom: 20}}>Поиск пользователя</Text>
            <TextInput style={styles.modalInput} placeholder="@username" placeholderTextColor="#5e7d95" autoCapitalize="none" onChangeText={setSearchUser} />
            <View style={{flexDirection: 'row', justifyContent: 'space-between', width: '100%'}}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtn}><Text style={{color: '#5e7d95'}}>ОТМЕНА</Text></TouchableOpacity>
              <TouchableOpacity onPress={tryAddContact} style={[styles.modalBtn, {backgroundColor: '#5288c1'}]}><Text style={{color: '#fff', fontWeight: 'bold'}}>НАЙТИ</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0e1621' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  logoText: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  input: { width: '100%', backgroundColor: '#17212b', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 12 },
  btn: { backgroundColor: '#5288c1', width: '100%', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' },
  header: { height: 60, paddingHorizontal: 20, justifyContent: 'center', backgroundColor: '#17212b' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  chatItem: { flexDirection: 'row', padding: 15, alignItems: 'center' },
  avatarCircle: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#2b5278', justifyContent: 'center', alignItems: 'center' },
  nameText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: '#5288c1', justifyContent: 'center', alignItems: 'center' },
  tabBar: { height: 60, flexDirection: 'row', backgroundColor: '#17212b', borderTopWidth: 1, borderTopColor: '#000' },
  tabItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileHeader: { alignItems: 'center', padding: 30, backgroundColor: '#17212b' },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2b5278', justifyContent: 'center', alignItems: 'center' },
  heroName: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 10 },
  settingsBox: { padding: 20 },
  label: { color: '#5288c1', fontSize: 12, marginTop: 15 },
  profileInp: { color: '#fff', fontSize: 16, borderBottomWidth: 1, borderBottomColor: '#17212b', paddingVertical: 5 },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.85)', padding: 25 },
  modalBox: { backgroundColor: '#17212b', padding: 25, borderRadius: 20, alignItems: 'center' },
  modalInput: { width: '100%', backgroundColor: '#0e1621', color: '#fff', padding: 15, borderRadius: 10, marginBottom: 20 },
  modalBtn: { padding: 12, borderRadius: 10, width: '45%', alignItems: 'center' }
});
    
