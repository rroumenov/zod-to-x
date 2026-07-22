import 'package:test/test.dart';
import '../lib/user.entity.dart';
import 'dart_test_utils.dart';

void main() {
  group('UserEntity', () {
    testRoundtrip('roundtrip', jUserEntity, UserEntity.fromJson, (o) => o.toJson());
  });

  group('UserModels', () {
    testRoundtrip('roundtrip', jUserModels, UserModels.fromJson, (o) => o.toJson());
  });
}
