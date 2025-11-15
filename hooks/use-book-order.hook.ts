import { orderService } from "@/lib/api";
import { AddressBookEntry } from "@/types/booking.types";
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

type UpdateFieldFn = (...args: any[]) => void;

export function useBookOrder(options: {
  user: any | null;
  updateSenderField: UpdateFieldFn;
  updateRecipientField: UpdateFieldFn;
  isFocused?: boolean;
}) {
  const { user, updateSenderField, updateRecipientField, isFocused } = options;

  const [addressBook, setAddressBook] = useState<AddressBookEntry[]>([]);
  const [isLoadingAddressBook, setIsLoadingAddressBook] = useState(false);
  const [useSenderMyInfo, setUseSenderMyInfo] = useState(false);
  const [useRecipientMyInfo, setUseRecipientMyInfo] = useState(false);

  useEffect(() => {
    const fetchAddressBook = async () => {
      try {
        setIsLoadingAddressBook(true);
        const response = await orderService.getAddressBook();
        if (response?.success && response.data) setAddressBook(response.data);
      } catch (err) {
        // keep errors local - component can still render
        console.error("Failed to fetch address book:", err);
      } finally {
        setIsLoadingAddressBook(false);
      }
    };

    if (isFocused) fetchAddressBook();
  }, [isFocused]);

  const handleUseSenderMyInfo = useCallback(() => {
    if (useRecipientMyInfo) {
      Alert.alert(
        "Cannot use your info for both",
        "You cannot be both the sender and recipient. Please uncheck the recipient's 'Use my info' first."
      );
      return;
    }

    if (!useSenderMyInfo) {
      const userData = user as any;
      if (userData) {
        const fullName =
          userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : userData.firstName || userData.lastName || "";

        updateSenderField("name", fullName);
        updateSenderField("email", userData.email || "");
        updateSenderField("phone", userData.mobile || "");
        setUseSenderMyInfo(true);
      }
    } else {
      updateSenderField("name", "");
      updateSenderField("email", "");
      updateSenderField("phone", "");
      setUseSenderMyInfo(false);
    }
  }, [useSenderMyInfo, useRecipientMyInfo, user, updateSenderField]);

  const handleUseRecipientMyInfo = useCallback(() => {
    if (useSenderMyInfo) {
      Alert.alert(
        "Cannot use your info for both",
        "You cannot be both the sender and recipient. Please uncheck the sender's 'Use my info' first."
      );
      return;
    }

    if (!useRecipientMyInfo) {
      const userData = user as any;
      if (userData) {
        const fullName =
          userData.firstName && userData.lastName
            ? `${userData.firstName} ${userData.lastName}`.trim()
            : userData.firstName || userData.lastName || "";

        updateRecipientField("name", fullName);
        updateRecipientField("email", userData.email || "");
        updateRecipientField("phone", userData.mobile || "");
        setUseRecipientMyInfo(true);
      }
    } else {
      updateRecipientField("name", "");
      updateRecipientField("email", "");
      updateRecipientField("phone", "");
      setUseRecipientMyInfo(false);
    }
  }, [useRecipientMyInfo, useSenderMyInfo, user, updateRecipientField]);

  const handleSelectSenderFromAddressBook = useCallback(
    (entry: AddressBookEntry) => {
      updateSenderField("name", entry.name);
      updateSenderField("email", entry.email);
      updateSenderField("phone", entry.phone);
      setUseSenderMyInfo(false);
    },
    [updateSenderField]
  );

  const handleSelectRecipientFromAddressBook = useCallback(
    (entry: AddressBookEntry) => {
      updateRecipientField("name", entry.name);
      updateRecipientField("email", entry.email);
      updateRecipientField("phone", entry.phone);
      setUseRecipientMyInfo(false);
    },
    [updateRecipientField]
  );

  const handleSearchAddressBook = useCallback(async (query: string) => {
    try {
      setIsLoadingAddressBook(true);
      const response = await orderService.getAddressBook(
        query.trim() || undefined
      );
      if (response?.success && response.data) setAddressBook(response.data);
    } catch (err) {
      console.error("Failed to search address book:", err);
    } finally {
      setIsLoadingAddressBook(false);
    }
  }, []);

  return {
    addressBook,
    isLoadingAddressBook,
    useSenderMyInfo,
    useRecipientMyInfo,
    handleUseSenderMyInfo,
    handleUseRecipientMyInfo,
    handleSelectSenderFromAddressBook,
    handleSelectRecipientFromAddressBook,
    handleSearchAddressBook,
    setAddressBook,
  } as const;
}

export default useBookOrder;
