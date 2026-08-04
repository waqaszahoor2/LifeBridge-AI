import 'package:flutter/material.dart';
import '../theme/theme_controller.dart';
import 'disaster_screen.dart';
import 'home_screen.dart';
import 'opportunities_screen.dart';
import 'profile_screen.dart';
import 'services_screen.dart';
import 'skills_screen.dart';
import 'trust_scanner_screen.dart';

class RootShell extends StatefulWidget {
  const RootShell({super.key, required this.themeController});
  final ThemeController themeController;

  @override
  State<RootShell> createState() => _RootShellState();
}

class _RootShellState extends State<RootShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final screens = [
      HomeScreen(themeController: widget.themeController),
      const OpportunitiesScreen(),
      const SkillsScreen(),
      const DisasterScreen(),
      const TrustScannerScreen(),
      const ServicesScreen(),
      ProfileScreen(themeController: widget.themeController),
    ];
    final destinations = const [
      NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: 'Feed'),
      NavigationDestination(icon: Icon(Icons.work_outline), label: 'Opportunities'),
      NavigationDestination(icon: Icon(Icons.auto_awesome_outlined), label: 'Skills'),
      NavigationDestination(icon: Icon(Icons.warning_amber_outlined), label: 'Alerts'),
      NavigationDestination(icon: Icon(Icons.verified_user_outlined), label: 'Verify'),
      NavigationDestination(icon: Icon(Icons.map_outlined), label: 'Services'),
      NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profile'),
    ];

    if (width >= 900) {
      return Scaffold(
        body: Row(
          children: [
            NavigationRail(
              extended: width >= 1150,
              selectedIndex: _index,
              onDestinationSelected: (value) => setState(() => _index = value),
              leading: const Padding(
                padding: EdgeInsets.symmetric(vertical: 18),
                child: CircleAvatar(child: Text('LB')),
              ),
              destinations: destinations
                  .map((item) => NavigationRailDestination(icon: item.icon, selectedIcon: item.selectedIcon, label: Text(item.label)))
                  .toList(),
            ),
            const VerticalDivider(width: 1),
            Expanded(child: IndexedStack(index: _index, children: screens)),
          ],
        ),
      );
    }
    return Scaffold(
      body: IndexedStack(index: _index, children: screens),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: destinations,
        labelBehavior: NavigationDestinationLabelBehavior.onlyShowSelected,
      ),
    );
  }
}
