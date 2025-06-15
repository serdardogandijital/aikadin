import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import CONFIG from '../config/env';

interface VirtualTryOnRequest {
  personImage: string;
  clothingImage: string;
  category?: 'upper_body' | 'lower_body' | 'dresses' | 'full_body';
}

interface VirtualTryOnResponse {
  resultImage: string;
  success: boolean;
  error?: string;
  processingTime?: number;
}

class VirtualTryOnService {
  private readonly REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
  private readonly MODEL_VERSION = 'yisol/idm-vton:c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4';
  private readonly timeout = 300000; // 5 minutes for AI processing

  /**
   * Main virtual try-on processing using Replicate API
   */
  async processVirtualTryOn(request: VirtualTryOnRequest): Promise<VirtualTryOnResponse> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting Replicate virtual try-on...');
      
      // Validate inputs
      if (!request.personImage || !request.clothingImage) {
        throw new Error('Person image and clothing image are required');
      }

      if (!CONFIG.REPLICATE_API_KEY) {
        throw new Error('Replicate API key not configured');
      }

      // Convert images to base64 if they're file URIs
      const personBase64 = await this.convertToBase64(request.personImage);
      const clothingBase64 = await this.convertToBase64(request.clothingImage);

      // Create prediction on Replicate
      const prediction = await this.createReplicatePrediction(
        personBase64,
        clothingBase64,
        request.category
      );

      console.log('📊 Prediction created:', prediction.id);

      // Poll for results
      const result = await this.pollForResult(prediction.id);

      console.log('✅ Virtual try-on completed successfully');
      
      return {
        resultImage: result,
        success: true,
        processingTime: Date.now() - startTime
      };

    } catch (error) {
      console.error('❌ Virtual try-on error:', error);
      
      return {
        resultImage: request.personImage, // Fallback to original
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * Convert image URI to base64 data URL
   */
  private async convertToBase64(imageUri: string): Promise<string> {
    try {
      console.log('🔄 Converting image to base64...');
      
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('❌ Base64 conversion error:', error);
      throw new Error('Failed to convert image to base64');
    }
  }

  /**
   * Create prediction on Replicate
   */
  private async createReplicatePrediction(
    personImage: string,
    clothingImage: string,
    category?: string
  ): Promise<any> {
    try {
      console.log('🌐 Creating Replicate prediction...');
      
      const response = await fetch(this.REPLICATE_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${CONFIG.REPLICATE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: this.MODEL_VERSION,
          input: {
            human_img: personImage,
            garm_img: clothingImage,
            garment_des: this.getGarmentDescription(category),
            is_checked: true,
            is_checked_crop: false,
            denoise_steps: 30,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Replicate API error: ${response.status} - ${errorData}`);
      }

      const prediction = await response.json();
      console.log('✅ Prediction created successfully');
      
      return prediction;
    } catch (error) {
      console.error('❌ Replicate prediction error:', error);
      throw error;
    }
  }

  /**
   * Poll Replicate for prediction results
   */
  private async pollForResult(predictionId: string): Promise<string> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds
    
    console.log('⏳ Polling for results...');
    
    while (Date.now() - startTime < this.timeout) {
      try {
        const response = await fetch(`${this.REPLICATE_API_URL}/${predictionId}`, {
          headers: {
            'Authorization': `Token ${CONFIG.REPLICATE_API_KEY}`,
          }
        });

        if (!response.ok) {
          throw new Error(`Polling error: ${response.status}`);
        }

        const prediction = await response.json();
        console.log('📊 Prediction status:', prediction.status);

        if (prediction.status === 'succeeded') {
          if (prediction.output && prediction.output.length > 0) {
            const resultUrl = prediction.output[0];
            console.log('✅ Result received:', resultUrl);
            
            // Download and save the result
            const localPath = await this.downloadResult(resultUrl);
            return localPath;
          } else {
            throw new Error('No output received from prediction');
          }
        } else if (prediction.status === 'failed') {
          throw new Error(`Prediction failed: ${prediction.error || 'Unknown error'}`);
        } else if (prediction.status === 'canceled') {
          throw new Error('Prediction was canceled');
        }

        // Still processing, wait and try again
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
      } catch (error) {
        console.error('❌ Polling error:', error);
        throw error;
      }
    }

    throw new Error('Prediction timed out');
  }

  /**
   * Download result from URL and save locally
   */
  private async downloadResult(resultUrl: string): Promise<string> {
    try {
      console.log('⬇️ Downloading result...');
      
      const timestamp = Date.now();
      const filename = `virtual_tryOn_result_${timestamp}.jpg`;
      const localPath = `${FileSystem.documentDirectory}${filename}`;

      const downloadResult = await FileSystem.downloadAsync(resultUrl, localPath);
      
      console.log('✅ Result downloaded to:', downloadResult.uri);
      return downloadResult.uri;
      
    } catch (error) {
      console.error('❌ Download error:', error);
      throw new Error('Failed to download result');
    }
  }

  /**
   * Get garment description for better results
   */
  private getGarmentDescription(category?: string): string {
    const descriptions = {
      'upper_body': 'A stylish upper body garment like shirt, blouse, or top',
      'lower_body': 'A fashionable lower body garment like pants, skirt, or shorts',
      'dresses': 'An elegant dress or gown',
      'full_body': 'A complete outfit or full-body garment'
    };
    
    return descriptions[category || 'upper_body'] || descriptions.upper_body;
  }

  /**
   * Save result to device gallery
   */
  async saveToGallery(imageUri: string): Promise<string> {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Gallery permission required');
      }

      const asset = await MediaLibrary.createAssetAsync(imageUri);
      return asset.uri;
    } catch (error) {
      console.error('Save to gallery error:', error);
      throw new Error('Could not save to gallery');
    }
  }

  /**
   * Process multiple clothing items
   */
  async processBatch(
    personImage: string,
    clothingImages: string[]
  ): Promise<VirtualTryOnResponse[]> {
    const results: VirtualTryOnResponse[] = [];
    
    for (const clothingImage of clothingImages) {
      try {
        const result = await this.processVirtualTryOn({
          personImage,
          clothingImage,
          category: 'upper_body'
        });
        results.push(result);
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        results.push({
          resultImage: personImage,
          success: false,
          error: error instanceof Error ? error.message : 'Batch processing error'
        });
      }
    }
    
    return results;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ available: boolean; status: string }> {
    try {
      if (!CONFIG.REPLICATE_API_KEY) {
        return {
          available: false,
          status: 'Replicate API key not configured'
        };
      }

      // Test API connectivity
      const response = await fetch('https://api.replicate.com/v1/models', {
        headers: {
          'Authorization': `Token ${CONFIG.REPLICATE_API_KEY}`,
        }
      });

      return {
        available: response.ok,
        status: response.ok ? 'Ready - Replicate API Connected' : 'API Connection Failed'
      };
    } catch (error) {
      return {
        available: false,
        status: 'Connection Error'
      };
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanup(): Promise<void> {
    try {
      const documentDir = FileSystem.documentDirectory;
      if (!documentDir) return;
      
      const files = await FileSystem.readDirectoryAsync(documentDir);
      const tempFiles = files.filter(file => 
        file.startsWith('virtual_tryOn_result_')
      );
      
      for (const file of tempFiles) {
        await FileSystem.deleteAsync(`${documentDir}${file}`, { idempotent: true });
      }
      
      console.log(`🧹 Cleaned up ${tempFiles.length} temporary files`);
    } catch (error) {
      console.warn('Cleanup error:', error);
    }
  }

  /**
   * Cancel ongoing prediction
   */
  async cancelPrediction(predictionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.REPLICATE_API_URL}/${predictionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${CONFIG.REPLICATE_API_KEY}`,
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Cancel prediction error:', error);
      return false;
    }
  }

  /**
   * Test Replicate API connection
   */
  async testApiConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔍 Testing Replicate API connection...');
      
      if (!CONFIG.REPLICATE_API_KEY) {
        return {
          success: false,
          message: 'API key not configured'
        };
      }

      const response = await fetch('https://api.replicate.com/v1/models/yisol/idm-vton', {
        headers: {
          'Authorization': `Token ${CONFIG.REPLICATE_API_KEY}`,
        }
      });

      if (response.ok) {
        console.log('✅ Replicate API connection successful');
        return {
          success: true,
          message: 'API connection successful - Ready for virtual try-on!'
        };
      } else {
        console.error('❌ API connection failed:', response.status);
        return {
          success: false,
          message: `API connection failed: ${response.status}`
        };
      }
    } catch (error) {
      console.error('❌ API test error:', error);
      return {
        success: false,
        message: 'Network error - Check internet connection'
      };
    }
  }
}

export default new VirtualTryOnService();