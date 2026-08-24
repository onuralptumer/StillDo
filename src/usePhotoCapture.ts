/**
 * "Snap it" — shoot a new photo or pick one already in the library, and hand
 * back a local URI to attach to the capture.
 *
 * @format
 */

import { useCallback, useState } from 'react';
import { ActionSheetIOS, Alert, PermissionsAndroid, Platform } from 'react-native';
import {
  launchCamera,
  launchImageLibrary,
  type ImagePickerResponse,
} from 'react-native-image-picker';

export type PhotoCapture = {
  error: string | null;
  /** Offer the camera or the library — the Inbox's own "Snap it" button. */
  choose: () => void;
  /**
   * Straight to the camera, no sheet. The home-screen widget's snap button
   * has already made that choice; asking again on arrival would undo the one
   * tap the widget exists to save.
   */
  shoot: () => void;
  dismissError: () => void;
};

export function usePhotoCapture(onPhoto: (uri: string) => void): PhotoCapture {
  const [error, setError] = useState<string | null>(null);

  const handle = useCallback(
    (r: ImagePickerResponse) => {
      if (r.didCancel) return;
      if (r.errorCode === 'camera_unavailable') {
        setError('No camera on this device — pick one from the library instead.');
        return;
      }
      if (r.errorCode === 'permission') {
        setError('Stilldo needs camera access to snap it.');
        return;
      }
      if (r.errorCode) {
        setError(r.errorMessage || 'That photo did not come through.');
        return;
      }
      const uri = r.assets?.[0]?.uri;
      if (uri) {
        setError(null);
        onPhoto(uri);
      }
    },
    [onPhoto],
  );

  const shoot = useCallback(async () => {
    setError(null);
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        setError('Stilldo needs camera access to snap it.');
        return;
      }
    }
    handle(
      await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      }),
    );
  }, [handle]);

  const pick = useCallback(async () => {
    handle(
      await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      }),
    );
  }, [handle]);

  const choose = useCallback(() => {
    setError(null);
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Take a photo', 'Choose an existing one', 'Cancel'],
          cancelButtonIndex: 2,
        },
        i => {
          if (i === 0) shoot();
          if (i === 1) pick();
        },
      );
      return;
    }
    Alert.alert('Snap it', 'Catch it as a picture.', [
      { text: 'Take a photo', onPress: shoot },
      { text: 'Choose an existing one', onPress: pick },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [shoot, pick]);

  const dismissError = useCallback(() => setError(null), []);

  return { error, choose, shoot, dismissError };
}
