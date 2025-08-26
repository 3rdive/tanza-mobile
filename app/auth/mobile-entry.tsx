// MobileEntryScreen.tsx
import { Divider } from "@/components/divider";
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants";
import { useAuthFlow } from "@/redux/hooks/hooks";
import { manropeFonts } from "@/theme/fonts";
import { AntDesign, Entypo } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useState } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 SafeAreaView,
 TextInput,
 Alert,
} from 'react-native';

export default function MobileEntryScreen() {
 const [phoneNumber, setPhoneNumber] = useState('');
 const countryCode = `+${DEFAULT_COUNTRY_CODE}`
	const {setMobile} = useAuthFlow();
 const handleContinue = () => {
	if (phoneNumber.length < 10) {
	 Alert.alert('Invalid Number', 'Please enter a valid phone number');
	 return;
	}

	setMobile(phoneNumber);
	router.push('/auth/otp-verification')
 };

 return (
	 <SafeAreaView style={styles.container}>
		<View style={styles.content}>
		 <Text style={styles.title}>Enter your mobile number</Text>
		 <Text style={styles.subtitle}>
			We&#39;ll send you a verification code to confirm your number
		 </Text>

		 <View style={styles.phoneContainer}>
			<TouchableOpacity style={styles.countrySelector}>
			 <Text style={styles.flag}>🇳🇬</Text>
			 <Text style={styles.countryCode}>{countryCode}</Text>
			 <Text style={styles.dropdown}>▼</Text>
			</TouchableOpacity>

			<TextInput
				style={styles.phoneInput}
				placeholder="9153065907"
				value={phoneNumber}
				onChangeText={setPhoneNumber}
				keyboardType="phone-pad"
				maxLength={10}
			/>
		 </View>

		 <TouchableOpacity
			 style={[styles.continueButton, phoneNumber.length < 10 && styles.disabledButton]}
			 onPress={handleContinue}
			 disabled={phoneNumber.length < 10}
		 >
			<Text style={[styles.continueText, phoneNumber.length < 10 && styles.disabledText]}>
			 Continue
			</Text>
		 </TouchableOpacity>
		 <TouchableOpacity style={styles.socialButton}>
			<Entypo name="app-store" size={19} color="black" />
			<Text style={styles.socialText}>Signup with Apple</Text>
		 </TouchableOpacity>

		 <TouchableOpacity style={styles.socialButton}>
			{/*<Text style={styles.socialIcon}>G</Text>*/}
			<AntDesign name="google" size={19}  />
			<Text style={styles.socialText}>Signup with Google</Text>
		 </TouchableOpacity>
		 <Divider />

		 <TouchableOpacity
			 style={[styles.continueButton, phoneNumber.length >= 10 && styles.disabledButton]}
			 onPress={() => router.replace('/auth/sign-in')}
			 disabled={phoneNumber.length >= 10}
		 >
			<Text style={[styles.continueText, phoneNumber.length >= 10 && styles.disabledText]}>
			 Sign In
			</Text>
		 </TouchableOpacity>


		 <Text style={styles.disclaimer}>
			By proceeding, you consent to get calls, WhatsApp or SMS messages,
			including by automated means, from LogiFlow and its affiliates to the number provided. <Link href={".."} >And Here by Agree to our terms and condition</Link>
		 </Text>
		</View>
	 </SafeAreaView>
 );
}

const styles = StyleSheet.create({
 container: {
	flex: 1,
	backgroundColor: '#fff',
 },
 content: {
	flex: 1,
	paddingHorizontal: 24,
	paddingTop: 20,
 },
 backButton: {
	width: 40,
	height: 40,
	justifyContent: 'center',
	marginBottom: 20,
 },
 backArrow: {
	fontSize: 24,
	color: '#000',
 },
 title: {
	fontSize: 28,
	fontWeight: 'bold',
	color: '#000',
	marginBottom: 8,
 },
 subtitle: {
	fontSize: 16,
	color: '#666',
	marginBottom: 40,
	lineHeight: 22,
 },
 phoneContainer: {
	flexDirection: 'row',
	marginBottom: 30,
 },
 countrySelector: {
	flexDirection: 'row',
	alignItems: 'center',
	backgroundColor: '#f5f5f5',
	paddingHorizontal: 16,
	paddingVertical: 16,
	borderRadius: 12,
	marginRight: 12,
 },
 flag: {
	fontSize: 20,
	marginRight: 8,
 },
 countryCode: {
	fontSize: 16,
	color: '#000',
	marginRight: 8,
 },
 dropdown: {
	fontSize: 12,
	color: '#666',
 },
 phoneInput: {
	flex: 1,
	backgroundColor: '#f5f5f5',
	paddingHorizontal: 16,
	paddingVertical: 16,
	borderRadius: 12,
	fontSize: 16,
 },
 continueButton: {
	backgroundColor: '#000',
	paddingVertical: 16,
	borderRadius: 12,
	alignItems: 'center',
	marginBottom: 30,
 },
 disabledButton: {
	backgroundColor: '#ccc',
 },
 continueText: {
	color: '#fff',
	fontSize: 18,
	fontWeight: '600',
 },
 disabledText: {
	color: '#999',
 },
 socialButton: {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'center',
	backgroundColor: '#f5f5f5',
	gap: 10,
	paddingVertical: 16,
	paddingHorizontal: 20,
	fontFamily: manropeFonts.bold,
	borderRadius: 12,
	marginBottom: 12,
 },
 socialIcon: {
	fontSize: 20,
	marginRight: 16,
 },
 socialText: {
	fontSize: 16,
	color: '#000',
	fontWeight: '500',
 },
 disclaimer: {
	fontSize: 12,
	color: '#666',
	lineHeight: 18,
	marginTop: 20,
	textAlign: 'center',
 },
});