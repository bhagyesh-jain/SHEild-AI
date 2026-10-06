import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import { fetchGuardiansAPI, createGuardianInviteAPI } from "../../src/services/api";

export default function GuardiansScreen() {
  const [guardians, setGuardians] = useState<any[]>([]);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultContacts = [
    { id: "1", name: "Mom", phone: "+91 98765 43211", relation: "Mother", status: "Consented" },
    { id: "2", name: "Sister (Pooja)", phone: "+91 98765 43212", relation: "Sister", status: "Consented" },
    { id: "3", name: "Papa", phone: "+91 91234 56789", relation: "Father", status: "Consented" }
  ];

  const loadGuardians = async () => {
    setIsLoading(true);
    const list = await fetchGuardiansAPI();
    if (list && list.length > 0) {
      setGuardians(list);
    } else {
      setGuardians(defaultContacts);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadGuardians();
  }, []);

  const handleCreateInvite = async () => {
    const res = await createGuardianInviteAPI();
    if (res) {
      setInviteUrl(res.invite_url);
      Alert.alert("Invite Link Generated", `Share with your guardian:\n${res.invite_url}`);
    } else {
      const mockUrl = "https://sheild.ai/invite/g_7718a";
      setInviteUrl(mockUrl);
      Alert.alert("Add Trusted Guardian", `Share invite link:\n${mockUrl}`);
    }
  };

  const handleRemoveContact = (id: string, name: string) => {
    Alert.alert("Remove Guardian", `Are you sure you want to remove ${name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => setGuardians(prev => prev.filter(g => g.id !== id))
      }
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Pink Step Badge */}
      <Text style={styles.stepBadge}>STEP 3 - GUARDIAN NETWORK</Text>

      <Text style={styles.title}>Trusted Guardians 🛡️</Text>
      <Text style={styles.sub}>Emergency contacts who receive live location alerts & acknowledgements.</Text>

      {/* Add Trusted Guardian Button */}
      <TouchableOpacity
        onPress={handleCreateInvite}
        activeOpacity={0.7}
        style={styles.addBtn}
        accessibilityRole="button"
        accessibilityLabel="Add new trusted guardian"
      >
        <Text style={styles.addBtnText}>+ Add Trusted Guardian</Text>
      </TouchableOpacity>

      {inviteUrl && (
        <View style={styles.inviteCard}>
          <Text style={styles.inviteCardTitle}>Active Guardian Invite Link:</Text>
          <Text style={styles.inviteUrl}>{inviteUrl}</Text>
        </View>
      )}

      {/* Active Contacts Header */}
      <Text style={styles.sectionHeader}>ACTIVE CONTACTS ({guardians.length})</Text>

      {/* Contacts List */}
      {isLoading ? (
        <View style={styles.emptyCard}>
          <ActivityIndicator size="small" color="#ec4899" />
          <Text style={[styles.emptyText, { marginTop: 8 }]}>Loading guardian network...</Text>
        </View>
      ) : guardians.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No active trusted guardians added yet. Click above to add guardians.</Text>
        </View>
      ) : (
        guardians.map((g) => (
          <View key={g.id || g.guardian_name} style={styles.contactCard}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarIcon}>👩</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactName}>{g.name || g.guardian_name}</Text>
              <Text style={styles.contactSub}>
                {g.phone || g.guardian_email || "+91 98765 43211"} • {g.relation || "Family"}
              </Text>
            </View>
            <View style={styles.actionsRight}>
              <View style={styles.consentedBadge}>
                <Text style={styles.consentedText}>Consented</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveContact(g.id, g.name || g.guardian_name)}
                activeOpacity={0.6}
              >
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
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
  addBtn: { backgroundColor: "#be185d", paddingVertical: 16, borderRadius: 20, alignItems: "center", marginBottom: 24 },
  addBtnText: { color: "#FFFFFF", fontWeight: "900", fontSize: 16 },
  inviteCard: { backgroundColor: "#0d1527", padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "#38bdf8" },
  inviteCardTitle: { color: "#38bdf8", fontSize: 12, fontWeight: "800" },
  inviteUrl: { color: "#FFFFFF", fontSize: 13, marginTop: 4 },
  sectionHeader: { color: "#94a3b8", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 12 },
  emptyCard: { backgroundColor: "#0d1527", padding: 20, borderRadius: 16, alignItems: "center", borderWidth: 1, borderColor: "#1e293b" },
  emptyText: { color: "#64748b", fontSize: 13, textAlign: "center" },
  contactCard: {
    backgroundColor: "#0d1527",
    borderWidth: 1,
    borderColor: "#1e293b",
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center"
  },
  avatarIcon: { fontSize: 22 },
  contactName: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  contactSub: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  actionsRight: { alignItems: "flex-end", gap: 6 },
  consentedBadge: { backgroundColor: "#0891b2", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  consentedText: { color: "#FFFFFF", fontWeight: "800", fontSize: 11 },
  removeText: { color: "#ef4444", fontSize: 12, fontWeight: "700" }
});
