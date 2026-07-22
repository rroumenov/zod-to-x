import 'package:test/test.dart';
import '../lib/layered_generics.app.dart';
import 'dart_test_utils.dart';

void main() {
  group('NormalUserMetadata', () {
    testRoundtrip('roundtrip', jNormalUserMetadata, NormalUserMetadata.fromJson, (o) => o.toJson());
  });

  group('AdminUserMetadata', () {
    testRoundtrip('roundtrip', jAdminUserMetadata, AdminUserMetadata.fromJson, (o) => o.toJson());
  });

  group('NormalUserEntity (GenericUserEntity<NormalUserMetadata>)', () {
    testRoundtrip(
      'roundtrip',
      jNormalUserEntity,
      (json) => NormalUserEntity.fromJson(
        json,
        (j) => NormalUserMetadata.fromJson(j as Map<String, dynamic>),
      ),
      (obj) => obj.toJson((v) => v.toJson()),
    );
  });

  group('AdminUserEntity (GenericUserEntity<AdminUserMetadata>)', () {
    testRoundtrip(
      'roundtrip',
      jAdminUserEntity,
      (json) => AdminUserEntity.fromJson(
        json,
        (j) => AdminUserMetadata.fromJson(j as Map<String, dynamic>),
      ),
      (obj) => obj.toJson((v) => v.toJson()),
    );
  });
}
