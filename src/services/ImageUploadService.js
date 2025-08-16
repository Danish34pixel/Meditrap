import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import RNFS from 'react-native-fs';

class ImageUploadService {
  constructor() {
    this.maxFileSize = 5 * 1024 * 1024; // 5MB limit
    this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    this.uploadsDir = `${RNFS.DocumentDirectoryPath}/uploads`;
  }

  // Create uploads directory if it doesn't exist
  async createUploadsDirectory() {
    try {
      const exists = await RNFS.exists(this.uploadsDir);
      if (!exists) {
        await RNFS.mkdir(this.uploadsDir);
      }
    } catch (error) {
      console.error('Error creating uploads directory:', error);
      throw new Error('Failed to create uploads directory');
    }
  }

  // Generate unique filename with timestamp
  generateUniqueFilename(originalName) {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const extension = originalName.split('.').pop();
    return `image-${timestamp}-${random}.${extension}`;
  }

  // File validation
  validateFile(file) {
    // Check file type
    if (!this.allowedTypes.includes(file.type)) {
      throw new Error('Only image files (JPG, PNG, GIF) are allowed.');
    }

    // Check file size
    if (file.fileSize > this.maxFileSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    return true;
  }

  // Request camera permission (Android)
  async requestCameraPermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera permission to take photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  }

  // Pick image from gallery
  async pickFromGallery() {
    return new Promise((resolve, reject) => {
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
      };

      launchImageLibrary(options, response => {
        if (response.didCancel) {
          reject(new Error('User cancelled image selection'));
          return;
        }

        if (response.errorMessage) {
          reject(new Error(response.errorMessage));
          return;
        }

        if (response.assets && response.assets[0]) {
          resolve(response.assets[0]);
        } else {
          reject(new Error('No image selected'));
        }
      });
    });
  }

  // Take photo with camera
  async takePhoto() {
    const hasPermission = await this.requestCameraPermission();
    if (!hasPermission) {
      throw new Error('Camera permission denied');
    }

    return new Promise((resolve, reject) => {
      const options = {
        mediaType: 'photo',
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
      };

      launchCamera(options, response => {
        if (response.didCancel) {
          reject(new Error('User cancelled photo capture'));
          return;
        }

        if (response.errorMessage) {
          reject(new Error(response.errorMessage));
          return;
        }

        if (response.assets && response.assets[0]) {
          resolve(response.assets[0]);
        } else {
          reject(new Error('No photo captured'));
        }
      });
    });
  }

  // Show image picker options
  showImagePicker() {
    return new Promise((resolve, reject) => {
      Alert.alert(
        'Select Image',
        'Choose an option',
        [
          {
            text: 'Camera',
            onPress: () => this.takePhoto().then(resolve).catch(reject),
          },
          {
            text: 'Gallery',
            onPress: () => this.pickFromGallery().then(resolve).catch(reject),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => reject(new Error('User cancelled')),
          },
        ],
        { cancelable: true },
      );
    });
  }

  // Process and validate selected image
  async processImage(imageSource = null) {
    try {
      // Create uploads directory
      await this.createUploadsDirectory();

      // Get image either from provided source or show picker
      const selectedImage = imageSource || (await this.showImagePicker());

      // Validate the selected image
      this.validateFile({
        type: selectedImage.type,
        fileSize: selectedImage.fileSize,
      });

      // Generate unique filename
      const uniqueFilename = this.generateUniqueFilename(
        selectedImage.fileName || 'image.jpg',
      );
      const destinationPath = `${this.uploadsDir}/${uniqueFilename}`;

      // Copy file to uploads directory
      await RNFS.copyFile(selectedImage.uri, destinationPath);

      return {
        success: true,
        file: {
          uri: destinationPath,
          fileName: uniqueFilename,
          originalName: selectedImage.fileName,
          type: selectedImage.type,
          size: selectedImage.fileSize,
          path: destinationPath,
        },
        message: 'Image processed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error,
      };
    }
  }

  // Clean up uploaded files
  async cleanupUploads() {
    try {
      const files = await RNFS.readDir(this.uploadsDir);

      // Delete files older than 1 hour
      const oneHourAgo = Date.now() - 60 * 60 * 1000;

      for (const file of files) {
        const fileStats = await RNFS.stat(file.path);
        const fileTime = new Date(fileStats.mtime).getTime();

        if (fileTime < oneHourAgo) {
          await RNFS.unlink(file.path);
          console.log(`Cleaned up old file: ${file.name}`);
        }
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Delete specific file
  async deleteFile(filePath) {
    try {
      const exists = await RNFS.exists(filePath);
      if (exists) {
        await RNFS.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }
}

export default ImageUploadService;
