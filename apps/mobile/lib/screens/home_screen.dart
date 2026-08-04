import 'package:flutter/material.dart';
import '../models/feed_item.dart';
import '../services/feed_service.dart';
import '../theme/theme_controller.dart';
import '../widgets/feed_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.themeController});
  final ThemeController themeController;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _service = const FeedService();
  final _searchController = TextEditingController();
  List<FeedItem> _items = const [];
  String _category = 'all';
  bool _loading = true;
  String? _error;
  static const categories = ['all', 'job', 'scholarship', 'disaster', 'weather', 'service', 'safety', 'learning'];

  @override
  void initState() { super.initState(); _load(); }
  @override
  void dispose() { _searchController.dispose(); super.dispose(); }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try { final items = await _service.fetchFeed(); if (mounted) setState(() => _items = items); }
    catch (error) { if (mounted) setState(() => _error = '$error'); }
    finally { if (mounted) setState(() => _loading = false); }
  }

  List<FeedItem> get _filtered {
    final term = _searchController.text.trim().toLowerCase();
    return _items.where((item) {
      final categoryMatch = _category == 'all' || item.category == _category;
      final text = '${item.title} ${item.summary} ${item.tags}'.toLowerCase();
      return categoryMatch && (term.isEmpty || text.contains(term));
    }).toList(growable: false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('LifeBridge AI'),
        actions: [
          PopupMenuButton<ThemeMode>(
            tooltip: 'Theme', initialValue: widget.themeController.mode, onSelected: widget.themeController.setMode,
            itemBuilder: (context) => const [
              PopupMenuItem(value: ThemeMode.system, child: Text('System theme')),
              PopupMenuItem(value: ThemeMode.light, child: Text('Light theme')),
              PopupMenuItem(value: ThemeMode.dark, child: Text('Dark theme')),
            ], icon: const Icon(Icons.brightness_6_outlined),
          ),
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh), tooltip: 'Refresh'),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 940),
          child: RefreshIndicator(
            onRefresh: _load,
            child: CustomScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              slivers: [
                SliverToBoxAdapter(child: _Header(items: _items)),
                SliverToBoxAdapter(child: Padding(padding: const EdgeInsets.fromLTRB(16, 8, 16, 12), child: TextField(controller: _searchController, onChanged: (_) => setState(() {}), decoration: const InputDecoration(prefixIcon: Icon(Icons.search), hintText: 'Search jobs, scholarships, alerts...')))),
                SliverToBoxAdapter(child: SizedBox(height: 52, child: ListView.separated(padding: const EdgeInsets.symmetric(horizontal: 16), scrollDirection: Axis.horizontal, itemCount: categories.length, separatorBuilder: (_, __) => const SizedBox(width: 8), itemBuilder: (context, index) { final category = categories[index]; return ChoiceChip(selected: _category == category, label: Text(category == 'all' ? 'For You' : category), onSelected: (_) => setState(() => _category = category)); }))),
                if (_loading) const SliverFillRemaining(child: Center(child: CircularProgressIndicator()))
                else if (_error != null) SliverFillRemaining(child: Center(child: Padding(padding: const EdgeInsets.all(24), child: Column(mainAxisSize: MainAxisSize.min, children: [const Icon(Icons.cloud_off, size: 54), const SizedBox(height: 12), Text(_error!, textAlign: TextAlign.center), const SizedBox(height: 12), FilledButton(onPressed: _load, child: const Text('Retry'))]))))
                else if (_filtered.isEmpty) const SliverFillRemaining(child: Center(child: Text('No matching posts.')))
                else SliverPadding(padding: const EdgeInsets.all(16), sliver: SliverList.builder(itemCount: _filtered.length, itemBuilder: (context, index) => FeedCard(item: _filtered[index]))),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.items}); final List<FeedItem> items;
  @override Widget build(BuildContext context) {
    final urgent = items.where((item) => item.severity == 'critical' || item.severity == 'high').length;
    final scholarships = items.where((item) => item.category == 'scholarship').length;
    final jobs = items.where((item) => item.category == 'job').length;
    return Padding(padding: const EdgeInsets.all(16), child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Opportunity & Safety Feed', style: Theme.of(context).textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w900)),
      const SizedBox(height: 5), const Text('Urgent safety updates, verified opportunities and inclusive services.'), const SizedBox(height: 14),
      Card(color: Theme.of(context).colorScheme.errorContainer, child: const Padding(padding: EdgeInsets.all(14), child: Row(children: [Icon(Icons.notifications_active_outlined), SizedBox(width: 10), Expanded(child: Text('Urgent disaster and safety posts are pinned above ordinary content.'))]))),
      const SizedBox(height: 10), Row(children: [Expanded(child: _Metric(label: 'Alerts', value: '$urgent')), const SizedBox(width: 8), Expanded(child: _Metric(label: 'Jobs', value: '$jobs')), const SizedBox(width: 8), Expanded(child: _Metric(label: 'Scholarships', value: '$scholarships'))]),
    ]));
  }
}
class _Metric extends StatelessWidget { const _Metric({required this.label, required this.value}); final String label; final String value; @override Widget build(BuildContext context) => Card(child: Padding(padding: const EdgeInsets.all(12), child: Column(children: [Text(value, style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold)), Text(label)]))); }
