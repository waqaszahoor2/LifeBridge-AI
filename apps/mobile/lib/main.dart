import 'package:flutter/material.dart';
import 'screens/root_shell.dart';
import 'theme/theme_controller.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final themeController = ThemeController();
  await themeController.load();
  runApp(LifeBridgeApp(themeController: themeController));
}

class LifeBridgeApp extends StatelessWidget {
  const LifeBridgeApp({super.key, required this.themeController});
  final ThemeController themeController;

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: themeController,
      builder: (context, _) => MaterialApp(
        title: 'LifeBridge AI',
        debugShowCheckedModeBanner: false,
        themeMode: themeController.mode,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF1769E0)),
          useMaterial3: true,
          inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder()),
          cardTheme: const CardThemeData(margin: EdgeInsets.zero),
        ),
        darkTheme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: const Color(0xFF6AA8FF), brightness: Brightness.dark),
          useMaterial3: true,
          inputDecorationTheme: const InputDecorationTheme(border: OutlineInputBorder()),
          cardTheme: const CardThemeData(margin: EdgeInsets.zero),
        ),
        home: RootShell(themeController: themeController),
      ),
    );
  }
}
