import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/shared/widgets/loading_indicator.dart';

void main() {
  group('LoadingIndicator Widget', () {

    testWidgets('renders CircularProgressIndicator', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingIndicator(),
          ),
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
    });

    testWidgets('renders message when provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingIndicator(message: 'Loading data...'),
          ),
        ),
      );
      expect(find.text('Loading data...'), findsOneWidget);
    });

    testWidgets('hides message when not provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingIndicator(),
          ),
        ),
      );
      expect(find.byType(Text), findsNothing);
    });

    testWidgets('renders with custom size', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingIndicator(size: 60),
          ),
        ),
      );
      final sizedBox = tester.widget<SizedBox>(
        find.ancestor(
          of: find.byType(CircularProgressIndicator),
          matching: find.byType(SizedBox),
        ).first,
      );
      expect(sizedBox.width, 60);
      expect(sizedBox.height, 60);
    });

  });

  group('LoadingOverlay Widget', () {

    testWidgets('renders loading indicator', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingOverlay(),
          ),
        ),
      );
      expect(find.byType(LoadingIndicator), findsOneWidget);
    });

    testWidgets('renders with message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingOverlay(message: 'Please wait...'),
          ),
        ),
      );
      expect(find.text('Please wait...'), findsOneWidget);
    });

    testWidgets('has dark overlay background', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: LoadingOverlay(),
          ),
        ),
      );
      final container = tester.widget<Container>(find.byType(Container).first);
      expect(container.color, Colors.black54);
    });

  });
}
