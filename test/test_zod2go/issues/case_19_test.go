package models

import "testing"

// Built by test_go.sh with the expected files of test_issues/no_id/19 (the domain layer is a
// separate module).

var jCase19EventLog = []byte(`{
	"event": {"kind": "Deleted", "id": "1", "reason": "spam"},
	"mixed": {"kind": "Archived", "id": "2"},
	"message": {"type": "Alert", "payload": {"text": "disk", "level": 3}},
	"history": [{"kind": "Created", "id": "3"}, {"kind": "Deleted", "id": "4"}],
	"last": {"kind": "Created", "id": "5"},
	"byId": {"6": {"kind": "Deleted", "id": "6"}}
}`)

func TestCase19EventLog_Roundtrip(t *testing.T) {
	var log EventLog
	testSerialization(t, "Case19 EventLog", jCase19EventLog, &log)

	// Variants are chosen by their discriminant.
	if _, ok := log.Event.(AnyEventDeleted); !ok {
		t.Errorf("event: unexpected variant %T", log.Event)
	}
	if _, ok := log.Mixed.(Archived); !ok {
		t.Errorf("mixed: unexpected variant %T", log.Mixed)
	}
	if alert, ok := log.Message.(AnyMessageAlert); !ok || alert.Payload.Level != 3 {
		t.Errorf("message: unexpected variant %#v", log.Message)
	}
	if _, ok := log.History[0].(AnyEventCreated); !ok {
		t.Errorf("history[0]: unexpected variant %T", log.History[0])
	}
	if _, ok := log.History[1].(AnyEventDeleted); !ok {
		t.Errorf("history[1]: unexpected variant %T", log.History[1])
	}
	if _, ok := log.ById["6"].(AnyEventDeleted); !ok {
		t.Errorf("byId[6]: unexpected variant %T", log.ById["6"])
	}
	if log.Last == nil {
		t.Fatalf("last: missing")
	}
	if created, ok := (*log.Last).(AnyEventCreated); !ok || created.Id != "5" {
		t.Errorf("last: unexpected variant %#v", *log.Last)
	}
}
