// Built by test_dart.sh with the expected files of test_issues/no_id/19.
// json_serializable includes null fields by default (reason of Deleted).

import 'dart:convert';
import 'package:test/test.dart';
import 'package:zod_to_x_dart_test/case_19_domain.dart';
import 'package:zod_to_x_dart_test/case_19_app.dart';
import 'dart_test_utils.dart';

const jCase19EventLog = '''{
  "event": {"kind": "Deleted", "id": "1", "reason": "spam"},
  "mixed": {"kind": "Archived", "id": "2"},
  "message": {"type": "Alert", "payload": {"text": "disk", "level": 3}},
  "history": [{"kind": "Created", "id": "3"}, {"kind": "Deleted", "id": "4", "reason": null}],
  "last": {"kind": "Created", "id": "5"},
  "byId": {"6": {"kind": "Deleted", "id": "6", "reason": null}}
}''';

void main() {
  testRoundtrip<EventLog>(
    'Case19 EventLog',
    jCase19EventLog,
    EventLog.fromJson,
    (o) => o.toJson(),
  );

  test('Case19 variants are dispatched by their discriminant', () {
    final log = EventLog.fromJson(jsonDecode(jCase19EventLog) as Map<String, dynamic>);
    expect(log.event, isA<AnyEventDeleted>());
    expect((log.event as AnyEventDeleted).value.reason, 'spam');
    expect(log.mixed, isA<Archived>());
    expect(log.message, isA<AnyMessageAlert>());
    expect((log.message as AnyMessageAlert).value.payload.level, 3);
    expect((log.message as AnyMessageAlert).value.type, MessageType.alert);
    expect(log.history.map((e) => e.runtimeType), [AnyEventCreated, AnyEventDeleted]);
    expect(log.last, isA<AnyEventCreated>());
    expect(log.byId['6'], isA<AnyEventDeleted>());
  });
}
