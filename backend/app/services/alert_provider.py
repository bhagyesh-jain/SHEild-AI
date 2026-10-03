from uuid import UUID
from app.db.supabase import get_supabase_client

class MockAlertProvider:
    def __init__(self):
        # We use a service role or anon client here, but typically we want service_role to update alerts
        # Because alert_deliveries RLS only allows select for users. Let's assume we can use service_role.
        self.client = get_supabase_client()
        
    def dispatch_alert(self, incident_id: UUID, guardian_id: UUID, stage: int = 1):
        """
        Simulates dispatching an alert to a guardian.
        In a real provider, this would call FCM/APNs/Twilio.
        """
        # Create an initial 'queued' record if not exists
        try:
            self.client.table('alert_deliveries').insert({
                'incident_id': str(incident_id),
                'guardian_id': str(guardian_id),
                'channel': 'push_fcm',
                'stage': stage,
                'state': 'queued',
                'attempt_count': 1
            }).execute()
        except Exception as e:
            # Might already exist
            pass
            
        # Simulate successful acceptance by provider (not delivered, just accepted by FCM)
        self.client.table('alert_deliveries').update({
            'state': 'provider_accepted',
            'provider_ref': f'mock_ref_{incident_id}_{guardian_id}'
        }).eq('incident_id', str(incident_id)).eq('guardian_id', str(guardian_id)).eq('channel', 'push_fcm').eq('stage', stage).execute()
        
        return True
