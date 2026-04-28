import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { formatDisplayDate, formatPrice, getNumericPrice } from "../utils/formatters";
import { apiFetch } from "../utils/apiClient";
import { ui } from "../utils/theme";

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
    const totalPrice = getNumericPrice(price) * guests;

    const handleConfirmBooking = async () => {
        const selectedShowtimeId = Number(showtimeId);

        if (!showtimeId || Number.isNaN(selectedShowtimeId)) {
            Alert.alert("Error", "Showtime was not selected");
            return;
        }

        setSubmitting(true);

        try {
            console.log("Booking API URL:", "/api/reservations");

            const response = await apiFetch("/api/reservations", {
                method: "POST",
                auth: true,
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
        <ScrollView style={ui.screen} contentContainerStyle={ui.scrollContent}>
            <TouchableOpacity onPress={() => router.push("/theatres")} style={ui.homeButton}>
                <Text style={ui.homeButtonText}>Home</Text>
            </TouchableOpacity>

            <Text style={ui.title}>{showTitle || "Booking"}</Text>
            <Text style={ui.subtitle}>Review your showtime and choose the number of guests.</Text>

            <View
                style={ui.card}
            >
                <Text style={ui.cardTitle}>Showtime Details</Text>
                <Text style={ui.detailText}>Date: {formatDisplayDate(date)}</Text>
                <Text style={ui.detailText}>Time: {time || "-"}</Text>
                <Text style={ui.detailText}>Seat price: {formatPrice(price)}</Text>
            </View>

            <Text style={ui.sectionTitle}>Guests</Text>
            <View
                style={ui.stepperCard}
            >
                <TouchableOpacity
                    onPress={() => setGuests((currentGuests) => Math.max(1, currentGuests - 1))}
                    disabled={guests <= 1}
                    style={[ui.stepperButton, guests <= 1 && ui.stepperButtonDisabled]}
                >
                    <Text style={[ui.stepperButtonText, guests <= 1 && ui.stepperButtonTextDisabled]}>-</Text>
                </TouchableOpacity>

                <Text style={ui.guestCount}>{guests}</Text>

                <TouchableOpacity
                    onPress={() => setGuests((currentGuests) => Math.min(12, currentGuests + 1))}
                    disabled={guests >= 12}
                    style={[ui.stepperButton, guests >= 12 && ui.stepperButtonDisabled]}
                >
                    <Text style={[ui.stepperButtonText, guests >= 12 && ui.stepperButtonTextDisabled]}>+</Text>
                </TouchableOpacity>
            </View>

            <View
                style={ui.card}
            >
                <Text style={ui.totalText}>
                    Total price: {formatPrice(totalPrice)}
                </Text>
            </View>

            <TouchableOpacity
                onPress={handleConfirmBooking}
                disabled={submitting}
                style={[ui.button, submitting && ui.buttonDisabled]}
            >
                <Text style={ui.buttonText}>
                    {submitting ? "Confirming..." : "Confirm Booking"}
                </Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
