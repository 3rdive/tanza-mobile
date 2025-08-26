// OTPVerificationScreen.tsx
import { DEFAULT_COUNTRY_CODE } from "@/lib/constants";
import { useAuthFlow } from "@/redux/hooks/hooks";
import { router } from "expo-router";
import React, { useState, useRef, useEffect } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 SafeAreaView,
 TextInput,
 Alert,
 NativeSyntheticEvent,
 TextInputKeyPressEventData,
} from 'react-native';

export default function OTPVerificationScreen() {

 const { mobile, clearState } = useAuthFlow();
 const [otp, setOtp] = useState(['', '', '', '']);
 const [timer, setTimer] = useState(60);
 const inputRefs = useRef<any[]>([]);

 useEffect(() => {
	const interval = setInterval(() => {
	 setTimer((prev) => (prev > 0 ? prev - 1 : 0));
	}, 1000);
	return () => clearInterval(interval);
 }, []);

 const handleOtpChange = (value: string, index: number) => {
	const newOtp = [...otp];
	newOtp[index] = value;
	setOtp(newOtp);

	if (value && index < 3) {
	 inputRefs.current[index + 1].focus();
	}

	if (newOtp.every(digit => digit !== '')) {
	 // Auto-verify when all digits are entered
	 setTimeout(() => {
		// navigation.navigate('EmailEntry');
	 }, 500);
	}
 };

 const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
	if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
	 inputRefs.current[index - 1].focus();
	}
 };

 const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
 };

 return (
	 <SafeAreaView style={styles.container}>
		<View style={styles.content}>
		 <TouchableOpacity
			 style={styles.backButton}
			 onPress={() => router.back()}
		 >
			<Text style={styles.backArrow}>←</Text>
		 </TouchableOpacity>

		 <Text style={styles.title}>
			Enter the 4-digit code sent to you at {`+${DEFAULT_COUNTRY_CODE} ${mobile}`}
		 </Text>

		 <TouchableOpacity style={styles.changeNumberButton}
		  onPress={() =>{
			 clearState()
			 router.replace('/auth/mobile-entry')
			} }
		 >
			<Text style={styles.changeNumberText}>Changed your mobile number?</Text>
		 </TouchableOpacity>

		 <View style={styles.otpContainer}>
			{otp.map((digit, index) => (
				<TextInput
					key={index}
					ref={(ref) => (inputRefs.current[index] = ref as any)}
					style={[
					 styles.otpInput,
					 digit && styles.otpInputFilled
					]}
					value={digit}
					onChangeText={(value) => handleOtpChange(value, index)}
					onKeyPress={(e) => handleKeyPress(e, index)}
					keyboardType="numeric"
					maxLength={1}
					textAlign="center"
				/>
			))}
		 </View>

		 <TouchableOpacity
			 style={[styles.resendButton, timer > 0 && styles.disabledButton]}
			 disabled={timer > 0}
		 >
			<Text style={[styles.resendText, timer > 0 && { opacity: 7}]}>
			 {timer > 0 ? `Resend code via SMS (${formatTime(timer)})` : 'Resend code via SMS'}
			</Text>
		 </TouchableOpacity>

		 <TouchableOpacity
			 style={[
				styles.nextButton,
				!otp.every(digit => digit !== '') && styles.disabledButton
			 ]}
			 onPress={() => router.replace('/auth/email-entry')}
			 disabled={!otp.every(digit => digit !== '')}
		 >
			<Text style={[
			 styles.nextText,
			 !otp.every(digit => digit !== '') && styles.disabledText
			]}>
			 Next →
			</Text>
		 </TouchableOpacity>
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
	marginBottom: 20,
	lineHeight: 36,
 },
 changeNumberButton: {
	marginBottom: 40,
 },
 changeNumberText: {
	fontSize: 16,
	color: '#000',
	textDecorationLine: 'underline',
 },
 otpContainer: {
	flexDirection: 'row',
	justifyContent: 'flex-start',
	gap: 10,
	marginBottom: 30,
 },
 otpInput: {
	width: 60,
	height: 60,
	borderWidth: 2,
	borderColor: '#e0e0e0',
	borderRadius: 12,
	fontSize: 24,
	fontWeight: 'bold',
	textAlign: 'center',
 },
 otpInputFilled: {
	borderColor: '#000',
	backgroundColor: '#f9f9f9',
 },
 resendButton: {
	marginBottom: 40,
 },
 resendText: {
	fontSize: 16,
	color: '#666',
 },
 disabledButton: {
	opacity: 0.5,
 },
 disabledText: {
	color: '#ccc',
 },
 nextButton: {
	position: 'absolute',
	bottom: 40,
	right: 24,
	backgroundColor: '#000',
	paddingHorizontal: 24,
	paddingVertical: 12,
	borderRadius: 25,
 },
 nextText: {
	color: '#fff',
	fontSize: 16,
	fontWeight: '600',
 },
});