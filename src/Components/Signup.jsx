// Signup.js
import React, { useState, memo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
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

/* ---------------- STYLES AT TOP ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  contentContainer: { flexGrow: 1, padding: 16, justifyContent: 'center' },
  formContainer: { maxWidth: 400, width: '100%', alignSelf: 'center' },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },

  inputContainer: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  required: { color: '#DC2626' },

  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputWrapperError: { borderColor: '#DC2626', borderWidth: 2 },
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
  inputMultiline: { paddingTop: 12, textAlignVertical: 'top' },
  inputError: { color: '#DC2626' },

  errorContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  errorText: { fontSize: 12, color: '#B91C1C', marginLeft: 4, flex: 1 },

  uploadContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  uploadTextContainer: { marginTop: 8, alignItems: 'center' },
  uploadText: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  uploadLink: { color: '#2563EB', fontWeight: '500' },
  uploadSuccessText: { fontSize: 14, color: '#059669', fontWeight: '500' },
  uploadSubtext: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },

  submitButton: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: '500' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
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
  successMessage: { backgroundColor: '#ECFDF5', borderColor: '#BBF7D0' },
  errorMessage: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  messageIcon: { marginRight: 12 },
  messageText: { flex: 1, fontSize: 14 },
  successText: { color: '#047857' },

  loginPrompt: { marginTop: 24, alignItems: 'center' },
  loginPromptText: { fontSize: 14, color: '#6B7280' },
  loginLink: { color: '#2563EB', fontWeight: '500' },
});
/* ------------------------------------------------ */

const InputField = memo(function InputField({
  icon: Icon,
  label,
  name,
  type = 'default',
  placeholder,
  required = false,
  secureTextEntry = false,
  multiline = false,
  value,
  onChangeText,
  onValidate,
  error,
}) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <View style={[styles.inputWrapper, error && styles.inputWrapperError]}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={error ? '#DC2626' : '#9CA3AF'} />
        </View>
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            error && styles.inputError,
          ]}
          placeholder={placeholder}
          value={value ?? ''} // ✅ always string
          onChangeText={onChangeText}
          keyboardType={type}
          secureTextEntry={secureTextEntry}
          autoCapitalize={
            name === 'email' || name === 'password' || name === 'contactNo'
              ? 'none'
              : 'words'
          }
          placeholderTextColor="#9CA3AF"
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          onBlur={() => {
            if (value) onValidate?.(name, value);
          }}
        />
      </View>
      {!!error && (
        <View style={styles.errorContainer}>
          <AlertCircle size={16} color="#DC2626" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
});

export default function Signup() {
  const navigation = useNavigation();
  const [form, setForm] = useState({
    medicalName: '',
    ownerName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
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
    if (fieldErrors[name]) setFieldErrors(prev => ({ ...prev, [name]: null }));
  };

  const validateField = (name, value) => {
    const trimmedValue = (value || '').trim();
    const words = trimmedValue.split(/\s+/).filter(Boolean);

    switch (name) {
      case 'medicalName':
        if (trimmedValue.length < 3)
          return 'Medical store name must be at least 3 characters long';
        if (words.length < 2)
          return 'Please enter the complete medical store name (at least 2 words)';
        break;
      case 'ownerName':
        if (trimmedValue.length < 3)
          return 'Owner name must be at least 3 characters long';
        if (words.length < 2)
          return 'Please enter full name (first and last name)';
        break;
      case 'address':
        if (trimmedValue.length < 10)
          return 'Address must be at least 10 characters long';
        if (words.length < 3)
          return 'Please enter complete address with proper details';
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue))
          return 'Please enter a valid email address';
        break;
      case 'contactNo':
        if (!/^[0-9]{10,15}$/.test(trimmedValue.replace(/\s/g, '')))
          return 'Please enter a valid contact number (10-15 digits)';
        break;
      case 'drugLicenseNo':
        if (trimmedValue.length < 5)
          return 'Drug license number must be at least 5 characters long';
        break;
      case 'password':
        if (trimmedValue.length < 8)
          return 'Password must be at least 8 characters long';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(trimmedValue))
          return 'Password must contain uppercase, lowercase and number';
        break;
    }
    return null;
  };

  const onValidate = (name, value) => {
    const err = validateField(name, value);
    if (err) setFieldErrors(prev => ({ ...prev, [name]: err }));
  };

  const handleImagePicker = async () => {
    try {
      const imageService = new ImageUploadService();
      const result = await imageService.processImage();
      if (result.success) {
        setForm(prev => ({ ...prev, drugLicenseImage: result.file }));
        setMessage('Image selected successfully!');
      } else setMessage(result.message);
    } catch (e) {
      setMessage(e?.message || 'Failed to select image');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setMessage('');
    setFieldErrors({});

    const required = [
      'medicalName',
      'ownerName',
      'address',
      'email',
      'contactNo',
      'drugLicenseNo',
      'password',
    ];
    const errors = {};
    let hasErrors = false;

    required.forEach(field => {
      const v = form[field];
      if (!v || !String(v).trim()) {
        errors[field] = 'This field is required';
        hasErrors = true;
      } else {
        const e = validateField(field, v);
        if (e) {
          errors[field] = e;
          hasErrors = true;
        }
      }
    });

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

    try {
      // First upload the selected image to backend upload endpoint
      let uploadedImageInfo = null;
      if (form.drugLicenseImage && form.drugLicenseImage.path) {
        try {
          const uploadForm = new FormData();

          // Ensure URI has a file:// prefix on Android for local files
          let fileUri = form.drugLicenseImage.path;
          if (
            !fileUri.startsWith('file://') &&
            !fileUri.startsWith('content://')
          ) {
            fileUri = `file://${fileUri}`;
          }

          uploadForm.append('image', {
            uri: fileUri,
            type: form.drugLicenseImage.type || 'image/jpeg',
            name: form.drugLicenseImage.fileName || 'license.jpg',
          });

          const uploadRes = await fetch(
            'http://10.0.2.2:5000/api/upload/image',
            {
              method: 'POST',
              body: uploadForm,
            },
          );

          // If fetch itself failed (network) this will throw and be caught below
          const uploadJson = await uploadRes.json();
          if (!uploadRes.ok) {
            setMessage(uploadJson.message || 'Image upload failed');
            setIsLoading(false);
            return;
          }

          uploadedImageInfo = uploadJson.data;
        } catch (uploadErr) {
          // Provide clearer error message for network failures or bad URIs
          setMessage(uploadErr.message || 'Image upload network error');
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        medicalName: form.medicalName,
        ownerName: form.ownerName,
        email: form.email,
        contactNo: form.contactNo,
        address: {
          street: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
        },
        drugLicenseNo: form.drugLicenseNo,
        password: form.password,
        // Attach the uploaded file info expected by backend (object with url and public_id)
        drugLicenseImage: uploadedImageInfo
          ? {
              url: uploadedImageInfo.url,
              public_id: uploadedImageInfo.filename,
            }
          : null,
      };

      const res = await fetch('http://10.0.2.2:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        // show validation errors if present
        if (json && json.errors) {
          const newErrors = {};
          json.errors.forEach(err => {
            // express-validator gives param like 'address.street'
            const key = err.param || err.path || 'general';
            if (key.startsWith('address.')) {
              const sub = key.split('.')[1];
              newErrors[sub] = err.msg;
            } else {
              newErrors[key] = err.msg || err.msg || err.message;
            }
          });
          setFieldErrors(prev => ({ ...prev, ...newErrors }));
        }
        setMessage(json.message || 'Failed to register');
      } else {
        setMessage(
          json.message || 'Registration successful! Redirecting to login...',
        );
        setTimeout(() => navigation.navigate('login'), 1200);
      }
    } catch (e) {
      setMessage(e.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = () => {
    if (!message) return null;
    const isSuccess = message.toLowerCase().includes('successful');
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
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.formContainer}>
        <View style={styles.formCard}>
          <Text style={styles.title}>Create Your Account</Text>

          <InputField
            icon={Building2}
            label="Medical Store Name"
            name="medicalName"
            placeholder="e.g., ABC Medical Store"
            required
            value={form.medicalName}
            onChangeText={v => handleChange('medicalName', v)}
            onValidate={onValidate}
            error={fieldErrors.medicalName}
          />

          <InputField
            icon={User}
            label="Owner Name"
            name="ownerName"
            placeholder="e.g., John Smith"
            required
            value={form.ownerName}
            onChangeText={v => handleChange('ownerName', v)}
            onValidate={onValidate}
            error={fieldErrors.ownerName}
          />

          <InputField
            icon={MapPin}
            label="Address"
            name="address"
            placeholder="e.g., 123 Main Street, City"
            required
            multiline
            value={form.address}
            onChangeText={v => handleChange('address', v)}
            onValidate={onValidate}
            error={fieldErrors.address}
          />

          <InputField
            icon={MapPin}
            label="City"
            name="city"
            placeholder="e.g., Indore"
            required
            value={form.city}
            onChangeText={v => handleChange('city', v)}
            onValidate={onValidate}
            error={fieldErrors.city}
          />

          <InputField
            icon={MapPin}
            label="State"
            name="state"
            placeholder="e.g., Madhya Pradesh"
            required
            value={form.state}
            onChangeText={v => handleChange('state', v)}
            onValidate={onValidate}
            error={fieldErrors.state}
          />

          <InputField
            icon={MapPin}
            label="Pincode"
            name="pincode"
            placeholder="e.g., 452001"
            required
            value={form.pincode}
            onChangeText={v => handleChange('pincode', v)}
            onValidate={onValidate}
            error={fieldErrors.pincode}
          />

          <InputField
            icon={Mail}
            label="Email Address"
            name="email"
            type="email-address"
            placeholder="e.g., john@example.com"
            required
            value={form.email}
            onChangeText={v => handleChange('email', v)}
            onValidate={onValidate}
            error={fieldErrors.email}
          />

          <InputField
            icon={Phone}
            label="Contact Number"
            name="contactNo"
            type="phone-pad"
            placeholder="e.g., 9876543210"
            required
            value={form.contactNo}
            onChangeText={v => handleChange('contactNo', v)}
            onValidate={onValidate}
            error={fieldErrors.contactNo}
          />

          <InputField
            icon={Shield}
            label="Drug License Number"
            name="drugLicenseNo"
            placeholder="e.g., DL-12345-ABC"
            required
            value={form.drugLicenseNo}
            onChangeText={v => handleChange('drugLicenseNo', v)}
            onValidate={onValidate}
            error={fieldErrors.drugLicenseNo}
          />

          {/* File Upload */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Drug License Image<Text style={styles.required}> *</Text>
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
                        form.drugLicenseImage.fileName ||
                        'Selected image'}
                    </Text>
                    <Text style={styles.uploadSubtext}>
                      Image selected successfully
                    </Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.uploadText}>
                      <Text style={styles.uploadLink}>Click to upload</Text> or
                      take photo
                    </Text>
                    <Text style={styles.uploadSubtext}>PNG, JPG up to 5MB</Text>
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
            value={form.password}
            onChangeText={v => handleChange('password', v)}
            onValidate={onValidate}
            error={fieldErrors.password}
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

          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>
              Already have an account?{' '}
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate('login')}
              >
                Sign in
              </Text>
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
