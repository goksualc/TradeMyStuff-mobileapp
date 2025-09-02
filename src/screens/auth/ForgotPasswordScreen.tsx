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
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { authAPI } from '../../services/authAPI';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

type ForgotPasswordScreenNavigationProp = NavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const theme = useTheme();
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await authAPI.forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (isSubmitted) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.successContainer}>
            <Icon name="email-check" size={80} color={theme.colors.success} />
            <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.success }]}>
              Check Your Email
            </Text>
            <Text variant="bodyLarge" style={[styles.message, { color: theme.colors.textSecondary }]}>
              We've sent a password reset link to:
            </Text>
            <Text variant="bodyLarge" style={[styles.email, { color: theme.colors.primary }]}>
              {email}
            </Text>
            <Text variant="bodyMedium" style={[styles.instructions, { color: theme.colors.textSecondary }]}>
              Click the link in the email to reset your password. If you don't see the email, check your spam folder.
            </Text>
            
            <Button
              mode="contained"
              onPress={handleBackToLogin}
              style={styles.backButton}
              contentStyle={styles.buttonContent}
            >
              Back to Login
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

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
          <Icon name="lock-reset" size={80} color={theme.colors.primary} />
          <Text variant="headlineMedium" style={[styles.title, { color: theme.colors.primary }]}>
            Reset Password
          </Text>
          <Text variant="bodyLarge" style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter your email to receive a password reset link
          </Text>
        </View>

        <Surface style={styles.formContainer} elevation={2}>
          <Text variant="headlineSmall" style={styles.formTitle}>
            Forgot Password
          </Text>

          <TextInput
            label="Email"
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (emailError) setEmailError('');
            }}
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

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isLoading}
            disabled={isLoading}
            style={styles.submitButton}
            contentStyle={styles.buttonContent}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>

          <Button
            mode="text"
            onPress={handleBackToLogin}
            style={styles.backToLoginButton}
            textColor={theme.colors.primary}
          >
            Back to Login
          </Button>
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
  submitButton: {
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  backToLoginButton: {
    alignSelf: 'center',
  },
  successContainer: {
    alignItems: 'center',
    padding: 20,
  },
  message: {
    marginTop: 16,
    textAlign: 'center',
  },
  email: {
    marginTop: 8,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructions: {
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  backButton: {
    marginTop: 32,
    borderRadius: 8,
  },
});

export default ForgotPasswordScreen;
