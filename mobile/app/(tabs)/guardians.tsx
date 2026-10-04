import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert
} from "react-native";
import { fetchGuardiansAPI, createGuardianInviteAPI } from "../../src/services/api";

export default function GuardiansScreen() {
  const [guardians, setGuardians] = useState<any[]>([]);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);

  const loadGuardians = async () => {
    const list = await fetchGuardiansAPI();
    setGuardians(list);
  };

  useEffect(() => {
    loadGuardians();
  }, []);

  const handleCreateInvite = async () => {
    const res = await createGuardianInviteAPI();
    if (res) {
      setInviteUrl(res.invite_url);
      Alert.alert("Invite Link Generated", `Share with your guardian:\n${res.invite_url}`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🛡️ Trusted Guardians</Text>
      <Text style={styles.sub}>Manage contacts authorized to receive emergency SOS alerts</Text>

      <TouchableOpacity onPress={handleCreateInvite} style={styles.inviteBtn}>
        <Text style={styles.inviteBtnText}>+ Invite Trusted Guardian</Text>
      </TouchableOpacity>

      {inviteUrl && (
        <View style={styles.inviteCard}>
          <Text style={styles.inviteCardTitle}>Active Guardian Invite Link:</Text>
          <Text style={styles.inviteUrl}>{inviteUrl}</Text>
        </View>
      )}

      <Text style={styles.sectionHeader}>Escalation Priority List</Text>
      {guardians.map((g) => (
        <View key={g.id} style={styles.guardianCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>P{g.priority}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guardianName}>{g.guardian_name}</Text>
            <Text style={styles.guardianEmail}>{g.guardian_email}</Text>
          </View>
          <Text style={styles.consentedText}>✓ Active</Text>
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
  inviteBtn: { backgroundColor: "#137C78", padding: 16, borderRadius: 16, alignItems: "center", marginBottom: 20 },
  inviteBtnText: { color: "#FFF", fontWeight: "800", fontSize: 15 },
  inviteCard: { backgroundColor: "#111827", padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: "#42D6BD" },
  inviteCardTitle: { color: "#42D6BD", fontSize: 12, fontWeight: "700" },
  inviteUrl: { color: "#FFF", fontSize: 13, marginTop: 4 },
  sectionHeader: { color: "#9CA3AF", fontSize: 13, fontWeight: "700", textTransform: "uppercase", marginBottom: 12 },
  guardianCard: { backgroundColor: "#111827", padding: 16, borderRadius: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#064E3B", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#34D399", fontWeight: "800", fontSize: 12 },
  guardianName: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  guardianEmail: { color: "#9CA3AF", fontSize: 13 },
  consentedText: { color: "#34D399", fontWeight: "700", fontSize: 12 }
});
