import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ReservationForm() {
    const { restaurantId, restaurantName } = useLocalSearchParams<{
        restaurantId?: string;
        restaurantName?: string;
    }>();
    const [reservationDateTime, setReservationDateTime] = useState("");
    const [guests, setGuests] = useState("");

    const handleSubmit = () => {
        console.log("Reservation form submitted", {
            restaurantId,
            restaurantName,
            reservationDateTime,
            guests,
        });
        Alert.alert("Reservation", "Backend submission will be added next.");
    };

    return (
        <View style={{ flex: 1, backgroundColor: "white", padding: 20 }}>
            <Text style={{ color: "black", fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
                {restaurantName || "Restaurant"}
            </Text>

            <Text style={{ color: "black" }}>Reservation Date/Time</Text>
            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    marginBottom: 12,
                    marginTop: 6,
                    padding: 10,
                    backgroundColor: "white",
                    color: "black",
                }}
                placeholder="Example: 2026-04-21 19:30"
                placeholderTextColor="#777"
                value={reservationDateTime}
                onChangeText={setReservationDateTime}
            />

            <Text style={{ color: "black" }}>Guests</Text>
            <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    marginBottom: 20,
                    marginTop: 6,
                    padding: 10,
                    backgroundColor: "white",
                    color: "black",
                }}
                keyboardType="number-pad"
                placeholder="Example: 2"
                placeholderTextColor="#777"
                value={guests}
                onChangeText={setGuests}
            />

            <TouchableOpacity
                onPress={handleSubmit}
                style={{
                    backgroundColor: "blue",
                    padding: 15,
                }}
            >
                <Text style={{ color: "white", textAlign: "center" }}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
}
