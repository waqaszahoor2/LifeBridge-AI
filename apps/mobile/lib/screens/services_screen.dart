import 'package:flutter/material.dart';

import '../services/api_client.dart';

class ServicesScreen extends StatefulWidget {
  const ServicesScreen({super.key});

  @override
  State<ServicesScreen> createState() => _ServicesScreenState();
}

class _ServicesScreenState extends State<ServicesScreen> {
  final _latitude = TextEditingController(text: '31.5204');
  final _longitude = TextEditingController(text: '74.3587');
  final _client = const ApiClient();
  List<Map<String, dynamic>> _items = const [];
  bool _loading = false;
  String _type = 'all';
  String? _error;

  @override
  void dispose() {
    _latitude.dispose();
    _longitude.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final latitude = double.tryParse(_latitude.text.trim());
    final longitude = double.tryParse(_longitude.text.trim());
    if (latitude == null || longitude == null) {
      setState(() => _error = 'Enter valid latitude and longitude values.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final data = await _client.getJson(
        '/api/v1/services/nearby?latitude=$latitude&longitude=$longitude&service_type=$_type',
      );
      if (mounted) {
        setState(() => _items = (data as List).cast<Map<String, dynamic>>());
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
      appBar: AppBar(title: const Text('ServiceLink')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              SizedBox(
                width: 180,
                child: TextField(
                  controller: _latitude,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                  decoration: const InputDecoration(labelText: 'Latitude'),
                ),
              ),
              SizedBox(
                width: 180,
                child: TextField(
                  controller: _longitude,
                  keyboardType: const TextInputType.numberWithOptions(decimal: true, signed: true),
                  decoration: const InputDecoration(labelText: 'Longitude'),
                ),
              ),
              SizedBox(
                width: 180,
                child: DropdownButtonFormField<String>(
                  initialValue: _type,
                  items: const [
                    DropdownMenuItem(value: 'all', child: Text('All')),
                    DropdownMenuItem(value: 'hospital', child: Text('Hospitals')),
                    DropdownMenuItem(value: 'clinic', child: Text('Clinics')),
                    DropdownMenuItem(value: 'shelter', child: Text('Shelters')),
                    DropdownMenuItem(value: 'training', child: Text('Training')),
                  ],
                  onChanged: (value) => setState(() => _type = value ?? 'all'),
                  decoration: const InputDecoration(labelText: 'Service type'),
                ),
              ),
              FilledButton(
                onPressed: _loading ? null : _search,
                child: Text(_loading ? 'Searching…' : 'Find services'),
              ),
            ],
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.only(top: 12),
              child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
          const SizedBox(height: 16),
          ..._items.map(
            (item) => Card(
              margin: const EdgeInsets.only(bottom: 10),
              child: ListTile(
                leading: const Icon(Icons.location_on_outlined),
                title: Text('${item['name']}'),
                subtitle: Text(
                  '${item['service_type']} · ${item['distance_km']} km\nWheelchair: ${item['accessibility']}',
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
