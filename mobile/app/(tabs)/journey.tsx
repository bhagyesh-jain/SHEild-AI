import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";
import { createJourneyAPI, fetchJourneysAPI, checkInJourneyAPI } from "../../src/services/api";

export default function JourneyScreen() {
  const [destination, setDestination] = useState("Home");
  const [etaMinutes, setEtaMinutes] = useState("30");
  const [journeys, setJourneys] = useState<any[]>([]);

  const loadJourneys = async () => {
    const list = await fetchJourneysAPI();
    setJourneys(list);
  };

  useEffect(() => {
    loadJourneys();
  }, []);

  const handleStartJourney = async () => {
    if (!destination) {
      Alert.alert("Error", "Please enter a destination label");
      return;
    }
    const res = await createJourneyAPI(destination, parseInt(etaMinutes) || 30);
    if (res) {
      Alert.alert("Safe Journey Started", `ETA set for ${destination} in ${etaMinutes} mins.`);
      loadJourneys();
    }
  };

  const handleCheckIn = async (id: string) => {
    await checkInJourneyAPI(id);
    Alert.alert("Safe Check-in", "Checked in safely!");
    loadJourneys();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>📍 Safe Journey</Text>
      <Text style={styles.sub}>Track travel destination and check-in timer</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Destination Name</Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
          placeholder="e.g. Home, Office, Metro Station"
          placeholderTextColor="#6B7280"
        />

        <Text style={styles.label}>Estimated Travel Time (Minutes)</Text>
        <TextInput
          value={etaMinutes}
          onChangeText={setEtaMinutes}
          keyboardType="numeric"
          style={styles.input}
          placeholder="30"
          placeholderTextColor="#6B7280"
        />

        <TouchableOpacity onPress={handleStartJourney} style={styles.startBtn}>
          <Text style={styles.startBtnText}>Start Safe Journey 🚀</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionHeader}>Active Journeys</Text>
      {journeys.map((j) => (
        <View key={j.id} style={styles.journeyCard}>
          <View style={styles.row}>
            <Text style={styles.destText}>{j.destination_label}</Text>
            <Text style={styles.statusBadge}>{j.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.etaText}>ETA: {new Date(j.eta_at).toLocaleTimeString()}</Text>
          {j.status === "active" && (
            <TouchableOpacity onPress={() => handleCheckIn(j.id)} style={styles.checkInBtn}>
              <Text style={styles.checkInText}>Check-in Safely ✓</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#030712" },
  content: { padding: 20, paddingTop: 60 },
  title: { color: "#FFF", fontSize: 30, fontWeight: "900" },
  sub: { color: "#9CA3AF", fontSize: 14, marginBottom: 20 },
  card: { backgroundColor: "#111827", padding: 20, borderRadius: 20, marginBottom: 24 },
  label: { color: "#9CA3AF", fontSize: 13, marginBottom: 6, fontWeight: "600" },
  input: { backgroundColor: "#1F2937", color: "#FFF", padding: 12, borderRadius: 12, marginBottom: 16 },
  startBtn: { backgroundColor: "#137C78", padding: 14, borderRadius: 14, alignItems: "center" },
  startBtnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  sectionHeader: { color: "#42D6BD", fontSize: 16, fontWeight: "800", marginBottom: 12 },
  journeyCard: { backgroundColor: "#111827", padding: 16, borderRadius: 16, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  destText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  statusBadge: { color: "#42D6BD", fontWeight: "700", fontSize: 12 },
  etaText: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },
  checkInBtn: { backgroundColor: "#064E3B", padding: 10, borderRadius: 10, marginTop: 10, alignItems: "center" },
  checkInText: { color: "#34D399", fontWeight: "700" }
});
