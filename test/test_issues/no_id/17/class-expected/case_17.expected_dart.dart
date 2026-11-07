import 'package:json_annotation/json_annotation.dart';

import './case_17_domain.dart';

part 'case_17_app.g.dart';

@JsonEnum(valueField: 'value')
enum Status {
  opened('Opened'),
  closed('Closed');

  const Status(this.value);
  final String value;
}

typedef CreatedEvent = Event<EventKind>;

typedef OpenedEvent = Event<Status>;

