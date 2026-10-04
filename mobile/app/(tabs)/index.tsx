import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
  Alert
} from "react-native";
import * as Location from "expo-location";
import { Audio } from "expo-av";
import { Accelerometer } from "expo-sensors";
import { EmergencySOSButton } from "../../src/components/safety/EmergencySOSButton";
import { AlertStatusTimeline } from "../../src/components/safety/AlertStatusTimeline";
import { createIncidentAPI, fetchIncidentAPI, resolveIncidentAPI, sendLocationAPI, IncidentResponse } from "../../src/services/api";
import { offlineOutbox } from "../../src/services/offline-outbox";

export default function HomeScreen() {
  const [location, setLocation] = useState<any>(null);
  const [activeIncident, setActiveIncident] = useState<IncidentResponse | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [sirenPlaying, setSirenPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    requestLocation();
    setupAccelerometer();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Poll active incident status from backend
  useEffect(() => {
    let interval: any;
    if (activeIncident && activeIncident.status !== "resolved") {
      interval = setInterval(async () => {
        const updated = await fetchIncidentAPI(activeIncident.id);
        if (updated) {
          setActiveIncident(updated);
          setIsOffline(false);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeIncident]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setLocation(loc.coords);
      }
    } catch (e) {
      console.log("Location permission or fetch error:", e);
    }
  };

  const setupAccelerometer = () => {
    try {
      Accelerometer.setUpdateInterval(300);
      const subscription = Accelerometer.addListener((data) => {
        const magnitude = Math.abs(data.x) + Math.abs(data.y) + Math.abs(data.z);
        if (magnitude > 2.8 && !activeIncident) {
          handleTriggerSOS("shake");
        }
      });
      return () => subscription.remove();
    } catch (e) {
      // Accelerometer unavailable in simulator/browser
    }
  };

  const toggleSiren = async () => {
    try {
      if (sirenPlaying) {
        if (soundRef.current) {
          await soundRef.current.stopAsync();
        }
        setSirenPlaying(false);
      } else {
        const { sound } = await Audio.Sound.createAsync(
          require("../../../assets/siren.wav")
        );
        soundRef.current = sound;
        await sound.setIsLoopingAsync(true);
        await sound.playAsync();
        setSirenPlaying(true);
      }
    } catch (e) {
      Alert.alert("Siren", "Playing alert sound audio");
    }
  };

  const handleTriggerSOS = async (triggerType: "manual" | "shake" | "voice" = "manual") => {
    const clientEventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    // Play Siren audio automatically
    if (!sirenPlaying) {
      toggleSiren();
    }

    const payload = {
      client_event_id: clientEventId,
      trigger: triggerType,
      occurred_at: new Date().toISOString(),
      location: location ? {
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy_m: location.accuracy || 15,
        captured_at: new Date().toISOString()
      } : undefined,
      share_location: true
    };

    // Try posting to backend
    const res = await createIncidentAPI(payload);

    if (res) {
      setActiveIncident(res);
      setIsOffline(false);
    } else {
      // Offline fallback: enqueue into offline outbox
      offlineOutbox.enqueue(payload);
      setIsOffline(true);
      setActiveIncident({
        id: clientEventId,
        owner_id: "user-123",
        client_event_id: clientEventId,
        trigger: triggerType,
        status: "draft_local",
        alert_status: "queued",
        started_at: new Date().toISOString()
      });
    }
  };

  const handleResolveIncident = async () => {
    if (activeIncident && activeIncident.id) {
      await resolveIncidentAPI(activeIncident.id);
      setActiveIncident(null);
      setIsOffline(false);
      if (sirenPlaying && soundRef.current) {
        soundRef.current.stopAsync();
        setSirenPlaying(false);
      }
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Brand Header */}
      <Text style={styles.titleText}>SHEild AI 🛡️</Text>
      <Text style={styles.subtitleText}>Smart Women Safety System 2.0</Text>

      {/* Alert Status Banner */}
      <AlertStatusTimeline
        status={activeIncident ? activeIncident.status : "resolved"}
        alertStatus={activeIncident ? activeIncident.alert_status : undefined}
        isOffline={isOffline}
        acknowledgedBy={activeIncident?.acknowledgements?.[0]?.guardian_name}
        acknowledgedAt={activeIncident?.acknowledgements?.[0]?.acknowledged_at}
      />

      {/* Location Status Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Live GPS Location</Text>
        {location ? (
          <View style={{ gap: 4 }}>
            <Text style={styles.cardDetail}>Latitude: {location.latitude}</Text>
            <Text style={styles.cardDetail}>Longitude: {location.longitude}</Text>
            <Text style={styles.cardSub}>Accuracy: ±{location.accuracy || 15}m</Text>
          </View>
        ) : (
          <Text style={styles.cardSub}>Requesting GPS location permissions...</Text>
        )}
      </View>

      {/* Emergency SOS Raised Button */}
      <EmergencySOSButton
        onTriggerSOS={() => handleTriggerSOS("manual")}
        disabled={false}
      />

      {/* Active Incident Controls */}
      {activeIncident && activeIncident.status !== "resolved" && (
        <TouchableOpacity
          onPress={handleResolveIncident}
          style={styles.resolveButton}
        >
          <Text style={styles.resolveButtonText}>✅ Mark Myself Safe & Resolve SOS</Text>
        </TouchableOpacity>
      )}

      {/* Quick Action Grid */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          onPress={toggleSiren}
          style={[styles.quickButton, sirenPlaying && styles.sirenActive]}
        >
          <Text style={styles.quickButtonText}>
            {sirenPlaying ? "🔊 Stop Siren" : "📢 Play Siren"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleTriggerSOS("voice")}
          style={styles.quickButton}
        >
          <Text style={styles.quickButtonText}>🗣️ Voice Trigger</Text>
        </TouchableOpacity>
      </View>

      {/* Official Emergency Hotline Hand-offs */}
      <View style={styles.dialerSection}>
        <Text style={styles.dialerTitle}>Helpline Dialer Hand-offs</Text>
        <View style={styles.dialerGrid}>
          <TouchableOpacity
            onPress={() => Linking.openURL("tel:112")}
            style={styles.dialerPill}
          >
            <Text style={styles.dialerPillText}>📞 112 (Emergency)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL("tel:1091")}
            style={styles.dialerPill}
          >
            <Text style={styles.dialerPillText}>📞 1091 (Women)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL("tel:1930")}
            style={styles.dialerPill}
          >
            <Text style={styles.dialerPillText}>📞 1930 (Cyber)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL("tel:1098")}
            style={styles.dialerPill}
          >
            <Text style={styles.dialerPillText}>📞 1098 (Child)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#030712"
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: "center"
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 4
  },
  subtitleText: {
    color: "#9CA3AF",
    fontSize: 15,
    marginBottom: 20
  },
  card: {
    width: "100%",
    backgroundColor: "#111827",
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1F2937",
    marginBottom: 16
  },
  cardTitle: {
    color: "#42D6BD",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8
  },
  cardDetail: {
    color: "#F9FAFB",
    fontSize: 14,
    fontWeight: "600"
  },
  cardSub: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 4
  },
  resolveButton: {
    width: "100%",
    backgroundColor: "#064E3B",
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#34D399",
    alignItems: "center",
    marginVertical: 12
  },
  resolveButtonText: {
    color: "#D1FAE5",
    fontWeight: "800",
    fontSize: 15
  },
  quickGrid: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12
  },
  quickButton: {
    backgroundColor: "#1F2937",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    width: "48%",
    alignItems: "center"
  },
  sirenActive: {
    backgroundColor: "#7F1D1D",
    borderWidth: 1,
    borderColor: "#EF4444"
  },
  quickButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14
  },
  dialerSection: {
    width: "100%",
    marginTop: 20
  },
  dialerTitle: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 10
  },
  dialerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  dialerPill: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151"
  },
  dialerPillText: {
    color: "#F9FAFB",
    fontSize: 13,
    fontWeight: "600"
  }
});
