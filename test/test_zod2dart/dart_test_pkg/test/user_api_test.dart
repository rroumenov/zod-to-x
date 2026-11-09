import 'package:test/test.dart';
import '../lib/user.entity.dart';
import '../lib/user.dtos.dart';
import '../lib/user.api.dart';
import 'dart_test_utils.dart';

void main() {
  group('ResUpdateUserMulti', () {
    // Exercises List<UpdateUserUseCaseResultDto> field with custom @JsonKey helpers
    testRoundtrip('roundtrip', jResUpdateUserMulti, ResUpdateUserMulti.fromJson, (o) => o.toJson());
  });

  group('UserApi', () {
    // Exercises ReqUpdateUser, ResUpdateUser typedef fields
    testRoundtrip('roundtrip', jUserApi, UserApi.fromJson, (o) => o.toJson());
  });
}
