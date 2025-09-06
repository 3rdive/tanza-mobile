import { tzColors } from "@/theme/color";
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Share, Alert } from "react-native"
import { router, useLocalSearchParams } from "expo-router"
import type { JSX } from "react"
import { RFValue } from "react-native-responsive-fontsize"

const UI_SCALE = 0.82;
const rs = (n: number) => RFValue((n - 2) * UI_SCALE);

// Types for transactions and details specific to this screen
type TransactionType = "send" | "receive" | "fund"

type TransactionStatus = "completed" | "in_transit" | "pending" | "failed"

type BaseTransaction = {
  id: string
  type: TransactionType
  title: string
  subtitle: string
  amount: number
  date: string
  status: TransactionStatus
  // common optional fields
  trackingId?: string
  location?: string
  reference?: string
}

type SendReceiveDetails = BaseTransaction & {
  type: "send" | "receive"
  recipient?: string
  recipientPhone?: string
  sender?: string
  senderPhone?: string
  pickupAddress?: string
  deliveryAddress?: string
  packageDescription?: string
  weight?: string
  deliveryTime?: string
  courierName?: string
  courierPhone?: string
}

type FundDetails = BaseTransaction & {
  type: "fund"
  paymentMethod: string
  bankName?: string
  accountNumber?: string
  sessionId?: string
}

type TransactionDetailType = SendReceiveDetails | FundDetails

// Add this type guard
const isSendOrReceive = (t: TransactionDetailType): t is SendReceiveDetails =>
  t.type === "send" || t.type === "receive"

// Mock transaction detail data
const getTransactionDetail = (id: string): TransactionDetailType | null => {
 const mockTransactions: Record<string, TransactionDetailType> = {
	txn_001: {
	 id: "txn_001",
	 type: "send",
	 title: "Package to Lagos",
	 subtitle: "Delivered to John Smith • 2.5kg",
	 amount: -1500,
	 date: "2024-01-15T10:30:00Z",
	 status: "completed",
	 recipient: "John Smith",
	 recipientPhone: "+234 801 234 5678",
	 trackingId: "TZ001234567",
	 location: "Lagos, Nigeria",
	 pickupAddress: "123 Victoria Island, Lagos",
	 deliveryAddress: "456 Ikeja GRA, Lagos",
	 packageDescription: "Electronics - Laptop",
	 weight: "2.5kg",
	 deliveryTime: "2024-01-15T16:45:00Z",
	 courierName: "Ahmed Hassan",
	 courierPhone: "+234 802 345 6789",
	},
	txn_002: {
	 id: "txn_002",
	 type: "receive",
	 title: "Package from Abuja",
	 subtitle: "From Sarah Johnson • 1.2kg",
	 amount: 2000,
	 date: "2024-01-14T14:20:00Z",
	 status: "completed",
	 sender: "Sarah Johnson",
	 senderPhone: "+234 803 456 7890",
	 trackingId: "TZ001234568",
	 location: "Abuja, Nigeria",
	 pickupAddress: "789 Wuse 2, Abuja",
	 deliveryAddress: "321 Garki Area 11, Abuja",
	 packageDescription: "Documents - Legal Papers",
	 weight: "1.2kg",
	 deliveryTime: "2024-01-14T18:30:00Z",
	 courierName: "Fatima Abubakar",
	 courierPhone: "+234 804 567 8901",
	},
	txn_003: {
	 id: "txn_003",
	 type: "fund",
	 title: "Wallet Top-up",
	 subtitle: "Bank Transfer • GTBank",
	 amount: 5000,
	 date: "2024-01-13T09:15:00Z",
	 status: "completed",
	 paymentMethod: "Bank Transfer",
	 reference: "REF123456789",
	 bankName: "Guaranty Trust Bank",
	 accountNumber: "0123456789",
	 sessionId: "SES789456123",
	},
 }

 return mockTransactions[id] || mockTransactions.txn_002
}

export default function TransactionDetail(): JSX.Element {
  const { id } = useLocalSearchParams<{ id?: string }>()
 console.log("id: ",id)
  const transaction = id ? getTransactionDetail(id) : null

 if (!transaction) {
	return (
		<SafeAreaView style={styles.container}>
		 <View style={styles.header}>
			<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
			 <Text style={styles.backArrow}>←</Text>
			</TouchableOpacity>
			<Text style={styles.headerTitle}>Transaction Details</Text>
			<View style={styles.placeholder} />
		 </View>
		 <View style={styles.errorContainer}>
			<Text style={styles.errorText}>Transaction not found</Text>
		 </View>
		</SafeAreaView>
	)
 }

 const getTransactionIcon = (type: TransactionType): string => {
	switch (type) {
	 case "send":
		return "📤"
	 case "receive":
		return "📥"
	 case "fund":
		return "💰"
	 default:
		return "💳"
	}
 }

 const getStatusColor = (status: TransactionStatus): string => {
	switch (status) {
	 case "completed":
		return "#22c55e"
	 case "in_transit":
		return "#f59e0b"
	 case "pending":
		return "#6b7280"
	 case "failed":
		return "#ef4444"
	 default:
		return "#6b7280"
	}
 }

 const formatDate = (dateString: string): string => {
	const date = new Date(dateString)
	return date.toLocaleDateString("en-US", {
	 weekday: "long",
	 year: "numeric",
	 month: "long",
	 day: "numeric",
	 hour: "2-digit",
	 minute: "2-digit",
	})
 }

 const handleShare = async (): Promise<void> => {
	try {
	 const shareContent = `Transaction Details\n\nID: ${transaction.id}\nType: ${transaction.title}\nAmount: ₦${Math.abs(transaction.amount).toLocaleString()}\nDate: ${formatDate(transaction.date)}\nStatus: ${transaction.status}`

	 await Share.share({
		message: shareContent,
		title: "Transaction Details",
	 })
	} catch (error) {
	 Alert.alert("Error", "Failed to share transaction details")
	}
 }

 const DetailRow = ({ label, value, copyable = false }: { label: string; value: string; copyable?: boolean }): JSX.Element => (
	 <View style={styles.detailRow}>
		<Text style={styles.detailLabel}>{label}</Text>
		<TouchableOpacity
			style={styles.detailValueContainer}
			onPress={copyable ? () => Alert.alert("Copied", `${label} copied to clipboard`) : undefined}
		>
		 <Text style={styles.detailValue}>{value}</Text>
		 {copyable && <Text style={styles.copyIcon}>📋</Text>}
		</TouchableOpacity>
	 </View>
 )

 return (
	 <SafeAreaView style={styles.container}>
		<View style={styles.header}>
		 <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
			<Text style={styles.backArrow}>←</Text>
		 </TouchableOpacity>
		 <Text style={styles.headerTitle}>Transaction Details</Text>
		 <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
			<Text style={styles.shareIcon}>↗</Text>
		 </TouchableOpacity>
		</View>

		<ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
		 {/* Transaction Summary Card */}
		 <View style={styles.summaryCard}>
			<View style={styles.summaryHeader}>
			 <View style={styles.transactionIconContainer}>
				<Text style={styles.transactionIcon}>{getTransactionIcon(transaction.type)}</Text>
			 </View>
			 <View style={styles.summaryInfo}>
				<Text style={styles.summaryTitle}>{transaction.title}</Text>
				<Text style={styles.summarySubtitle}>{transaction.subtitle}</Text>
			 </View>
			</View>

			<View style={styles.amountContainer}>
			 <Text style={[styles.amount, transaction.amount > 0 ? styles.positiveAmount : styles.negativeAmount]}>
				{transaction.amount > 0 ? "+" : ""}₦{Math.abs(transaction.amount).toLocaleString()}
			 </Text>
			 <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
				<Text style={styles.statusText}>{transaction.status.replace("_", " ")}</Text>
			 </View>
			</View>
		 </View>

		 {/* Transaction Details */}
		 <View style={styles.detailsCard}>
			<Text style={styles.sectionTitle}>Transaction Information</Text>

			<DetailRow label="Transaction ID" value={transaction.id} copyable />
			<DetailRow label="Date & Time" value={formatDate(transaction.date)} />
			<DetailRow label="Status" value={transaction.status.replace("_", " ")} />

			{transaction.trackingId && <DetailRow label="Tracking ID" value={transaction.trackingId} copyable />}

			{transaction.reference && <DetailRow label="Reference" value={transaction.reference} copyable />}
		 </View>

		 {/* Package Details (for send/receive transactions) */}
		 {(transaction.type === "send" || transaction.type === "receive") && (
			 <View style={styles.detailsCard}>
				<Text style={styles.sectionTitle}>Package Details</Text>

				{transaction.packageDescription && <DetailRow label="Description" value={transaction.packageDescription} />}
				{transaction.weight && <DetailRow label="Weight" value={transaction.weight} />}
				{transaction.pickupAddress && <DetailRow label="Pickup Address" value={transaction.pickupAddress} />}
				{transaction.deliveryAddress && <DetailRow label="Delivery Address" value={transaction.deliveryAddress} />}
				{transaction.deliveryTime && (
					<DetailRow label="Delivery Time" value={formatDate(transaction.deliveryTime)} />
				)}
			 </View>
		 )}

		 {/* Contact Details */}
		 {isSendOrReceive(transaction) &&
			(transaction.recipient || transaction.sender || transaction.courierName) && (
			 <View style={styles.detailsCard}>
				<Text style={styles.sectionTitle}>Contact Information</Text>

				{transaction.recipient && (
				 <>
					<DetailRow label="Recipient" value={transaction.recipient} />
					{transaction.recipientPhone && (
					 <DetailRow label="Recipient Phone" value={transaction.recipientPhone} />
					)}
				 </>
				)}

				{transaction.sender && (
				 <>
					<DetailRow label="Sender" value={transaction.sender} />
					{transaction.senderPhone && <DetailRow label="Sender Phone" value={transaction.senderPhone} />}
				 </>
				)}

				{transaction.courierName && (
				 <>
					<DetailRow label="Courier" value={transaction.courierName} />
					{transaction.courierPhone && <DetailRow label="Courier Phone" value={transaction.courierPhone} />}
				 </>
				)}
			 </View>
			)}

		 {/* Payment Details (for fund transactions) */}
		 {transaction.type === "fund" && (
			 <View style={styles.detailsCard}>
				<Text style={styles.sectionTitle}>Payment Details</Text>

				<DetailRow label="Payment Method" value={transaction.paymentMethod} />
				{transaction.bankName && <DetailRow label="Bank" value={transaction.bankName} />}
				{transaction.accountNumber && (
					<DetailRow label="Account Number" value={transaction.accountNumber} copyable />
				)}
				{transaction.sessionId && <DetailRow label="Session ID" value={transaction.sessionId} copyable />}
			 </View>
		 )}

		 {/* Action Buttons */}
		 <View style={styles.actionButtons}>
			{transaction.status === "completed" && (
				<TouchableOpacity style={styles.actionButton}>
				 <Text style={styles.actionButtonText}>Download Receipt</Text>
				</TouchableOpacity>
			)}
		 </View>
		</ScrollView>
	 </SafeAreaView>
 )
}

const styles = StyleSheet.create({
 container: {
	flex: 1,
	backgroundColor: "#f8f9fa",
 },
 header: {
	flexDirection: "row",
	alignItems: "center",
	justifyContent: "space-between",
	paddingHorizontal: rs(20),
	paddingVertical: rs(16),
	backgroundColor: "#fff",
	borderBottomWidth: rs(1),
	borderBottomColor: "#e0e0e0",
 },
 backButton: {
	width: rs(40),
	height: rs(40),
	justifyContent: "center",
 },
 backArrow: {
	fontSize: rs(24),
	color: "#000",
 },
 headerTitle: {
	fontSize: rs(20),
	fontWeight: "bold",
	color: "#000",
 },
 shareButton: {
	width: rs(40),
	height: rs(40),
	justifyContent: "center",
	alignItems: "center",
 },
 shareIcon: {
	fontSize: rs(20),
	color: tzColors.primary,
 },
 placeholder: {
	width: rs(40),
 },
 content: {
	flex: 1,
	paddingHorizontal: rs(20),
	paddingTop: rs(20),
 },
 summaryCard: {
	backgroundColor: "#fff",
	borderRadius: rs(16),
	padding: rs(24),
	marginBottom: rs(20),
	shadowColor: "#000",
	shadowOffset: {
	 width: 0,
	 height: 2,
	},
	shadowOpacity: 0.1,
	shadowRadius: 4,
	elevation: 3,
 },
 summaryHeader: {
	flexDirection: "row",
	alignItems: "center",
	marginBottom: rs(20),
 },
 transactionIconContainer: {
	width: rs(48),
	height: rs(48),
	backgroundColor: "#f0fffe",
	borderRadius: rs(24),
	justifyContent: "center",
	alignItems: "center",
	marginRight: rs(16),
 },
 transactionIcon: {
	fontSize: rs(24),
 },
 summaryInfo: {
	flex: 1,
 },
 summaryTitle: {
	fontSize: rs(20),
	fontWeight: "bold",
	color: "#000",
	marginBottom: rs(4),
 },
 summarySubtitle: {
	fontSize: rs(16),
	color: "#666",
 },
 amountContainer: {
	alignItems: "center",
 },
 amount: {
	fontSize: rs(32),
	fontWeight: "bold",
	marginBottom: rs(8),
 },
 positiveAmount: {
	color: "#22c55e",
 },
 negativeAmount: {
	color: "#ef4444",
 },
 statusBadge: {
	paddingHorizontal: rs(12),
	paddingVertical: rs(6),
	borderRadius: rs(16),
 },
 statusText: {
	fontSize: rs(12),
	color: "#fff",
	fontWeight: "600",
	textTransform: "capitalize",
 },
 detailsCard: {
	backgroundColor: "#fff",
	borderRadius: rs(12),
	padding: rs(20),
	marginBottom: rs(16),
	shadowColor: "#000",
	shadowOffset: {
	 width: 0,
	 height: 2,
	},
	shadowOpacity: 0.1,
	shadowRadius: 4,
	elevation: 3,
 },
 sectionTitle: {
	fontSize: rs(18),
	fontWeight: "bold",
	color: "#000",
	marginBottom: rs(16),
 },
 detailRow: {
	flexDirection: "row",
	justifyContent: "space-between",
	alignItems: "center",
	paddingVertical: rs(12),
	borderBottomWidth: rs(1),
	borderBottomColor: "#f0f0f0",
 },
 detailLabel: {
	fontSize: rs(14),
	color: "#666",
	flex: 1,
 },
 detailValueContainer: {
	flexDirection: "row",
	alignItems: "center",
	flex: 2,
	justifyContent: "flex-end",
 },
 detailValue: {
	fontSize: rs(14),
	fontWeight: "500",
	color: "#000",
	textAlign: "right",
 },
 copyIcon: {
	fontSize: rs(12),
	marginLeft: rs(8),
	color: tzColors.primary,
 },
 actionButtons: {
	marginTop: rs(20),
	marginBottom: rs(40),
 },
 actionButton: {
	backgroundColor: tzColors.primary,
	paddingVertical: rs(16),
	borderRadius: rs(12),
	alignItems: "center",
	marginBottom: rs(12),
 },
 secondaryButton: {
	backgroundColor: "transparent",
	borderWidth: rs(2),
	borderColor: tzColors.primary,
 },
 actionButtonText: {
	color: "#fff",
	fontSize: rs(16),
	fontWeight: "600",
 },
 secondaryButtonText: {
	color: tzColors.primary,
 },
 errorContainer: {
	flex: 1,
	justifyContent: "center",
	alignItems: "center",
 },
 errorText: {
	fontSize: rs(18),
	color: "#666",
 },
})