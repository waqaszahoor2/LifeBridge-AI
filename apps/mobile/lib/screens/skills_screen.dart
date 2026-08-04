import 'package:flutter/material.dart';

import '../services/api_client.dart';

class SkillsScreen extends StatefulWidget {
  const SkillsScreen({super.key});

  @override
  State<SkillsScreen> createState() => _SkillsScreenState();
}

class _SkillsScreenState extends State<SkillsScreen> {
  final _controller = TextEditingController();
  final _client = const ApiClient();
  Map<String, dynamic>? _result;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _analyse() async {
    if (_controller.text.trim().length < 20) {
      setState(() => _error = 'Paste at least 20 characters of redacted CV text.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await _client.postJson('/api/v1/ai/cv/analyze', {'text': _controller.text});
      if (mounted) setState(() => _result = result as Map<String, dynamic>);
    } catch (error) {
      if (mounted) setState(() => _error = '$error');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final skills = (_result?['extracted_skills'] as List?)?.cast<String>() ?? const <String>[];
    final roles = (_result?['recommended_roles'] as List?)?.cast<Map<String, dynamic>>() ?? const [];
    return Scaffold(
      appBar: AppBar(title: const Text('SkillBridge')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Paste redacted CV text. Do not include ID documents, passwords or unnecessary personal data.'),
          const SizedBox(height: 12),
          TextField(
            controller: _controller,
            minLines: 8,
            maxLines: 16,
            decoration: const InputDecoration(labelText: 'CV text'),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            onPressed: _loading ? null : _analyse,
            icon: const Icon(Icons.auto_awesome),
            label: Text(_loading ? 'Analysing…' : 'Analyse skills'),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
          if (_result != null) ...[
            const SizedBox(height: 18),
            Text('Extracted skills', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Wrap(spacing: 7, runSpacing: 7, children: skills.map((skill) => Chip(label: Text(skill))).toList()),
            const SizedBox(height: 18),
            Text('Recommended roles', style: Theme.of(context).textTheme.titleLarge),
            ...roles.map(
              (role) => Card(
                margin: const EdgeInsets.only(top: 10),
                child: ListTile(
                  leading: const Icon(Icons.work_outline),
                  title: Text('${role['role']}'),
                  subtitle: Text('Matched: ${(role['matched_skills'] as List?)?.join(', ') ?? 'semantic profile'}'),
                  trailing: Text('${(((role['score'] as num?) ?? 0) * 100).round()}%'),
                ),
              ),
            ),
            const Padding(
              padding: EdgeInsets.only(top: 10),
              child: Text('Role similarity is not a hiring probability.'),
            ),
          ],
        ],
      ),
    );
  }
}
