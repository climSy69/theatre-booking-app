import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.226:5000/api/auth/login";

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
        console.log("API URL:", API_URL);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
                router.push("/restaurants");
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
        <View style={{ flex: 1, padding: 20, backgroundColor: "white" }}>
            <Text style={{ color: "black" }}>Email</Text>
            <TextInput
                style={{
                    borderWidth: 1,
                    marginBottom: 10,
                    padding: 10,
                    backgroundColor: "white",
                    color: "black",
                }}
                value={email}
                onChangeText={setEmail}
            />

            <Text style={{ color: "black" }}>Password</Text>
            <TextInput
                style={{
                    borderWidth: 1,
                    marginBottom: 10,
                    padding: 10,
                    backgroundColor: "white",
                    color: "black",
                }}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />

            <TouchableOpacity
                onPress={handleLogin}
                style={{
                    backgroundColor: "blue",
                    padding: 15,
                    marginTop: 10,
                }}
            >
                <Text style={{ color: "white", textAlign: "center" }}>LOGIN</Text>
            </TouchableOpacity>
        </View>
    );
}
