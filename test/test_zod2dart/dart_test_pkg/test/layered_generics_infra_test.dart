import 'dart:convert';
import 'package:test/test.dart';
import '../lib/layered_generics.app.dart';
import '../lib/layered_generics.infra.dart';
import 'dart_test_utils.dart';

void main() {
  group('SomeDtoResult', () {
    testRoundtrip('roundtrip', jSomeDtoResult, SomeDtoResult.fromJson, (o) => o.toJson());
  });

  group('OtherDtoResult', () {
    testRoundtrip('roundtrip', jOtherDtoResult, OtherDtoResult.fromJson, (o) => o.toJson());
  });

  group('HttpSuccessfulResponse<SomeDtoResult>', () {
    testRoundtrip(
      'roundtrip',
      jHttpSuccessfulResponse,
      (json) => HttpSuccessfulResponse.fromJson(
        json,
        (j) => SomeDtoResult.fromJson(j as Map<String, dynamic>),
      ),
      (obj) => obj.toJson((v) => v.toJson()),
    );
  });

  group('HttpUnsuccessfulResponse', () {
    testRoundtrip(
      'roundtrip',
      jHttpUnsuccessfulResponse,
      HttpUnsuccessfulResponse.fromJson,
      (o) => o.toJson(),
    );
  });

  group('HttpErrorResponse', () {
    testRoundtrip('roundtrip', jHttpErrorResponse, HttpErrorResponse.fromJson, (o) => o.toJson());
  });

  group('ObjectWithGeneric', () {
    // Exercises: InternalObjectWithGeneric typedef alias, direct generic field,
    // GenericUserEntity<SomeDtoResult>, and AdminUserEntity (GenericUserEntity<AdminUserMetadata>)
    testRoundtrip('roundtrip', jObjectWithGeneric, ObjectWithGeneric.fromJson, (o) => o.toJson());
  });

  group('IntersectedDataRetrieve', () {
    testRoundtrip(
      'roundtrip',
      jIntersectedDataRetrieve,
      IntersectedDataRetrieve.fromJson,
      (o) => o.toJson(),
    );
  });

  group('discriminantDataRetrieveFromJson dispatch', () {
    test('success=true → HttpSuccessfulResponse<SomeDtoResult>', () {
      final json = jsonDecode(jHttpSuccessfulResponse) as Map<String, dynamic>;
      final result = discriminantDataRetrieveFromJson(json);
      expect(result, isA<HttpSuccessfulResponse<SomeDtoResult>>());
      final res = result as HttpSuccessfulResponse<SomeDtoResult>;
      expect(res.success, isTrue);
      expect(res.data.id, equals('dto_001'));
    });

    test('success=false → HttpUnsuccessfulResponse', () {
      final json = jsonDecode(jHttpUnsuccessfulResponse) as Map<String, dynamic>;
      final result = discriminantDataRetrieveFromJson(json);
      expect(result, isA<HttpUnsuccessfulResponse>());
      final res = result as HttpUnsuccessfulResponse;
      expect(res.success, isFalse);
      expect(res.message, equals('Operation failed'));
    });

    test('unknown discriminant → throws Exception', () {
      final json = jsonDecode('{"success": "maybe"}') as Map<String, dynamic>;
      expect(() => discriminantDataRetrieveFromJson(json), throwsA(isA<Exception>()));
    });
  });
}
