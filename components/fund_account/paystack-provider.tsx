import { PaystackProvider } from "react-native-paystack-webview";

export const CustomPaystackProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <PaystackProvider
      debug
      publicKey={"pk_test_d6270c16dba0284483056ecffac2482a1e438d7a"}
      currency={"NGN"}
      defaultChannels={[
        "bank",
        "card",
        "qr",
        "ussd",
        "mobile_money",
        "bank_transfer",
        "eft",
        "apple_pay",
      ]}
    >
      {children}
    </PaystackProvider>
  );
};
