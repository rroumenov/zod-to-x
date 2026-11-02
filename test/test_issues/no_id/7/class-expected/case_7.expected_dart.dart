import 'package:json_annotation/json_annotation.dart';

part 'case_7_domain.g.dart';

@JsonSerializable(explicitToJson: true)
class File {
  final String name;
  final int size;

  File({
    required this.name,
    required this.size,
  });

  factory File.fromJson(Map<String, dynamic> json) =>
    _$FileFromJson(json);

  Map<String, dynamic> toJson() => _$FileToJson(this);
}

@JsonSerializable(explicitToJson: true)
class Folder {
  final String name;
  final File? mainFile;
  final File? readme;
  final List<File> files;
  final String? owner;

  Folder({
    required this.name,
    this.mainFile,
    this.readme,
    required this.files,
    this.owner,
  });

  factory Folder.fromJson(Map<String, dynamic> json) =>
    _$FolderFromJson(json);

  Map<String, dynamic> toJson() => _$FolderToJson(this);
}
