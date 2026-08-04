import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/feed_item.dart';

class FeedCard extends StatelessWidget {
  const FeedCard({super.key, required this.item});
  final FeedItem item;

  static const icons = <String, IconData>{
    'job': Icons.work_outline,
    'scholarship': Icons.school_outlined,
    'disaster': Icons.warning_amber_rounded,
    'weather': Icons.cloud_outlined,
    'service': Icons.local_hospital_outlined,
    'safety': Icons.verified_user_outlined,
    'learning': Icons.menu_book_outlined,
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final urgent = item.severity == 'critical' || item.severity == 'high';
    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      clipBehavior: Clip.antiAlias,
      child: Container(
        decoration: BoxDecoration(
          border: Border(left: BorderSide(color: urgent ? theme.colorScheme.error : Colors.transparent, width: 5)),
        ),
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                CircleAvatar(
                  child: Icon(icons[item.category] ?? Icons.article_outlined),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Wrap(
                        spacing: 8,
                        runSpacing: 5,
                        children: [
                          Chip(label: Text(item.category.toUpperCase()), visualDensity: VisualDensity.compact),
                          Chip(label: Text(item.severity.toUpperCase()), visualDensity: VisualDensity.compact),
                        ],
                      ),
                      Text(item.title, style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w800)),
                      const SizedBox(height: 3),
                      Text('${item.sourceName} • ${item.location}', style: theme.textTheme.bodySmall),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 14),
            Text(item.summary, style: theme.textTheme.bodyMedium?.copyWith(height: 1.45)),
            const SizedBox(height: 14),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Wrap(
                spacing: 20,
                runSpacing: 8,
                children: [
                  _Meta(label: 'Published', value: DateFormat.yMMMd().add_jm().format(item.publishedAt.toLocal())),
                  _Meta(label: 'Last checked', value: DateFormat.yMMMd().add_jm().format(item.lastCheckedAt.toLocal())),
                  if (item.expiresAt != null) _Meta(label: 'Deadline', value: DateFormat.yMMMd().format(item.expiresAt!.toLocal())),
                  _Meta(label: 'Trust', value: '${(item.sourceReliability * 100).round()}% • ${item.verificationStatus}'),
                ],
              ),
            ),
            const SizedBox(height: 10),
            Wrap(
              spacing: 6,
              runSpacing: 6,
              children: item.tags
                  .split(';')
                  .where((tag) => tag.isNotEmpty)
                  .take(5)
                  .map((tag) => Chip(label: Text(tag), visualDensity: VisualDensity.compact))
                  .toList(),
            ),
            const Divider(height: 24),
            Row(
              children: [
                FilledButton.tonalIcon(onPressed: () => launchUrl(Uri.parse(item.sourceUrl), mode: LaunchMode.externalApplication), icon: const Icon(Icons.open_in_new), label: const Text('Source')),
                const Spacer(),
                IconButton(onPressed: () {}, icon: const Icon(Icons.bookmark_border), tooltip: 'Save'),
                IconButton(onPressed: () {}, icon: const Icon(Icons.share_outlined), tooltip: 'Share'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => SizedBox(
        width: 170,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: Theme.of(context).textTheme.labelMedium?.copyWith(fontWeight: FontWeight.bold)),
            Text(value, style: Theme.of(context).textTheme.bodySmall),
          ],
        ),
      );
}
