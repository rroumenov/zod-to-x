import 'package:test/test.dart';
import '../lib/user.entity.dart';
import '../lib/user.dtos.dart';
import 'dart_test_utils.dart';

void main() {
  group('CreateUserUseCaseDto', () {
    testRoundtrip(
      'roundtrip',
      jCreateUserUseCaseDto,
      CreateUserUseCaseDto.fromJson,
      (o) => o.toJson(),
    );
  });

  group('CreateUserUseCaseResultDto', () {
    testRoundtrip(
      'roundtrip',
      jCreateUserUseCaseResultDto,
      CreateUserUseCaseResultDto.fromJson,
      (o) => o.toJson(),
    );
  });

  group('UserDtos', () {
    // Exercises UpdateUserUseCaseDto and UpdateUserUseCaseResultDto typedef aliases
    testRoundtrip('roundtrip', jUserDtos, UserDtos.fromJson, (o) => o.toJson());
  });
}
