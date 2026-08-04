import '../models/feed_item.dart';
import 'api_client.dart';

class FeedService {
  const FeedService({ApiClient client = const ApiClient()}) : _client = client;
  final ApiClient _client;

  Future<List<FeedItem>> fetchFeed({String category = 'all'}) async {
    final query = category == 'all' ? '' : '?category=$category';
    final decoded = await _client.getJson('/api/v1/feed$query');
    return (decoded as List<dynamic>).map((item) => FeedItem.fromJson(item as Map<String, dynamic>)).toList(growable: false);
  }
}
