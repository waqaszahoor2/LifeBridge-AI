import 'package:flutter/material.dart';

import '../models/scam_result.dart';
import '../services/api_client.dart';

class TrustScannerScreen extends StatefulWidget {
  const TrustScannerScreen({super.key});

  @override
  State<TrustScannerScreen> createState() => _TrustScannerScreenState();
}

class _TrustScannerScreenState extends State<TrustScannerScreen> {
  final _message = TextEditingController();
  final _url = TextEditingController();
  final _client = const ApiClient();
  ScamResult? _result;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _message.dispose();
    _url.dispose();
    super.dispose();
  }

  Future<void> _scan() async {
    if (_message.text.trim().length < 3) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await _client.postJson('/api/v1/ai/trust-check', {
        'text': _message.text,
        'url': _url.text.trim().isEmpty ? null : _url.text.trim(),
      });
      if (mounted) setState(() => _result = ScamResult.fromJson(data as Map<String, dynamic>));
    } catch (error) {
      if (mounted) setState(() => _error = '$error');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('VerifyLink')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Paste a suspicious message or URL. Do not include passwords, OTPs or card details.',
          ),
          const SizedBox(height: 14),
          TextField(
            controller: _message,
            maxLines: 7,
            decoration: const InputDecoration(
              labelText: 'Message',
              hintText: 'Paste suspicious text',
            ),
          ),
          const SizedBox(height: 12),
          TextField(controller: _url, decoration: const InputDecoration(labelText: 'URL (optional)')),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _loading ? null : _scan,
            icon: const Icon(Icons.shield_outlined),
            label: Text(_loading ? 'Checking…' : 'Run trust check'),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
          if (_result != null)
            Padding(
              padding: const EdgeInsets.only(top: 16),
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${(_result!.riskScore * 100).round()}% ${_result!.riskLevel} risk',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 10),
                      const Text('Evidence', style: TextStyle(fontWeight: FontWeight.bold)),
                      ..._result!.evidence.map(
                        (evidence) => ListTile(
                          dense: true,
                          leading: const Icon(Icons.search),
                          title: Text(evidence),
                        ),
                      ),
                      const Text('Safe actions', style: TextStyle(fontWeight: FontWeight.bold)),
                      ..._result!.safeActions.map(
                        (action) => ListTile(
                          dense: true,
                          leading: const Icon(Icons.check_circle_outline),
                          title: Text(action),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
