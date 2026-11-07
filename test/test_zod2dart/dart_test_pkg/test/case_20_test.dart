// Built by test_dart.sh with the expected files of test_issues/no_id/20.

import 'dart:convert';
import 'package:test/test.dart';
import 'package:zod_to_x_dart_test/case_20_domain.dart';
import 'package:zod_to_x_dart_test/case_20_app.dart';
import 'dart_test_utils.dart';

const jCase20Holder = '''{
  "message": {"type": "Sort", "payload": "Date"},
  "messages": [
    {"type": "Ping", "payload": "hello"},
    {"type": "Item", "payload": {"id": "1"}}
  ]
}''';

const jCase20Usage = '''{
  "itemBox": {"value": {"id": "a"}},
  "strBox": {"value": "text"},
  "sortBox": {"value": "Name"},
  "itemPair": {"first": {"id": "b"}, "second": "Date"},
  "pairs": [{"first": {"id": "c"}, "second": "Name"}],
  "message": {"type": "Ping", "payload": "hi"}
}''';

void main() {
  testRoundtrip<Holder>('Case20 Holder', jCase20Holder, Holder.fromJson, (o) => o.toJson());
  testRoundtrip<Usage>('Case20 Usage', jCase20Usage, Usage.fromJson, (o) => o.toJson());

  test('Case20 templates are deserialized by their type', () {
    final holder = Holder.fromJson(jsonDecode(jCase20Holder) as Map<String, dynamic>);
    expect(holder.message, isA<Message<MessageType, SortField>>());
    expect((holder.message as Message<MessageType, SortField>).payload, SortField.date);
    expect(holder.messages[0], isA<Message<MessageType, String>>());
    expect(holder.messages[1], isA<Message<MessageType, Item>>());

    final usage = Usage.fromJson(jsonDecode(jCase20Usage) as Map<String, dynamic>);
    expect(usage.sortBox.value, SortField.name);
    expect(usage.itemPair.second, SortField.date);
    expect(usage.pairs.single.first.id, 'c');
  });
}
