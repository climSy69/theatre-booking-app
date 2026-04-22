import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";

const API_URL = "http://192.168.1.226:5000/api/reservations";

const normalizeToken = (token: string | null) => {
    if (!token) {
        return null;
    }

    return token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "").trim();
};

export default function Booking() {
    const { showtimeId, showTitle, date, time, price } = useLocalSearchParams<{
        showtimeId?: string;
        showTitle?: string;
        date?: string;
        time?: string;
        price?: string;
    }>();
    const [guests, setGuests] = useState(1);
    const [submitting, setSubmitting] = useState(false);

    const handleConfirmBooking = async () => {
        const selectedShowtimeId = Number(showtimeId);

        if (!showtimeId || Number.isNaN(selectedShowtimeId)) {
            Alert.alert("Error", "Showtime was not selected");
            return;
        }

        setSubmitting(true);

        try {
            const savedToken = await AsyncStorage.getItem("token");
            const token = normalizeToken(savedToken);

            if (!token) {
                Alert.alert("Error", "Session expired. Please log in again.");
                router.replace("/login");
                return;
            }

            console.log("Booking API URL:", API_URL);

            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    showtime_id: selectedShowtimeId,
                    guests,
                }),
            });

            const rawText = await response.text();
            const data = rawText ? JSON.parse(rawText) : null;

            if (!response.ok) {
                Alert.alert("Error", data?.message || `Booking failed with status ${response.status}`);
                return;
            }

            Alert.alert("Success", data?.message || "Booking confirmed successfully", [
                {
                    text: "OK",
                    onPress: () => router.replace("/theatres"),
                },
            ]);
        } catch (error: any) {
            Alert.alert("Error", error?.message || "Could not confirm booking");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1, backgroundColor: "white" }} contentContainerStyle={{ padding: 20 }}>
            <Text style={{ color: "black", fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                {showTitle || "Booking"}
            </Text>

            <View
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    padding: 15,
                    marginBottom: 20,
                }}
            >
                <Text style={{ color: "black", fontSize: 16, marginBottom: 8 }}>Date: {date || "-"}</Text>
                <Text style={{ color: "black", fontSize: 16, marginBottom: 8 }}>Time: {time || "-"}</Text>
                <Text style={{ color: "black", fontSize: 16 }}>Price: {price || "-"}</Text>
            </View>

            <Text style={{ color: "black", fontSize: 16, fontWeight: "600", marginBottom: 8 }}>Guests</Text>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderWidth: 1,
                    borderColor: "#ddd",
                    padding: 12,
                    marginBottom: 20,
                }}
            >
                <TouchableOpacity
                    onPress={() => setGuests((currentGuests) => Math.max(1, currentGuests - 1))}
                    disabled={guests <= 1}
                    style={{
                        width: 44,
                        height: 44,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: guests <= 1 ? "#eee" : "black",
                    }}
                >
                    <Text style={{ color: guests <= 1 ? "#777" : "white", fontSize: 24 }}>-</Text>
                </TouchableOpacity>

                <Text style={{ color: "black", fontSize: 22, fontWeight: "600" }}>{guests}</Text>

                <TouchableOpacity
                    onPress={() => setGuests((currentGuests) => Math.min(12, currentGuests + 1))}
                    disabled={guests >= 12}
                    style={{
                        width: 44,
                        height: 44,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: guests >= 12 ? "#eee" : "black",
                    }}
                >
                    <Text style={{ color: guests >= 12 ? "#777" : "white", fontSize: 24 }}>+</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={handleConfirmBooking}
                disabled={submitting}
                style={{
                    backgroundColor: submitting ? "#777" : "blue",
                    padding: 15,
                }}
            >
                <Text style={{ color: "white", textAlign: "center" }}>
                    {submitting ? "Confirming..." : "Confirm Booking"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
