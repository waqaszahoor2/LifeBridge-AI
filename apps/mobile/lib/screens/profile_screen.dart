import 'package:flutter/material.dart';

import '../theme/theme_controller.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.themeController});

  final ThemeController themeController;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            'Recommendation profile',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 14),
          const TextField(decoration: InputDecoration(labelText: 'Country')),
          const SizedBox(height: 12),
          const TextField(decoration: InputDecoration(labelText: 'City')),
          const SizedBox(height: 12),
          const TextField(decoration: InputDecoration(labelText: 'Study level')),
          const SizedBox(height: 12),
          const TextField(decoration: InputDecoration(labelText: 'Field of study')),
          const SizedBox(height: 12),
          const TextField(decoration: InputDecoration(labelText: 'Skills (comma separated)')),
          const SizedBox(height: 12),
          DropdownButtonFormField<ThemeMode>(
            initialValue: themeController.mode,
            decoration: const InputDecoration(labelText: 'Theme'),
            items: const [
              DropdownMenuItem(value: ThemeMode.system, child: Text('System default')),
              DropdownMenuItem(value: ThemeMode.light, child: Text('Light')),
              DropdownMenuItem(value: ThemeMode.dark, child: Text('Dark')),
            ],
            onChanged: (value) {
              if (value != null) themeController.setMode(value);
            },
          ),
          const SizedBox(height: 16),
          FilledButton(
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Connect login to save this profile to the backend.')),
              );
            },
            child: const Text('Save profile'),
          ),
        ],
      ),
    );
  }
}
