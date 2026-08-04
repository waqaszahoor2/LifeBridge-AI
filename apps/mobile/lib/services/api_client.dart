import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/app_config.dart';

class ApiClient {
  const ApiClient({http.Client? client}) : _client = client;
  final http.Client? _client;

  Future<dynamic> getJson(String path) async {
    final client = _client ?? http.Client();
    try {
      final response = await client.get(Uri.parse('${AppConfig.apiBaseUrl}$path'), headers: const {'Accept': 'application/json'}).timeout(const Duration(seconds: 20));
      if (response.statusCode < 200 || response.statusCode >= 300) throw ApiException('Server returned ${response.statusCode}');
      return jsonDecode(response.body);
    } finally { if (_client == null) client.close(); }
  }

  Future<dynamic> postJson(String path, Map<String, dynamic> body) async {
    final client = _client ?? http.Client();
    try {
      final response = await client.post(Uri.parse('${AppConfig.apiBaseUrl}$path'), headers: const {'Accept':'application/json','Content-Type':'application/json'}, body: jsonEncode(body)).timeout(const Duration(seconds: 20));
      if (response.statusCode < 200 || response.statusCode >= 300) throw ApiException('Server returned ${response.statusCode}: ${response.body}');
      return jsonDecode(response.body);
    } finally { if (_client == null) client.close(); }
  }
}

class ApiException implements Exception {
  const ApiException(this.message); final String message;
  @override String toString() => message;
}
