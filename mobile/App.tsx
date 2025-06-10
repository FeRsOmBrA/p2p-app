import React, { useState, useEffect, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TextInput, Button, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';

const Stack = createNativeStackNavigator();
const API_URL = 'http://localhost:3000/api';

i18n.translations = {
  en: {
    login: 'Login',
    register: 'Register',
    username: 'Username',
    password: 'Password',
    otp: 'One-time code',
    products: 'Products',
    add: 'Add',
    save: 'Save',
    transactions: 'Transactions',
  },
  es: {
    login: 'Iniciar sesión',
    register: 'Registrarse',
    username: 'Usuario',
    password: 'Contraseña',
    otp: 'Código OTP',
    products: 'Productos',
    add: 'Agregar',
    save: 'Guardar',
    transactions: 'Transacciones',
  },
};
i18n.locale = Localization.locale;
i18n.fallbacks = true;

type Product = { id: number; name: string; price: number; description?: string };
type Transaction = {
  id: number;
  amount: number;
  fromUserId: number;
  toUserId: number;
  productId?: number;
  status: string;
};

type TokenState = { token: string | null; setToken: (t: string | null) => void };
const TokenContext = React.createContext<TokenState>({ token: null, setToken: () => {} });

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => {
    AsyncStorage.getItem('token').then(t => {
      if (t) setToken(t);
    });
  }, []);

  useEffect(() => {
    if (token) {
      AsyncStorage.setItem('token', token);
    } else {
      AsyncStorage.removeItem('token');
    }
  }, [token]);

  return (
    <TokenContext.Provider value={{ token, setToken }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Products" component={ProductsScreen} />
          <Stack.Screen name="AddProduct" component={AddProductScreen} />
          <Stack.Screen name="Transactions" component={TransactionsScreen} />
          <Stack.Screen name="AddTransaction" component={AddTransactionScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </TokenContext.Provider>
  );
}

function HomeScreen({ navigation }: any) {
  const { token } = useContext(TokenContext);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      {!token && (
        <Button title={i18n.t('login')} onPress={() => navigation.navigate('Login')} />
      )}
      {!token && (
        <Button title={i18n.t('register')} onPress={() => navigation.navigate('Register')} />
      )}
      <Button title={i18n.t('products')} onPress={() => navigation.navigate('Products')} />
      {token && (
        <Button
          title={i18n.t('transactions')}
          onPress={() => navigation.navigate('Transactions')}
        />
      )}
    </View>
  );
}

function LoginScreen({ navigation }: any) {
  const { setToken } = useContext(TokenContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const login = async () => {
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        navigation.navigate('Home');
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
  };
  return (
    <View style={{ padding: 20 }}>
      <Text>{i18n.t('username')}</Text>
      <TextInput value={username} onChangeText={setUsername} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>{i18n.t('password')}</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>{i18n.t('otp')}</Text>
      <TextInput value={otp} onChangeText={setOtp} style={{ borderWidth: 1, marginBottom: 10 }} keyboardType="numeric" />
      <Button title={i18n.t('login')} onPress={login} />
    </View>
  );
}

function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const register = async () => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Registered', `Secret OTP: ${data.otpSecret}`);
      } else {
        Alert.alert('Error', data.error);
      }
    } catch (err) {
      Alert.alert('Error', 'Network error');
    }
  };
  return (
    <View style={{ padding: 20 }}>
      <Text>{i18n.t('username')}</Text>
      <TextInput value={username} onChangeText={setUsername} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>{i18n.t('password')}</Text>
      <TextInput secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title={i18n.t('register')} onPress={register} />
    </View>
  );
}

function ProductsScreen({ navigation }: any) {
  const { token } = useContext(TokenContext);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {token && (
        <Button title={i18n.t('add')} onPress={() => navigation.navigate('AddProduct')} />
      )}
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10 }}>
            <Text>{item.name} - ${item.price}</Text>
            {item.description && <Text>{item.description}</Text>}
          </View>
        )}
      />
    </View>
  );
}

function AddProductScreen({ navigation }: any) {
  const { token } = useContext(TokenContext);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const save = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, price: Number(price), description }),
    });
    if (res.ok) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Unable to save');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Name</Text>
      <TextInput value={name} onChangeText={setName} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Price</Text>
      <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={{ borderWidth: 1, marginBottom: 10 }} />
      <Text>Description</Text>
      <TextInput value={description} onChangeText={setDescription} style={{ borderWidth: 1, marginBottom: 10 }} />
      <Button title={i18n.t('save')} onPress={save} />
    </View>
  );
}

function TransactionsScreen({ navigation }: any) {
  const { token } = useContext(TokenContext);
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setTxs)
      .catch(() => {});
  }, [token]);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Button title={i18n.t('add')} onPress={() => navigation.navigate('AddTransaction')} />
      <FlatList
        data={txs}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10 }}>
            <Text>
              {item.amount} - {item.status}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

function AddTransactionScreen({ navigation }: any) {
  const { token } = useContext(TokenContext);
  const [toUserId, setToUserId] = useState('');
  const [amount, setAmount] = useState('');

  const save = async () => {
    if (!token) return;
    const res = await fetch(`${API_URL}/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ toUserId: Number(toUserId), amount: Number(amount) }),
    });
    if (res.ok) {
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Unable to save');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>To User ID</Text>
      <TextInput
        value={toUserId}
        onChangeText={setToUserId}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Text>Amount</Text>
      <TextInput
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ borderWidth: 1, marginBottom: 10 }}
      />
      <Button title={i18n.t('save')} onPress={save} />
    </View>
  );
}
