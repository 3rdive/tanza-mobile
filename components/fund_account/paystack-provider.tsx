import {PaystackProvider} from "react-native-paystack-webview"

export const CustomPaystackProvider = ({children}: {children: React.ReactNode}) => {
	return (
		<PaystackProvider
			debug
			publicKey={process.env.EXPO_PUBLIC_PAYSTACK_KEY as string}
			currency={"NGN"}
			defaultChannels={["card", "apple_pay", "mobile_money", "ussd",]}
		>
		 {children}
		</PaystackProvider>
	)
}
