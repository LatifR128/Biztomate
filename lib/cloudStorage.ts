import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from './firebase';

export const uploadCardImage = async (imageUri: string, cardId: string): Promise<string> => {
  try {
    const currentUser = auth?.currentUser;
    if (!currentUser || !storage) {
      throw new Error('User not authenticated or storage not available');
    }
    
    // Convert image URI to blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // Create storage reference
    const storageRef = ref(storage, `cards/${currentUser.uid}/${cardId}/image.jpg`);
    
    // Upload image
    await uploadBytes(storageRef, blob);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const deleteCardImage = async (cardId: string): Promise<void> => {
  try {
    const currentUser = auth?.currentUser;
    if (!currentUser || !storage) {
      throw new Error('User not authenticated or storage not available');
    }
    
    const storageRef = ref(storage, `cards/${currentUser.uid}/${cardId}/image.jpg`);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
}; 