import 'package:flutter_test/flutter_test.dart';
import 'package:lifebridge_ai/models/feed_item.dart';

void main() {
  test('FeedItem parses backend JSON', () {
    final item = FeedItem.fromJson({
      'id': 1,
      'external_id': 'demo-1',
      'category': 'job',
      'title': 'Data Analyst',
      'summary': 'A synthetic role.',
      'source_name': 'Demo',
      'source_url': 'https://example.org',
      'published_at': '2026-08-04T10:00:00Z',
      'last_checked_at': '2026-08-04T11:00:00Z',
      'expires_at': null,
      'location': 'Remote',
      'tags': 'python;sql',
      'severity': 'low',
      'verification_status': 'demo',
      'source_reliability': 0.8,
    });
    expect(item.title, 'Data Analyst');
    expect(item.sourceReliability, 0.8);
  });
}
