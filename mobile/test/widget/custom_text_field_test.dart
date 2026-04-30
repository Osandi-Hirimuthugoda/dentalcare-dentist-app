import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_application_1/shared/widgets/custom_text_field.dart';

void main() {
  group('CustomTextField Widget', () {

    testWidgets('renders with hint text', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CustomTextField(hintText: 'Enter email'),
          ),
        ),
      );
      expect(find.text('Enter email'), findsOneWidget);
    });

    testWidgets('renders with label text', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CustomTextField(labelText: 'Email Address'),
          ),
        ),
      );
      expect(find.text('Email Address'), findsOneWidget);
    });

    testWidgets('renders with error text', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CustomTextField(errorText: 'Invalid email'),
          ),
        ),
      );
      expect(find.text('Invalid email'), findsOneWidget);
    });

    testWidgets('obscures text when obscureText is true', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CustomTextField(hintText: 'Password', obscureText: true),
          ),
        ),
      );
      final editableText = tester.widget<EditableText>(find.byType(EditableText));
      expect(editableText.obscureText, isTrue);
    });

    testWidgets('does not obscure text by default', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CustomTextField(hintText: 'Email'),
          ),
        ),
      );
      final editableText = tester.widget<EditableText>(find.byType(EditableText));
      expect(editableText.obscureText, isFalse);
    });

    testWidgets('calls onChanged when text is entered', (tester) async {
      String? changedValue;
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CustomTextField(
              hintText: 'Type here',
              onChanged: (val) => changedValue = val,
            ),
          ),
        ),
      );
      await tester.enterText(find.byType(TextFormField), 'hello');
      expect(changedValue, 'hello');
    });

    testWidgets('renders prefix icon when provided', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CustomTextField(
              hintText: 'Email',
              prefixIcon: Icon(Icons.email),
            ),
          ),
        ),
      );
      expect(find.byIcon(Icons.email), findsOneWidget);
    });

    testWidgets('is disabled when enabled is false', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: CustomTextField(hintText: 'Disabled', enabled: false),
          ),
        ),
      );
      final field = tester.widget<TextFormField>(find.byType(TextFormField));
      expect(field.enabled, isFalse);
    });

    testWidgets('controller updates field value', (tester) async {
      final controller = TextEditingController(text: 'initial');
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: CustomTextField(controller: controller, hintText: 'Test'),
          ),
        ),
      );
      expect(find.text('initial'), findsOneWidget);
    });

  });
}
