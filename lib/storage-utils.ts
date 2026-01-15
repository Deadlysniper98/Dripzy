import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Downloads an image from a URL and uploads it to Firebase Storage
 * @param url The source URL of the image
 * @param destinationPath The path in Firebase Storage where the image should be saved (e.g., 'products/slug/image-1.jpg')
 * @returns The public download URL of the uploaded image
 */
export async function uploadImageFromUrl(url: string, destinationPath: string): Promise<string> {
    try {
        // 1. Fetch the image
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();

        // 2. Upload to Firebase Storage
        const storageRef = ref(storage, destinationPath);
        const metadata = {
            contentType: response.headers.get('content-type') || 'image/jpeg',
            customMetadata: {
                originalUrl: url
            }
        };

        await uploadBytes(storageRef, buffer, metadata);

        // 3. Get download URL
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error) {
        console.error(`Error uploading image from ${url} to ${destinationPath}:`, error);
        throw error;
    }
}
