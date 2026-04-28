import { View, Text, TextInput, Alert, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiFetch } from "../utils/apiClient";
import { ui } from "../utils/theme";

const normalizeToken = (token: unknown) => {
    if (typeof token !== "string") {
        return null;
    }

    return token.replace(/^Bearer\s+/i, "").replace(/^"|"$/g, "").trim();
};

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        console.log("Login button pressed");
        console.log("API URL:", "/api/auth/login");

        try {
            const response = await apiFetch("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            console.log("Response status:", response.status);

            const rawText = await response.text();
            console.log("Raw response text:", rawText);

            let data: any = null;

            try {
                data = rawText ? JSON.parse(rawText) : null;
            } catch (parseError) {
                console.log("JSON parse error:", parseError);
                Alert.alert("Error", "Server returned an invalid JSON response");
                return;
            }

            if (response.ok) {
                const token = normalizeToken(data?.token);

                if (!token || !data?.user) {
                    Alert.alert("Error", "Login response did not include a valid session");
                    return;
                }

                await AsyncStorage.multiSet([
                    ["token", token],
                    ["user", JSON.stringify(data.user)],
                ]);

                Alert.alert("Success", "Logged in!");
                console.log(data);
                router.push("/theatres");
            } else {
                Alert.alert("Error", data?.message || `Login failed with status ${response.status}`);
            }
        } catch (error: any) {
            console.log("Fetch error name:", error?.name);
            console.log("Fetch error message:", error?.message);
            console.log("Full fetch error:", error);
            Alert.alert("Network Error", error?.message || "Could not reach the server");
        }
    };

    return (
        <ScrollView style={ui.screen} contentContainerStyle={ui.authContent} keyboardShouldPersistTaps="handled">
            <View style={ui.authCard}>
                <Text style={ui.title}>Theatre Booking</Text>
                <Text style={ui.subtitle}>Sign in to browse shows, reserve seats, and manage your bookings.</Text>

            <Text style={ui.label}>Email</Text>
            <TextInput
                style={ui.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <Text style={ui.label}>Password</Text>
            <TextInput
                style={ui.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                onPress={handleLogin}
                style={ui.button}
            >
                <Text style={ui.buttonText}>LOGIN</Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push("/register")}
                style={ui.linkButton}
            >
                <Text style={ui.linkText}>Don't have an account? Register</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
