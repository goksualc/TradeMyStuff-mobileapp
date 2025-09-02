import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { login, clearError } from '../../store/slices/authSlice';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type LoginScreenNavigationProp = NavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const theme = useTheme();
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      isValid = false;
    }

    if (!password.trim()) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(login({ email: email.trim(), password })).unwrap();
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Please try again');
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  // Clear error when component unmounts or when error changes
  React.useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, [error, dispatch]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Icon name="store" size={80} color={theme.colors.primary} />
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Trade My Stuff
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Buy, sell, and trade with confidence
          </Text>
        </View>

        <Surface style={styles.formContainer} elevation={2}>
          <Text variant="headlineSmall" style={styles.formTitle}>
            Welcome Back
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={!!emailError}
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />
          <HelperText type="error" visible={!!emailError}>
            {emailError}
          </HelperText>

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry={!showPassword}
            error={!!passwordError}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <HelperText type="error" visible={!!passwordError}>
            {passwordError}
          </HelperText>

          <Button
            mode="text"
            onPress={handleForgotPassword}
            style={styles.forgotPassword}
            textColor={theme.colors.primary}
          >
            Forgot Password?
          </Button>

          <Button
            mode="contained"
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
            contentStyle={styles.buttonContent}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          <View style={styles.signupContainer}>
            <Text variant="bodyMedium">Don't have an account? </Text>
            <Button
              mode="text"
              onPress={handleSignup}
              textColor={theme.colors.primary}
              compact
            >
              Sign Up
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    marginTop: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  formContainer: {
    padding: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600',
  },
  input: {
    marginBottom: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  loginButton: {
    marginBottom: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
