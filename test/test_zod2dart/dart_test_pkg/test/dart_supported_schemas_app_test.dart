import 'package:test/test.dart';
import '../lib/dart_supported_schemas_entity.dart';
import '../lib/dart_supported_schemas_app.dart';
import 'dart_test_utils.dart';

void main() {
  group('DartSupportedSchemasApplication', () {
    // Exercises all "new"-prefixed typedef aliases: NewObjectItem, NewDiscriminatedUnionItem, etc.
    testRoundtrip(
      'roundtrip',
      jDartSupportedSchemasApplication,
      DartSupportedSchemasApplication.fromJson,
      (o) => o.toJson(),
    );
  });
}
