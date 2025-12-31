/**
 * useX402Payment Hook
 * Handles X402 payments for prompt unlocking and image generation
 */

import { useState } from "react";
import { type ChainKey } from "../../../shared/payment-config";

export interface ImageGenerationSettings {
  prompt: string;
  evil?: number;
  middleFinger?: boolean;
  cameraEffects?: string[];
  aspectRatio?: string;
  resolution?: '1K' | '2K' | '4K';
  referenceImage?: string;
}

/**
 * Custom hook for X402 payment operations
 *
 * @example
 * const { unlockPrompt, generateImage, isPending } = useX402Payment();
 *
 * // Unlock a prompt
 * const promptContent = await unlockPrompt('prompt-id-123', 'base-sepolia');
 *
 * // Generate an image
 * const image = await generateImage({ prompt: 'A cat', resolution: '2K' }, 'base-sepolia');
 */
export function useX402Payment() {
  const [isPending, setIsPending] = useState(false);

  /**
   * Unlock encrypted prompt content
   *
   * @param promptId - ID of the prompt to unlock
   * @param chain - Blockchain network to use for payment
   * @returns Decrypted prompt content
   */
  const unlockPrompt = async (promptId: string, chain: ChainKey = 'base-sepolia') => {
    setIsPending(true);
    try {
      const response = await fetch(
        `/api/prompts/${promptId}/content?chain=${chain}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status === 402) {
        // Payment required - the response will contain payment instructions
        const paymentData = await response.json();
        throw new Error(`Payment required: ${paymentData.message || 'Please complete payment to access this content'}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to unlock prompt:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Generate AI image with payment
   *
   * @param settings - Image generation settings
   * @param chain - Blockchain network to use for payment
   * @returns Generated image URL
   */
  const generateImage = async (
    settings: ImageGenerationSettings,
    chain: ChainKey = 'base-sepolia'
  ) => {
    setIsPending(true);
    try {
      const response = await fetch(
        `/api/generate-image?chain=${chain}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );

      if (response.status === 402) {
        // Payment required - the response will contain payment instructions
        const paymentData = await response.json();
        throw new Error(`Payment required: ${paymentData.message || 'Please complete payment to generate image'}`);
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Failed to generate image:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  /**
   * Get payment status information
   */
  const getPaymentStatus = () => {
    return {
      isPending,
      isReady: !isPending,
    };
  };

  return {
    unlockPrompt,
    generateImage,
    isPending,
    getPaymentStatus,
  };
}

/**
 * Helper hook to check if user can make payments
 * (Has wallet connected and sufficient balance)
 */
export function usePaymentReady() {
  // This will be expanded later to check wallet connection and balance
  return {
    isReady: true, // TODO: Implement wallet connection check
    needsConnection: false,
    needsFunding: false,
  };
}
