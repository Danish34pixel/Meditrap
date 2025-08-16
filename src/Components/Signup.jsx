import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  User,
  Lock,
  Upload,
  Shield,
  AlertCircle,
  CheckCircle,
} from 'lucide-react-native';
import ImageUploadService from '../services/ImageUploadService';

const { width } = Dimensions.get('window');

const Signup = () => {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    medicalName: '',
    ownerName: '',
    address: '',
    email: '',
    contactNo: '',
    drugLicenseNo: '',
    password: '',
    drugLicenseImage: null,
  });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateField = (name, value) => {
    const trimmedValue = value.trim();
    const words = trimmedValue.split(/\s+/).filter(word => word.length > 0);

    switch (name) {
      case 'medicalName':
        if (trimmedValue.length < 3) {
          return 'Medical store name must be at least 3 characters long';
        }
        if (words.length < 2) {
          return 'Please enter the complete medical store name (at least 2 words)';
        }
        break;

      case 'ownerName':
        if (trimmedValue.length < 3) {
          return 'Owner name must be at least 3 characters long';
        }
        if (words.length < 2) {
          return 'Please enter full name (first and last name)';
        }
        break;

      case 'address':
        if (trimmedValue.length < 10) {
          return 'Address must be at least 10 characters long';
        }
        if (words.length < 3) {
          return 'Please enter complete address with proper details';
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedValue)) {
          return 'Please enter a valid email address';
        }
        break;

      case 'contactNo':
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(trimmedValue.replace(/\s/g, ''))) {
          return 'Please enter a valid contact number (10-15 digits)';
        }
        break;

      case 'drugLicenseNo':
        if (trimmedValue.length < 5) {
          return 'Drug license number must be at least 5 characters long';
        }
        break;

      case 'password':
        if (trimmedValue.length < 8) {
          return 'Password must be at least 8 characters long';
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(trimmedValue)) {
          return 'Password must contain uppercase, lowercase and number';
        }
        break;

      default:
        break;
    }
    return null;
  };

  const handleImagePicker = async () => {
    try {
      const imageService = new ImageUploadService();
      const result = await imageService.processImage();

      if (result.success) {
        setForm(prev => ({
          ...prev,
          drugLicenseImage: result.file,
        }));
        setMessage('Image selected successfully!');
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage(error.message || 'Failed to select image');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage('');
    setFieldErrors({});

    const errors = {};
    let hasErrors = false;

    // Validate all required fields
    const requiredFields = [
      'medicalName',
      'ownerName',
      'address',
      'email',
      'contactNo',
      'drugLicenseNo',
      'password',
    ];

    requiredFields.forEach(field => {
      if (!form[field] || !form[field].trim()) {
        errors[field] = 'This field is required';
        hasErrors = true;
      } else {
        const error = validateField(field, form[field]);
        if (error) {
          errors[field] = error;
          hasErrors = true;
        }
      }
    });

    // Validate image
    if (!form.drugLicenseImage) {
      setMessage('Please upload your drug license image.');
      setIsLoading(false);
      return;
    }

    if (hasErrors) {
      setFieldErrors(errors);
      setMessage('Please fix the errors below and try again.');
      setIsLoading(false);
      return;
    }

    // Simulate registration process
    setTimeout(() => {
      setMessage('Registration successful! Redirecting to login...');
      setTimeout(() => navigation.navigate('login'), 2000);
      setIsLoading(false);
    }, 1000);
  };

  const InputField = ({
    icon: Icon,
    label,
    name,
    type = 'default',
    placeholder,
    required = false,
    secureTextEntry = false,
    minLength = 0,
    multiline = false,
  }) => {
    const hasError = fieldErrors[name];

    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        <View
          style={[styles.inputWrapper, hasError && styles.inputWrapperError]}
        >
          <View style={styles.iconContainer}>
            <Icon size={20} color={hasError ? '#DC2626' : '#9CA3AF'} />
          </View>
          <TextInput
            style={[
              styles.input,
              multiline && styles.inputMultiline,
              hasError && styles.inputError,
            ]}
            placeholder={placeholder}
            value={form[name] || ''}
            onChangeText={value => handleChange(name, value)}
            keyboardType={type}
            secureTextEntry={secureTextEntry}
            autoCapitalize="words"
            placeholderTextColor="#9CA3AF"
            multiline={multiline}
            numberOfLines={multiline ? 3 : 1}
            onBlur={() => {
              if (form[name]) {
                const error = validateField(name, form[name]);
                if (error) {
                  setFieldErrors(prev => ({ ...prev, [name]: error }));
                }
              }
            }}
          />
        </View>
        {hasError && (
          <View style={styles.errorContainer}>
            <AlertCircle size={16} color="#DC2626" />
            <Text style={styles.errorText}>{hasError}</Text>
          </View>
        )}
        {name === 'medicalName' && !hasError && (
          <Text style={styles.helperText}>
            Enter complete medical store name (e.g., "ABC Medical Store")
          </Text>
        )}
        {name === 'ownerName' && !hasError && (
          <Text style={styles.helperText}>
            Enter your full name (e.g., "John Smith")
          </Text>
        )}
        {name === 'address' && !hasError && (
          <Text style={styles.helperText}>
            Enter complete address with area, city details
          </Text>
        )}
        {name === 'password' && !hasError && (
          <Text style={styles.helperText}>
            At least 8 characters with uppercase, lowercase and number
          </Text>
        )}
      </View>
    );
  };

  const renderMessage = () => {
    if (!message) return null;

    const isSuccess = message.includes('successful');
    return (
      <View
        style={[
          styles.messageContainer,
          isSuccess ? styles.successMessage : styles.errorMessage,
        ]}
      >
        {isSuccess ? (
          <CheckCircle size={20} color="#059669" style={styles.messageIcon} />
        ) : (
          <AlertCircle size={20} color="#DC2626" style={styles.messageIcon} />
        )}
        <Text
          style={[
            styles.messageText,
            isSuccess ? styles.successText : styles.errorText,
          ]}
        >
          {message}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.formContainer}>
        {/* Logo and Header */}
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <Text style={styles.logoD}>D</Text>
            <Text style={styles.logoK}>K</Text>
            <Image
              source={{
                uri: '/cd774852582f4e41232a6ebd5886e0bc-removebg-preview.png',
              }}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Registration Form */}
        <View style={styles.formCard}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Your Account</Text>
            <Text style={styles.subtitle}>
              Register your medical store with MedTrap
            </Text>
          </View>

          <View style={styles.fieldsContainer}>
            <InputField
              icon={Building2}
              label="Medical Store Name"
              name="medicalName"
              placeholder="e.g., ABC Medical Store"
              required
            />
            <InputField
              icon={User}
              label="Owner Name"
              name="ownerName"
              placeholder="e.g., John Smith"
              required
            />
            <InputField
              icon={MapPin}
              label="Address"
              name="address"
              placeholder="e.g., 123 Main Street, City Name, State"
              required
              multiline
            />
            <InputField
              icon={Mail}
              label="Email Address"
              name="email"
              type="email-address"
              placeholder="e.g., john@example.com"
              required
            />
            <InputField
              icon={Phone}
              label="Contact Number"
              name="contactNo"
              type="phone-pad"
              placeholder="e.g., 9876543210"
              required
            />
            <InputField
              icon={Shield}
              label="Drug License Number"
              name="drugLicenseNo"
              placeholder="e.g., DL-12345-ABC"
              required
            />

            {/* File Upload */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>
                Drug License Image
                <Text style={styles.required}> *</Text>
              </Text>
              <TouchableOpacity
                style={styles.uploadContainer}
                onPress={handleImagePicker}
              >
                <Upload size={48} color="#9CA3AF" />
                <View style={styles.uploadTextContainer}>
                  {form.drugLicenseImage ? (
                    <>
                      <Text style={styles.uploadSuccessText}>
                        {form.drugLicenseImage.originalName ||
                          form.drugLicenseImage.fileName}
                      </Text>
                      <Text style={styles.uploadSubtext}>
                        Image selected successfully
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={styles.uploadText}>
                        <Text style={styles.uploadLink}>Click to upload</Text>{' '}
                        or take photo
                      </Text>
                      <Text style={styles.uploadSubtext}>
                        PNG, JPG, GIF up to 5MB
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            <InputField
              icon={Lock}
              label="Password"
              name="password"
              placeholder="Create a strong password"
              secureTextEntry
              required
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                isLoading && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.loadingText}>Creating Account...</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {renderMessage()}
          </View>

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>
              Already have an account?{' '}
              <TouchableOpacity onPress={() => navigation.navigate('login')}>
                <Text style={styles.loginLink}>Sign in</Text>
              </TouchableOpacity>
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By registering, you agree to our{' '}
            <Text style={styles.footerLink}>Terms of Service</Text> and{' '}
            <Text style={styles.footerLink}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
    justifyContent: 'center',
  },
  formContainer: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrapper: {
    height: 80,
    width: 80,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoD: {
    position: 'absolute',
    fontSize: 32,
    color: '#2563EB',
    left: -5,
    top: 5,
    zIndex: 0,
  },
  logoK: {
    position: 'absolute',
    fontSize: 32,
    color: '#DC2626',
    right: -5,
    top: 5,
    zIndex: 0,
  },
  logoImage: {
    width: 80,
    height: 80,
    zIndex: 10,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  fieldsContainer: {
    gap: 24,
  },
  inputContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  required: {
    color: '#DC2626',
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperError: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  iconContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputMultiline: {
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  inputError: {
    color: '#DC2626',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 4,
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    marginLeft: 4,
  },
  uploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  uploadTextContainer: {
    marginTop: 8,
    alignItems: 'center',
  },
  uploadText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  uploadLink: {
    color: '#2563EB',
    fontWeight: '500',
  },
  uploadSuccessText: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  successMessage: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
  },
  errorMessage: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  messageIcon: {
    marginRight: 12,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
  },
  successText: {
    color: '#047857',
  },
  errorText: {
    color: '#B91C1C',
  },
  loginPrompt: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginPromptText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    color: '#2563EB',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#2563EB',
  },
});

export default Signup;
