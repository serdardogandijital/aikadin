import CONFIG from '../config/env';

export class APIError extends Error {
  constructor(message: string, public status?: number, public endpoint?: string) {
    super(message);
    this.name = 'APIError';
  }
}

class APIService {
  private readonly timeout: number;

  constructor() {
    this.timeout = CONFIG.APP_CONFIG.apiTimeout;
  }

  /**
   * Enhanced fetch with timeout and retry logic
   */
  private async fetchWithTimeout(
    url: string, 
    options: RequestInit, 
    timeout: number = this.timeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new APIError(`Request timeout after ${timeout}ms`, 408, url);
      }
      throw new APIError(`Network error: ${error.message}`, 0, url);
    }
  }

  /**
   * Retry mechanism for failed requests
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (attempt < maxRetries) {
          console.warn(`API request failed, retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError!;
  }

  /**
   * OpenAI API integration
   */
  async callOpenAI(messages: any[], model: string = 'gpt-3.5-turbo'): Promise<string> {
    const apiKey = CONFIG.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found, using test mode');
      return this.getTestAIResponse(messages);
    }

    // Check if user is asking for fashion advice that could benefit from GPT-4
    const shouldUseGPT4 = this.shouldUseAdvancedModel(messages);
    const selectedModel = shouldUseGPT4 ? 'gpt-4o' : model;

    return this.retryRequest(async () => {
      const response = await this.fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModel,
          messages,
          max_tokens: 800,
          temperature: 0.7,
          presence_penalty: 0.3,
          frequency_penalty: 0.3,
          // Add fashion-related stop sequences to prevent rambling
          stop: ["NOT FASHION ADVICE:", "END OF ADVICE"],
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new APIError(
          `OpenAI API error: ${response.status} ${errorData}`,
          response.status,
          'openai'
        );
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || 'AI yanıtı alınamadı.';
    });
  }

  /**
   * Determines if a more advanced model should be used based on the query complexity
   */
  private shouldUseAdvancedModel(messages: any[]): boolean {
    // Get the last user message
    const lastUserMessage = messages.findLast(
      msg => typeof msg === 'object' && msg.role === 'user'
    );
    
    if (!lastUserMessage || !lastUserMessage.content) return false;
    
    const content = lastUserMessage.content.toLowerCase();
    
    // Complex queries that benefit from GPT-4's capabilities
    const complexQueryIndicators = [
      'kombin önerisi',
      'stil analizi',
      'vücut tipime göre',
      'özel etkinlik',
      'düğün',
      'mezuniyet',
      'renk uyumu',
      'sezon trendi',
      'nasıl kombinlerim',
      'hangi renk yakışır',
      'gardırop düzenleme',
      'kapsül gardırop'
    ];
    
    // Check if any complex query indicators are present
    return complexQueryIndicators.some(indicator => content.includes(indicator));
  }

  /**
   * Resize and convert image to base64
   */
  private async imageToBase64(imageUri: string): Promise<string> {
    try {
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve, reject) => {
        img.onload = () => {
          // Calculate new dimensions (max 800px)
          const maxSize = 800;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);
          const base64 = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
          resolve(base64);
        };
        
        img.onerror = () => {
          // Fallback to simple fetch if canvas fails
          fetch(imageUri)
            .then(response => response.blob())
            .then(blob => {
              const reader = new FileReader();
              reader.onloadend = () => {
                resolve(reader.result as string);
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            })
            .catch(reject);
        };
        
        img.src = imageUri;
      });
    } catch (error) {
      // Simple fallback
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  }

  /**
   * ChatGPT-based Virtual Try-On Analysis
   */
  async callVirtualTryOn(imageData: {
    userImage: string;
    clothingImage: string;
  }): Promise<string> {
    const apiKey = CONFIG.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('OpenAI API key not found, using test mode');
      return this.getTestTryOnResult();
    }

    return this.retryRequest(async () => {
      // Convert images to base64
      const userImageBase64 = await this.imageToBase64(imageData.userImage);
      const clothingImageBase64 = await this.imageToBase64(imageData.clothingImage);

      // Analyze the images with GPT-4o for detailed style matching
      const analysisMessages = [
        {
          role: 'system',
          content: 'Sen bir profesyonel moda danışmanısın. Verilen kişi ve kıyafet fotoğraflarını analiz ederek, kıyafetin kişi üzerinde nasıl duracağına dair detaylı, profesyonel ve yararlı analiz yaparsın.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Bu kişi ve kıyafet fotoğraflarını analiz ederek detaylı bir sanal deneme raporu hazırla. Şunları analiz et: 1) Renk uyumu ve ten rengi ile uyum 2) Beden ve vücut tipine uygunluk 3) Stil ve tarz uyumu 4) Kombin önerileri 5) Genel değerlendirme. Türkçe ve samimi bir dille yaz.'
            },
            {
              type: 'image_url',
              image_url: {
                url: userImageBase64
              }
            },
            {
              type: 'image_url', 
              image_url: {
                url: clothingImageBase64
              }
            }
          ]
        }
      ];

      const analysisResponse = await this.fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: analysisMessages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!analysisResponse.ok) {
        const errorData = await analysisResponse.text();
        throw new APIError(
          `Analysis API error: ${analysisResponse.status} ${errorData}`,
          analysisResponse.status,
          'analysis'
        );
      }

      const analysisData = await analysisResponse.json();
      return analysisData.choices?.[0]?.message?.content || 'Analiz tamamlanamadı.';
    });
  }

  /**
   * Test AI response for development
   */
  private async getTestAIResponse(messages: any[]): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lastMessage = messages[messages.length - 1]?.content || '';
    
    const responses = [
      'Bu harika bir stil seçimi! Size çok yakışacağını düşünüyorum. Özellikle renk uyumu açısından mükemmel.',
      'Bu kombin ile ilgili birkaç önerim var. Öncelikle, bu tarz size çok uygun ancak aksesuar olarak...',
      'Seçtiğiniz kıyafet trend ve şık! Vücut tipinize de çok uygun. Kombinlemek için şunları önerebilirim...',
      'Mükemmel bir seçim! Bu parça gardırobunuzun vazgeçilmezi olacak. Farklı kombinlerle...'
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }

  /**
   * Test virtual try-on result
   */
  private async getTestTryOnResult(): Promise<string> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return `🌟 **AI Sanal Deneme Analizi** 🌟

🎨 **Renk Uyumu Analizi:**
Bu kıyafet ten renginizle mükemmel uyum sağlıyor! Seçtiğiniz renk doğal tonlarınızı öne çıkarıyor ve cildinizi daha aydınlık gösteriyor.

👗 **Beden & Vücut Tipi Uygunluğu:**
Kıyafetin kesi vücut tipinize çok uygun. Silüetinizi güzel tamamlıyor ve vücut hatlarınızı avantajlı şekilde vurguluyor.

✨ **Stil & Tarz Değerlendirmesi:**
Bu parça kişisel stilinizle perfect uyum halinde! Hem günlük hem de özel anlarda rahatlıkla kullanabileceğiniz çok şık bir seçim.

💫 **Kombin Önerileri:**
• Üzerine açık renkli bir blazer ekleyebilirsiniz
• Ayakkabı olarak klasik topuklu veya şık sneaker mükemmel olur  
• Minimal takılar ile tamamlayın
• Çanta olarak aynı ton aile renkleri tercih edin

⭐ **Genel Değerlendirme:**
Bu kıyafet size gerçekten çok yakışacak! Hem rahat hem şık, tam size göre bir parça. Gardırobunuzun vazgeçilmezi olacak.

💡 **Bonus İpucu:** Bu kıyafeti farklı aksesuarlarla değiştirerek çok farklı kombinler yapabilirsiniz.`;
  }

  /**
   * Health check for API services
   */
  async healthCheck(): Promise<{ openai: boolean }> {
    return {
      openai: !!CONFIG.OPENAI_API_KEY,
    };
  }
}

export default new APIService(); 