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
import { signup, clearError } from '../../store/slices/authSlice';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type SignupScreenNavigationProp = NavigationProp<AuthStackParamList, 'Signup'>;

const SignupScreen: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const theme = useTheme();
  const navigation = useNavigation<SignupScreenNavigationProp>();
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(signup({
        email: formData.email.trim(),
        password: formData.password,
        username: formData.username.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      })).unwrap();
      
      Alert.alert('Success', 'Account created successfully!');
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message || 'Please try again');
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
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
        <View style={styles.header}>
          <Icon name="store" size={60} color={theme.colors.primary} />
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Join Trade My Stuff
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Create your account to start trading
          </Text>
        </View>

        <Surface style={styles.formContainer} elevation={2}>
          <Text variant="headlineSmall" style={styles.formTitle}>
            Create Account
          </Text>

          <View style={styles.nameRow}>
            <TextInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(value) => updateFormData('firstName', value)}
              mode="outlined"
              error={!!errors.firstName}
              style={[styles.input, styles.halfInput]}
              left={<TextInput.Icon icon="account" />}
            />
            <TextInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(value) => updateFormData('lastName', value)}
              mode="outlined"
              error={!!errors.lastName}
              style={[styles.input, styles.halfInput]}
              left={<TextInput.Icon icon="account" />}
            />
          </View>
          <HelperText type="error" visible={!!errors.firstName}>
            {errors.firstName}
          </HelperText>
          <HelperText type="error" visible={!!errors.lastName}>
            {errors.lastName}
          </HelperText>

          <TextInput
            label="Username"
            value={formData.username}
            onChangeText={(value) => updateFormData('username', value)}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            error={!!errors.username}
            style={styles.input}
            left={<TextInput.Icon icon="at" />}
          />
          <HelperText type="error" visible={!!errors.username}>
            {errors.username}
          </HelperText>

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(value) => updateFormData('email', value)}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            error={!!errors.email}
            style={styles.input}
            left={<TextInput.Icon icon="email" />}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email}
          </HelperText>

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(value) => updateFormData('password', value)}
            mode="outlined"
            secureTextEntry={!showPassword}
            error={!!errors.password}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password}
          </HelperText>

          <TextInput
            label="Confirm Password"
            value={formData.confirmPassword}
            onChangeText={(value) => updateFormData('confirmPassword', value)}
            mode="outlined"
            secureTextEntry={!showConfirmPassword}
            error={!!errors.confirmPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock-check" />}
            right={
              <TextInput.Icon
                icon={showConfirmPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            }
          />
          <HelperText type="error" visible={!!errors.confirmPassword}>
            {errors.confirmPassword}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSignup}
            loading={isLoading}
            disabled={isLoading}
            style={styles.signupButton}
            contentStyle={styles.buttonContent}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <View style={styles.loginContainer}>
            <Text variant="bodyMedium">Already have an account? </Text>
            <Button
              mode="text"
              onPress={handleLogin}
              textColor={theme.colors.primary}
              compact
            >
              Sign In
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    marginTop: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
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
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    marginBottom: 8,
  },
  halfInput: {
    flex: 0.48,
  },
  signupButton: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SignupScreen;
