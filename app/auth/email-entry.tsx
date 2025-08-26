// EmailEntryScreen.tsx
import { useAuthFlow } from "@/redux/hooks/hooks";
import { router } from "expo-router";
import React, { useEffect, useState } from 'react';
import {
 View,
 Text,
 StyleSheet,
 TouchableOpacity,
 SafeAreaView,
 TextInput,
 Alert,
} from 'react-native';

export default function EmailEntryScreen() {
 const [email, setEmail] = useState('');
 const {setEmail: setAuthEmail, mobile, clearState} = useAuthFlow();

 const validateEmail = (email: string) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
 };

 const handleNext = () => {
	if (!validateEmail(email)) {
	 Alert.alert('Invalid Email', 'Please enter a valid email address');
	 return;
	}
	setAuthEmail(email);
	router.push('/auth/completion')
 };

 useEffect(() => {
	if(!mobile){
	 clearState()
	 router.replace('/auth/mobile-entry')
	}
 }, [mobile]);

 return (
	 <SafeAreaView style={styles.container}>
		<View style={styles.content}>
		 <Text style={styles.title}>Enter your email address</Text>
		 <Text style={styles.subtitle}>
			Add your email to aid in account recovery
		 </Text>

		 <View style={styles.inputContainer}>
			<Text style={styles.label}>Email</Text>
			<TextInput
				style={styles.emailInput}
				placeholder="name@example.com"
				value={email}
				onChangeText={setEmail}
				keyboardType="email-address"
				autoCapitalize="none"
				autoCorrect={false}
			/>
		 </View>

		 <TouchableOpacity
			 style={[
				styles.nextButton,
				!validateEmail(email) && styles.disabledButton
			 ]}
			 onPress={handleNext}
			 disabled={!validateEmail(email)}
		 >
			<Text style={[
			 styles.nextText,
			 !validateEmail(email) && styles.disabledText
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
	marginBottom: 8,
 },
 subtitle: {
	fontSize: 16,
	color: '#666',
	marginBottom: 40,
	lineHeight: 22,
 },
 inputContainer: {
	marginBottom: 40,
 },
 label: {
	fontSize: 16,
	color: '#000',
	marginBottom: 8,
	fontWeight: '500',
 },
 emailInput: {
	borderWidth: 2,
	borderColor: '#e0e0e0',
	borderRadius: 12,
	paddingHorizontal: 16,
	paddingVertical: 16,
	fontSize: 16,
	backgroundColor: '#fff',
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
 disabledButton: {
	backgroundColor: '#ccc',
 },
 nextText: {
	color: '#fff',
	fontSize: 16,
	fontWeight: '600',
 },
 disabledText: {
	color: '#999',
 },
});