import { useCallback, useState } from "react";

export const useUrgencyModal = (calculatedPrice: number | null) => {
  const [showUrgencyModal, setShowUrgencyModal] = useState(false);
  const [urgencyFeeInput, setUrgencyFeeInput] = useState("");
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null
  );

  const openModal = useCallback(() => {
    setShowUrgencyModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowUrgencyModal(false);
    setUrgencyFeeInput("");
    setSelectedPercentage(null);
  }, []);

  const selectPercentage = useCallback((percentage: number) => {
    setSelectedPercentage(percentage);
    setUrgencyFeeInput("");
  }, []);

  const setCustomInput = useCallback((input: string) => {
    setUrgencyFeeInput(input);
    setSelectedPercentage(null);
  }, []);

  const calculateFeeAmount = useCallback((): number | null => {
    if (selectedPercentage && calculatedPrice) {
      return Math.round((calculatedPrice * selectedPercentage) / 100);
    } else if (urgencyFeeInput) {
      const inputValue = parseFloat(urgencyFeeInput);
      if (isNaN(inputValue) || inputValue <= 0) {
        return null;
      }
      return Math.round(inputValue);
    }
    return null;
  }, [selectedPercentage, calculatedPrice, urgencyFeeInput]);

  const resetUrgencyInputs = useCallback(() => {
    setUrgencyFeeInput("");
    setSelectedPercentage(null);
  }, []);

  return {
    showUrgencyModal,
    urgencyFeeInput,
    selectedPercentage,
    openModal,
    closeModal,
    selectPercentage,
    setCustomInput,
    calculateFeeAmount,
    resetUrgencyInputs,
  };
};
