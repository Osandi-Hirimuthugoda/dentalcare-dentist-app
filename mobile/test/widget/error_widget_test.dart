import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/shared/widgets/error_widget.dart';

void main() {
  group('ErrorDisplayWidget', () {

    testWidgets('renders error message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(message: 'Something went wrong'),
          ),
        ),
      );
      expect(find.text('Something went wrong'), findsOneWidget);
      expect(find.text('Oops!'), findsOneWidget);
    });

    testWidgets('renders error icon', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(message: 'Error occurred'),
          ),
        ),
      );
      expect(find.byIcon(Icons.error_outline), findsOneWidget);
    });

    testWidgets('shows retry button when onRetry is provided', (tester) async {
      bool retried = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(
              message: 'Failed to load',
              onRetry: () => retried = true,
            ),
          ),
        ),
      );
      expect(find.text('Try Again'), findsOneWidget);
      await tester.tap(find.text('Try Again'));
      expect(retried, isTrue);
    });

    testWidgets('hides retry button when onRetry is null', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(message: 'Error'),
          ),
        ),
      );
      expect(find.text('Try Again'), findsNothing);
    });

    testWidgets('renders custom icon', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: ErrorDisplayWidget(
              message: 'No internet',
              icon: Icons.wifi_off,
            ),
          ),
        ),
      );
      expect(find.byIcon(Icons.wifi_off), findsOneWidget);
    });

  });

  group('EmptyStateWidget', () {

    testWidgets('renders empty state message', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(message: 'No appointments found'),
          ),
        ),
      );
      expect(find.text('No appointments found'), findsOneWidget);
    });

    testWidgets('renders default inbox icon', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(message: 'Empty'),
          ),
        ),
      );
      expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
    });

    testWidgets('shows action button when provided', (tester) async {
      bool actionCalled = false;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(
              message: 'No data',
              onAction: () => actionCalled = true,
              actionLabel: 'Add New',
            ),
          ),
        ),
      );
      expect(find.text('Add New'), findsOneWidget);
      await tester.tap(find.text('Add New'));
      expect(actionCalled, isTrue);
    });

    testWidgets('hides action button when not provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: EmptyStateWidget(message: 'Empty'),
          ),
        ),
      );
      expect(find.byType(ElevatedButton), findsNothing);
    });

  });
}
