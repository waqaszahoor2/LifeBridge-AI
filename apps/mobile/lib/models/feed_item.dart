class FeedItem {
  const FeedItem({
    required this.id,
    required this.externalId,
    required this.category,
    required this.title,
    required this.summary,
    required this.sourceName,
    required this.sourceUrl,
    required this.publishedAt,
    required this.lastCheckedAt,
    required this.location,
    required this.tags,
    required this.severity,
    required this.verificationStatus,
    required this.sourceReliability,
    this.expiresAt,
  });

  final int id;
  final String externalId;
  final String category;
  final String title;
  final String summary;
  final String sourceName;
  final String sourceUrl;
  final DateTime publishedAt;
  final DateTime lastCheckedAt;
  final DateTime? expiresAt;
  final String location;
  final String tags;
  final String severity;
  final String verificationStatus;
  final double sourceReliability;

  factory FeedItem.fromJson(Map<String, dynamic> json) => FeedItem(
        id: json['id'] as int,
        externalId: json['external_id'] as String,
        category: json['category'] as String,
        title: json['title'] as String,
        summary: json['summary'] as String,
        sourceName: json['source_name'] as String,
        sourceUrl: json['source_url'] as String,
        publishedAt: DateTime.parse(json['published_at'] as String),
        lastCheckedAt: DateTime.parse(json['last_checked_at'] as String),
        expiresAt: json['expires_at'] == null ? null : DateTime.parse(json['expires_at'] as String),
        location: json['location'] as String,
        tags: json['tags'] as String,
        severity: json['severity'] as String,
        verificationStatus: json['verification_status'] as String,
        sourceReliability: (json['source_reliability'] as num).toDouble(),
      );
}
