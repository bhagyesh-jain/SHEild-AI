import {
  AppState,
  Platform,
  View,
  Text,
  TouchableOpacity,
  Linking,
  ScrollView,
  TextInput,
} from "react-native";

import * as Location from "expo-location";
import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { Accelerometer } from "expo-sensors";
import MapView, { Marker, Circle } from "react-native-maps";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";
import { createClient, Session } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const apiBaseUrl = (process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        ...(Platform.OS !== "web" ? { storage: AsyncStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;

function createEventId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}


export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);
  const [sosActive, setSosActive] =useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });
    supabase.auth.startAutoRefresh();
    const appState = AppState.addEventListener("change", (state) => {
      if (state === "active") supabase.auth.startAutoRefresh();
      else supabase.auth.stopAutoRefresh();
    });
    return () => {
      subscription.unsubscribe();
      appState.remove();
    };
  }, []);
  
  useEffect(() => {
    getLocation();

    if (!session) return;
  
    Accelerometer.setUpdateInterval(300);
  
    const subscription = Accelerometer.addListener((data) => {
      const total =
        Math.abs(data.x) +
        Math.abs(data.y) +
        Math.abs(data.z);
  
      if (total > 2.4 && !sosActive) {
        setSosActive(true);
  
        triggerSOS("shake");
  
        setTimeout(() => {
          setSosActive(false);
        }, 10000);
      }
    });
  
    return () => {
      subscription.remove();
    };
  }, [sosActive, location, session]);

  const getLocation = async () => {
    let { status } =
      await Location.requestForegroundPermissionsAsync();

    if (status !== "granted") {
      alert("Location permission denied");
      return;
    }

    let loc = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    setLocation(loc.coords);
  };

  const playSiren = async () => {
    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/siren.wav")
    );

    await sound.playAsync();
  };

  const syncIncident = async (trigger: "manual" | "shake", currentLocation: any) => {
    if (!supabase) {
      setSyncStatus("SOS could not sync: sign in to connect to the backend.");
      return;
    }
    const clientEventId = createEventId();
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) throw new Error("Sign in to connect to the backend.");
      setSession(currentSession);
      const response = await fetch(`${apiBaseUrl}/incidents`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
          "Content-Type": "application/json",
          "Idempotency-Key": clientEventId,
        },
        body: JSON.stringify({
          client_event_id: clientEventId,
          trigger,
          occurred_at: new Date().toISOString(),
          share_location: Boolean(currentLocation),
        }),
      });
      const incident = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(incident.detail || `Incident request failed (${response.status})`);

      let locationNotice = "";
      if (currentLocation) {
        try {
          const locationResponse = await fetch(`${apiBaseUrl}/incidents/${incident.id}/location`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentSession.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              latitude: currentLocation.latitude,
              longitude: currentLocation.longitude,
              accuracy_m: currentLocation.accuracy ?? null,
              captured_at: new Date().toISOString(),
            }),
          });
          const locationResult = await locationResponse.json().catch(() => ({}));
          if (!locationResponse.ok) throw new Error(locationResult.detail || `Location request failed (${locationResponse.status})`);
        } catch (error) {
          locationNotice = ` Location sync failed: ${error instanceof Error ? error.message : "request failed"}.`;
        }
      }
      setSyncStatus(`Incident synced with the backend (${incident.id}).${locationNotice}`);
    } catch (error) {
      setSyncStatus(`SOS is active locally, but backend sync failed: ${error instanceof Error ? error.message : "request failed"}`);
    }
  };

  const triggerSOS = async (trigger: "manual" | "shake" = "manual") => {
    await playSiren();
    void syncIncident(trigger, location);

    const message =
      `🚨 EMERGENCY ALERT 🚨\n\n` +
      `I need help.` +
      (location ? `\n\nMy Live Location:\nhttps://maps.google.com/?q=${location.latitude},${location.longitude}` : "");

    const phoneNumber = "+919302266309";

    const whatsappURL =
      `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    Linking.openURL(whatsappURL);

    setTimeout(() => {
      Linking.openURL(`tel:${phoneNumber}`);
    }, 3000);
  };

  const signIn = async () => {
    if (!supabase) return;
    setAuthLoading(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      setAuthError(error?.message || "");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Sign in failed.");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!session) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 28, backgroundColor: "#030712" }}>
        <Text style={{ color: "white", fontSize: 30, fontWeight: "bold", marginBottom: 10 }}>SHEild AI sign in</Text>
        <Text style={{ color: "#9CA3AF", marginBottom: 24 }}>Sign in with your Supabase user account to connect SOS incidents.</Text>
        {!supabase && <Text style={{ color: "#FCA5A5", marginBottom: 16 }}>Configure the Supabase URL and publishable key in the app environment.</Text>}
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor="#9CA3AF" autoCapitalize="none" keyboardType="email-address" style={{ color: "white", backgroundColor: "#111827", padding: 14, borderRadius: 10, marginBottom: 12 }} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor="#9CA3AF" secureTextEntry style={{ color: "white", backgroundColor: "#111827", padding: 14, borderRadius: 10, marginBottom: 12 }} />
        {!!authError && <Text style={{ color: "#FCA5A5", marginBottom: 12 }}>{authError}</Text>}
        <TouchableOpacity disabled={!supabase || authLoading} onPress={signIn} style={{ backgroundColor: "#2563EB", padding: 15, borderRadius: 10, alignItems: "center", opacity: authLoading ? 0.6 : 1 }}>
          <Text style={{ color: "white", fontWeight: "bold" }}>{authLoading ? "Signing in..." : "Sign in"}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: "#030712",
      }}
      contentContainerStyle={{
        paddingHorizontal: 24,
        paddingTop: 80,
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "white",
          fontSize: 38,
          fontWeight: "bold",
          marginBottom: 8,
        }}
      >
        SHEild AI 🛡️
      </Text>
  
      <Text
        style={{
          color: "#9CA3AF",
          fontSize: 16,
          marginBottom: 40,
        }}
      >
        Smart Women Safety System
      </Text>
      <TouchableOpacity onPress={() => supabase?.auth.signOut()} style={{ alignSelf: "flex-end", marginBottom: 12 }}>
        <Text style={{ color: "#93C5FD" }}>Sign out</Text>
      </TouchableOpacity>
  
      <View
        style={{
          width: "100%",
          backgroundColor: "#111827",
          padding: 20,
          borderRadius: 24,
          marginBottom: 30,
        }}
      >
        <Text
          style={{
            color: "#60A5FA",
            fontSize: 18,
            fontWeight: "bold",
            marginBottom: 12,
          }}
        >
          📍 Live Location
        </Text>
  
        {location && (
          <>
            <Text style={{ color: "white", marginBottom: 6 }}>
              Latitude: {location.latitude}
            </Text>
  
            <Text style={{ color: "white" }}>
              Longitude: {location.longitude}
            </Text>
          </>
        )}
        {location && (
  <MapView
    style={{
      width: "100%",
      height: 220,
      borderRadius: 24,
      overflow: "hidden",
      marginBottom: 30,
    }}
ScrollEnable={false}
zoomEnable={false}
rotateEnable={false}
pitchEnable={false}  
initialRegion={{
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }}
  >
    <Marker
      coordinate={{
        latitude: location.latitude,
        longitude: location.longitude,
      }}
      title="You are here"
      description="Current Live Location"
    />
    <Circle
  center={{
    latitude: location.latitude + 0.001,
    longitude: location.longitude + 0.001,
  }}
  radius={120}
  fillColor="rgba(255,0,0,0.35)"
  strokeColor="red"
/>

<Circle
  center={{
    latitude: location.latitude - 0.001,
    longitude: location.longitude - 0.001,
  }}
  radius={120}
  fillColor="rgba(34,197,94,0.35)"
  strokeColor="green"
/>

<Circle
  center={{
    latitude: location.latitude,
    longitude: location.longitude + 0.002,
  }}
  radius={120}
  fillColor="rgba(120,53,15,0.35)"
  strokeColor="brown"
/>
  </MapView>
)}
    </View>
      <TouchableOpacity
        onPress={() => triggerSOS("manual")}
        style={{
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: "#DC2626",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "red",
          shadowOpacity: 0.9,
          shadowRadius: 25,
          elevation: 20,
          marginBottom: 40,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 42,
            fontWeight: "bold",
          }}
        >
          SOS
        </Text>
      </TouchableOpacity>
      {!!syncStatus && <Text accessibilityLiveRegion="polite" style={{ color: syncStatus.includes("failed") ? "#FCA5A5" : "#4ADE80", textAlign: "center", marginBottom: 20 }}>{syncStatus}</Text>}
  
      <View
        style={{
          width: "100%",
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <TouchableOpacity
          style={{
            backgroundColor: "#1F2937",
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 18,
            width: "48%",
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            📞 Fake Call
          </Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={{
            backgroundColor: "#1F2937",
            paddingVertical: 14,
            paddingHorizontal: 18,
            borderRadius: 18,
            width: "48%",
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontWeight: "600",
            }}
          >
            📤 Share
          </Text>
        </TouchableOpacity>
      </View>
  
      <View
  style={{
    backgroundColor: "#052e16",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 20,
  }}
>
  <Text
    style={{
      color: "#4ADE80",
      fontWeight: "bold",
      fontSize: 16,
    }}
  >
    🟢 Status: Safe
  </Text>
</View>

</ScrollView>
);
}
