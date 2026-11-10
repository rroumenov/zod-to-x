import 'package:json_annotation/json_annotation.dart';

import './case_21_app.dart';

part 'case_21_infra.g.dart';

// Description over a plain alias.
typedef RedefinedPlainAlias = Inherited;

// Description over an alias.
typedef RedefinedDocumentedAlias = Renamed;

typedef PlainOverDocumentedAlias = Renamed;
