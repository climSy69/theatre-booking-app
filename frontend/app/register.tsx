import { router } from "expo-router";
import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { apiFetch } from "../utils/apiClient";
import { ui } from "../utils/theme";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleRegister = async () => {
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();

        if (!trimmedName || !trimmedEmail || !password || !confirmPassword) {
            Alert.alert("Error", "All fields are required");
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        setSubmitting(true);

        try {
            const response = await apiFetch("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name: trimmedName,
                    email: trimmedEmail,
                    password,
                }),
            });

            const rawText = await response.text();
            const data = rawText ? JSON.parse(rawText) : null;

            if (!response.ok) {
                Alert.alert("Error", data?.message || `Registration failed with status ${response.status}`);
                return;
            }

            Alert.alert("Success", data?.message || "User registered successfully!", [
                {
                    text: "OK",
                    onPress: () => router.replace("/login"),
                },
            ]);
        } catch (error: any) {
            Alert.alert("Error", error?.message || "Could not register user");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <ScrollView style={ui.screen} contentContainerStyle={ui.authContent} keyboardShouldPersistTaps="handled">
            <View style={ui.authCard}>
                <Text style={ui.title}>Create Account</Text>
                <Text style={ui.subtitle}>Register to start booking theatre tickets.</Text>

            <Text style={ui.label}>Name</Text>
            <TextInput
                style={ui.input}
                value={name}
                onChangeText={setName}
            />

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

            <Text style={ui.label}>Confirm Password</Text>
            <TextInput
                style={ui.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                onPress={handleRegister}
                disabled={submitting}
                style={[ui.button, submitting && ui.buttonDisabled]}
            >
                <Text style={ui.buttonText}>
                    {submitting ? "REGISTERING..." : "REGISTER"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.replace("/login")}
                style={ui.linkButton}
            >
                <Text style={ui.linkText}>Already have an account? Login</Text>
            </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
