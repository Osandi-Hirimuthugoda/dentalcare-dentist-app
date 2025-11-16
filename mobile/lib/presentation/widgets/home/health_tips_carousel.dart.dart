import 'package:flutter/material.dart';

class HealthTipsCarousel extends StatelessWidget {
  final BuildContext context;
  
  const HealthTipsCarousel({super.key, required this.context});

  void _showSnackBar(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _viewAllHealthTips() {
    Navigator.pushNamed(context, '/health');
  }

  void _viewTipDetails(String tipTitle) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        height: MediaQuery.of(context).size.height * 0.7,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  tipTitle,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 20),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildTipDetailContent(tipTitle),
                    const SizedBox(height: 20),
                    const Text(
                      'Why this is important:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 10),
                    _buildImportanceContent(tipTitle),
                    const SizedBox(height: 20),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(context);
                          _showSnackBar('Added to your health goals!');
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.teal,
                          foregroundColor: Colors.white,
                        ),
                        child: const Text('Add to My Goals'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTipDetailContent(String tipTitle) {
    switch (tipTitle) {
      case 'Brush Twice Daily':
        return const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Proper brushing technique:'),
            SizedBox(height: 10),
            Text('• Use a soft-bristled toothbrush'),
            Text('• Brush for 2 minutes'),
            Text('• Hold brush at 45-degree angle'),
            Text('• Use gentle circular motions'),
            Text('• Don\'t forget to brush your tongue'),
          ],
        );
      case 'Regular Checkups':
        return const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('What to expect during checkups:'),
            SizedBox(height: 10),
            Text('• Professional teeth cleaning'),
            Text('• Oral cancer screening'),
            Text('• Gum disease evaluation'),
            Text('• Dental X-rays if needed'),
            Text('• Personalized oral care advice'),
          ],
        );
      case 'Healthy Diet':
        return const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Tooth-friendly foods:'),
            SizedBox(height: 10),
            Text('• Crunchy fruits and vegetables'),
            Text('• Dairy products (cheese, milk)'),
            Text('• Leafy greens'),
            Text('• Green and black teas'),
            Text('• Foods with fluoride'),
          ],
        );
      case 'Floss Daily':
        return const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Proper flossing technique:'),
            SizedBox(height: 10),
            Text('• Use about 18 inches of floss'),
            Text('• Wrap around middle fingers'),
            Text('• Gently slide between teeth'),
            Text('• Curve around each tooth'),
            Text('• Use clean sections as you go'),
          ],
        );
      default:
        return const Text('Detailed information about this dental health tip.');
    }
  }

  Widget _buildImportanceContent(String tipTitle) {
    switch (tipTitle) {
      case 'Brush Twice Daily':
        return const Text('Regular brushing removes plaque, prevents cavities, and maintains fresh breath. It\'s your first line of defense against dental problems.');
      case 'Regular Checkups':
        return const Text('Regular dental visits help catch problems early, prevent serious issues, and maintain overall oral health. Early detection saves time and money.');
      case 'Healthy Diet':
        return const Text('A balanced diet provides essential nutrients for strong teeth and gums, while avoiding sugary foods that cause decay.');
      case 'Floss Daily':
        return const Text('Flossing removes plaque and food particles from between teeth where your toothbrush can\'t reach, preventing gum disease and cavities.');
      default:
        return const Text('This practice is essential for maintaining good oral hygiene and preventing dental problems.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> tips = [
      {
        'title': 'Brush Twice Daily',
        'subtitle': 'Morning and night for 2 minutes',
        'icon': '🦷',
        'color': Colors.blue[50]!,
      },
      {
        'title': 'Regular Checkups',
        'subtitle': 'Visit dentist every 6 months',
        'icon': '👨‍⚕️',
        'color': Colors.green[50]!,
      },
      {
        'title': 'Healthy Diet',
        'subtitle': 'Avoid sugary foods and drinks',
        'icon': '🍎',
        'color': Colors.orange[50]!,
      },
      {
        'title': 'Floss Daily',
        'subtitle': 'Remove hidden plaque',
        'icon': '🧵',
        'color': Colors.purple[50]!,
      },
      {
        'title': 'Use Mouthwash',
        'subtitle': 'Kill bacteria and freshen breath',
        'icon': '💧',
        'color': Colors.teal[50]!,
      },
      {
        'title': 'Stay Hydrated',
        'subtitle': 'Drink plenty of water',
        'icon': '💧',
        'color': Colors.cyan[50]!,
      },
    ];

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                "Dental Health Tips",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
              TextButton(
                onPressed: _viewAllHealthTips,
                child: const Text(
                  "View All",
                  style: TextStyle(
                    color: Colors.teal,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          SizedBox(
            height: 140,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: tips.length,
              itemBuilder: (context, index) {
                final tip = tips[index];
                return GestureDetector(
                  onTap: () => _viewTipDetails(tip['title']),
                  child: Container(
                    width: 160,
                    margin: EdgeInsets.only(
                      right: index == tips.length - 1 ? 0 : 15,
                    ),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: tip['color'],
                      borderRadius: BorderRadius.circular(15),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.grey.withOpacity(0.1),
                          blurRadius: 5,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          tip['icon'],
                          style: const TextStyle(fontSize: 24),
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              tip['title'],
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: Colors.black87,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              tip['subtitle'],
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey[700],
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}