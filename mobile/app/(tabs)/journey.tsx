import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import { createJourneyAPI, fetchJourneysAPI, checkInJourneyAPI } from "../../src/services/api";

export default function JourneyScreen() {
  const [destination, setDestination] = useState("");
  const [etaMinutes, setEtaMinutes] = useState("25");
  const [selectedGuardian, setSelectedGuardian] = useState<string>("Mom");
  const [journeys, setJourneys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadJourneys = async () => {
    setIsLoading(true);
    const list = await fetchJourneysAPI();
    setJourneys(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadJourneys();
  }, []);

  const handleStartJourney = async () => {
    const targetDest = destination.trim() || "Home / Connaught Place";
    const res = await createJourneyAPI(targetDest, parseInt(etaMinutes) || 25);
    if (res) {
      Alert.alert("Safe Journey Started", `ETA set for ${targetDest} in ${etaMinutes} mins.`);
      setDestination("");
      loadJourneys();
    } else {
      Alert.alert("Journey Started", `Simulated active journey to ${targetDest}`);
    }
  };

  const handleCheckIn = async (id: string) => {
    await checkInJourneyAPI(id);
    Alert.alert("Safe Check-in", "Checked in safely!");
    loadJourneys();
  };

  const guardians = [
    { id: "mom", name: "Mom (Mother)", isDefault: true },
    { id: "sister", name: "Sister (Pooja) (Sister)", isDefault: false },
    { id: "papa", name: "Papa (Father)", isDefault: false }
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pink Step Badge */}
      <Text style={styles.stepBadge}>STEP 6 - TRAVEL SAFEGUARD</Text>

      <Text style={styles.title}>Safe Journey Flow 🚗</Text>
      <Text style={styles.sub}>Set destination & ETA. Periodic check-in protects you during commutes.</Text>

      {/* Setup Form Card */}
      <View style={styles.card}>
        <Text style={styles.sectionHeader}>📍 1. Start Journey Setup</Text>

        <Text style={styles.label}>Destination</Text>
        <TextInput
          value={destination}
          onChangeText={setDestination}
          style={styles.input}
          placeholder="e.g. Home / Connaught Place"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Estimated Travel Time (Minutes)</Text>
        <TextInput
          value={etaMinutes}
          onChangeText={setEtaMinutes}
          keyboardType="numeric"
          style={styles.input}
          placeholder="25"
          placeholderTextColor="#64748b"
        />

        <Text style={styles.label}>Notify Guardian</Text>
        <View style={styles.guardianList}>
          {guardians.map((g) => {
            const isSelected = selectedGuardian === g.name || (selectedGuardian === "Mom" && g.id === "mom");
            return (
              <TouchableOpacity
                key={g.id}
                onPress={() => setSelectedGuardian(g.name)}
                activeOpacity={0.7}
                style={[styles.guardianPill, isSelected ? styles.guardianPillSelected : styles.guardianPillUnselected]}
              >
                <Text style={[styles.guardianPillText, isSelected ? styles.textSelected : styles.textUnselected]}>
                  {g.name}
                </Text>
                <View style={styles.radioRight}>
                  <Text style={isSelected ? styles.selectedDot : styles.unselectedDot}>
                    {isSelected ? "🔘 Selected" : "⚪ Select"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity onPress={handleStartJourney} activeOpacity={0.7} style={styles.startBtn}>
          <Text style={styles.startBtnText}>Start Safe Journey 🚀</Text>
        </TouchableOpacity>
      </View>

      {/* Active Journeys Section */}
      <Text style={styles.activeSectionTitle}>Active Journeys</Text>
      {isLoading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator size="small" color="#ec4899" />
          <Text style={[styles.emptyText, { marginTop: 8 }]}>Loading active travel safeguards...</Text>
        </View>
      ) : journeys.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active journey currently set. Start a journey above to activate periodic check-in alerts.</Text>
        </View>
      ) : (
        journeys.map((j) => (
          <View key={j.id} style={styles.journeyCard}>
            <View style={styles.journeyRow}>
              <Text style={styles.destText}>{j.destination_label}</Text>
              <Text style={styles.statusBadge}>{j.status?.toUpperCase() || "ACTIVE"}</Text>
            </View>
            <Text style={styles.etaText}>ETA: {new Date(j.eta_at || Date.now() + 25 * 60000).toLocaleTimeString()}</Text>
            {j.status === "active" && (
              <TouchableOpacity onPress={() => handleCheckIn(j.id)} activeOpacity={0.7} style={styles.checkInBtn}>
                <Text style={styles.checkInText}>Check-in Safely ✓</Text>
              </TouchableOpacity>
            )}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#080d1a" },
  content: { paddingHorizontal: 16, paddingTop: 54, paddingBottom: 40 },
  stepBadge: { color: "#ec4899", fontSize: 11, fontWeight: "900", letterSpacing: 0.5, marginBottom: 4 },
  title: { color: "#FFFFFF", fontSize: 26, fontWeight: "900", marginBottom: 4 },
  sub: { color: "#94a3b8", fontSize: 13, marginBottom: 20 },
  card: { backgroundColor: "#0d1527", borderWidth: 1, borderColor: "#1e293b", padding: 18, borderRadius: 20, marginBottom: 24 },
  sectionHeader: { color: "#38bdf8", fontSize: 16, fontWeight: "800", marginBottom: 16 },
  label: { color: "#94a3b8", fontSize: 13, marginBottom: 6, fontWeight: "700" },
  input: { backgroundColor: "#090e1d", color: "#FFFFFF", borderWidth: 1, borderColor: "#1e293b", padding: 14, borderRadius: 14, marginBottom: 16, fontSize: 14 },
  guardianList: { gap: 10, marginBottom: 20 },
  guardianPill: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  guardianPillSelected: {
    backgroundColor: "#9d174d",
    borderColor: "#ec4899"
  },
  guardianPillUnselected: {
    backgroundColor: "#090e1d",
    borderColor: "#1e293b"
  },
  guardianPillText: {
    fontSize: 14,
    fontWeight: "700"
  },
  textSelected: { color: "#FFFFFF" },
  textUnselected: { color: "#94a3b8" },
  radioRight: {},
  selectedDot: { color: "#fbcfe8", fontSize: 13, fontWeight: "700" },
  unselectedDot: { color: "#64748b", fontSize: 13, fontWeight: "600" },
  startBtn: { backgroundColor: "#be185d", padding: 16, borderRadius: 14, alignItems: "center" },
  startBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 15 },
  activeSectionTitle: { color: "#38bdf8", fontSize: 15, fontWeight: "800", marginBottom: 12 },
  emptyCard: { backgroundColor: "#0d1527", padding: 20, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "#1e293b" },
  emptyText: { color: "#64748b", fontSize: 13, textAlign: "center" },
  journeyCard: { backgroundColor: "#0d1527", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "#1e293b" },
  journeyRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  destText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },
  statusBadge: { color: "#38bdf8", fontWeight: "800", fontSize: 12 },
  etaText: { color: "#94a3b8", fontSize: 12, marginTop: 4 },
  checkInBtn: { backgroundColor: "#064e3b", padding: 10, borderRadius: 10, marginTop: 10, alignItems: "center" },
  checkInText: { color: "#34d399", fontWeight: "700" }
});
