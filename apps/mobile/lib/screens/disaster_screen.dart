import 'package:flutter/material.dart';

import '../models/feed_item.dart';
import '../services/feed_service.dart';
import '../widgets/feed_card.dart';

class DisasterScreen extends StatefulWidget {
  const DisasterScreen({super.key});

  @override
  State<DisasterScreen> createState() => _DisasterScreenState();
}

class _DisasterScreenState extends State<DisasterScreen> {
  final _service = const FeedService();
  List<FeedItem> _items = const [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final all = await _service.fetchFeed();
      if (mounted) {
        setState(() {
          _items = all
              .where((item) => ['disaster', 'weather', 'safety'].contains(item.category))
              .toList(growable: false);
        });
      }
    } catch (error) {
      if (mounted) setState(() => _error = '$error');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('DisasterLink')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: FilledButton(onPressed: _load, child: Text('Retry: $_error')))
              : RefreshIndicator(
                  onRefresh: _load,
                  child: ListView(
                    padding: const EdgeInsets.all(16),
                    children: [
                      Card(
                        color: Theme.of(context).colorScheme.errorContainer,
                        child: const Padding(
                          padding: EdgeInsets.all(14),
                          child: Text(
                            'Alerts are decision support. Follow instructions from local emergency authorities.',
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      ..._items.map((item) => FeedCard(item: item)),
                    ],
                  ),
                ),
    );
  }
}
