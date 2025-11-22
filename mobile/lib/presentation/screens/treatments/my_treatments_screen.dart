import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';

class MyTreatmentsScreen extends StatefulWidget {
  const MyTreatmentsScreen({super.key});

  @override
  State<MyTreatmentsScreen> createState() => _MyTreatmentsScreenState();
}

class _MyTreatmentsScreenState extends State<MyTreatmentsScreen> {
  String _selectedFilter = 'All'; // 'All', 'Completed', 'Ongoing', 'Upcoming'
  String _selectedSummary = ''; // Track which summary item is selected

  final List<Map<String, dynamic>> _allTreatments = [
    {
      'title': 'Dental Checkup',
      'doctor': 'Dr. Kamal Fernando',
      'date': 'Dec 15, 2023',
      'status': 'Completed',
      'cost': 'LKR 2,500',
      'type': 'General',
      'color': Colors.green,
    },
    {
      'title': 'Teeth Cleaning',
      'doctor': 'Dr. Sameera Perera',
      'date': 'Nov 20, 2023',
      'status': 'Completed',
      'cost': 'LKR 3,000',
      'type': 'Hygiene',
      'color': Colors.green,
    },
    {
      'title': 'Tooth Filling',
      'doctor': 'Dr. Nimal Silva',
      'date': 'Oct 15, 2023',
      'status': 'Completed',
      'cost': 'LKR 4,500',
      'type': 'Restorative',
      'color': Colors.green,
    },
    {
      'title': 'Root Canal Treatment',
      'doctor': 'Dr. Kamal Fernando',
      'date': 'Sep 5, 2023',
      'status': 'Completed',
      'cost': 'LKR 12,000',
      'type': 'Endodontic',
      'color': Colors.green,
    },
    {
      'title': 'Braces Adjustment',
      'doctor': 'Dr. Anoma Rajapaksa',
      'date': 'Jan 10, 2024',
      'status': 'Ongoing',
      'cost': 'LKR 5,000',
      'type': 'Orthodontic',
      'color': Colors.orange,
    },
    {
      'title': 'Teeth Whitening',
      'doctor': 'Dr. Sameera Perera',
      'date': 'Feb 15, 2024',
      'status': 'Upcoming',
      'cost': 'LKR 8,000',
      'type': 'Cosmetic',
      'color': Colors.blue,
    },
  ];

  List<Map<String, dynamic>> get _filteredTreatments {
    if (_selectedFilter == 'All') return _allTreatments;
    return _allTreatments.where((treatment) => treatment['status'] == _selectedFilter).toList();
  }

  int get _completedCount => _allTreatments.where((t) => t['status'] == 'Completed').length;
  int get _ongoingCount => _allTreatments.where((t) => t['status'] == 'Ongoing').length;
  int get _upcomingCount => _allTreatments.where((t) => t['status'] == 'Upcoming').length;

  void _onSummaryItemTap(String status) {
    setState(() {
      _selectedFilter = status;
      _selectedSummary = status;
    });
  }

  void _clearFilters() {
    setState(() {
      _selectedFilter = 'All';
      _selectedSummary = '';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Treatments'),
        backgroundColor: AppColors.primary,
        foregroundColor: AppColors.white,
        actions: [
          if (_selectedFilter != 'All')
            IconButton(
              icon: const Icon(Icons.clear_all),
              onPressed: _clearFilters,
              tooltip: 'Clear Filters',
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _buildTreatmentSummary(),
          const SizedBox(height: 20),
          _buildFilterChips(),
          const SizedBox(height: 20),
          _buildTreatmentHistory(),
        ],
      ),
    );
  }

  Widget _buildTreatmentSummary() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Treatment Summary',
              style: TextStyles.heading4,
            ),
            const SizedBox(height: 15),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildSummaryItem('Completed', _completedCount.toString(), Colors.green, 'Completed'),
                _buildSummaryItem('Ongoing', _ongoingCount.toString(), Colors.orange, 'Ongoing'),
                _buildSummaryItem('Upcoming', _upcomingCount.toString(), Colors.blue, 'Upcoming'),
                _buildSummaryItem('Total', _allTreatments.length.toString(), AppColors.primary, 'All'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryItem(String title, String value, Color color, String status) {
    bool isSelected = _selectedSummary == status;
    
    return GestureDetector(
      onTap: () => _onSummaryItemTap(status),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isSelected ? color : color.withValues(alpha: 0.1),
              shape: BoxShape.circle,
              border: isSelected ? Border.all(color: color, width: 2) : null,
            ),
            child: Text(
              value,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isSelected ? Colors.white : color,
              ),
            ),
          ),
          const SizedBox(height: 5),
          Text(
            title,
            style: TextStyles.caption.copyWith(
              color: isSelected ? color : AppColors.textSecondary,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFilterChips() {
    if (_selectedFilter == 'All') return const SizedBox();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Icon(
              Icons.filter_alt,
              color: AppColors.primary,
              size: 16,
            ),
            const SizedBox(width: 8),
            Text(
              'Showing: $_selectedFilter Treatments',
              style: TextStyles.bodyMedium.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.primary,
              ),
            ),
            const Spacer(),
            GestureDetector(
              onTap: _clearFilters,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.grey100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Icon(Icons.clear, size: 14, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      'Clear',
                      style: TextStyles.caption,
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

  Widget _buildTreatmentHistory() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Treatment History',
                  style: TextStyles.heading4,
                ),
                const Spacer(),
                if (_selectedFilter != 'All')
                  Text(
                    '${_filteredTreatments.length} treatments',
                    style: TextStyles.caption.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 15),
            if (_filteredTreatments.isEmpty)
              _buildEmptyState()
            else
              ..._filteredTreatments.map((treatment) => _buildTreatmentItem(treatment)),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(40),
      child: Column(
        children: [
          Icon(
            Icons.medical_services_outlined,
            size: 64,
            color: AppColors.grey300,
          ),
          const SizedBox(height: 16),
          Text(
            'No treatments found',
            style: TextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try selecting a different filter',
            style: TextStyles.caption,
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _clearFilters,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: AppColors.white,
            ),
            child: const Text('Show All Treatments'),
          ),
        ],
      ),
    );
  }

  Widget _buildTreatmentItem(Map<String, dynamic> treatment) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.grey50,
        borderRadius: BorderRadius.circular(10),
        border: _selectedFilter == 'All' ? null : Border.all(
          color: (treatment['color'] as Color).withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: (treatment['color'] as Color).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              _getTreatmentIcon(treatment['type']),
              color: treatment['color'],
              size: 20,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  treatment['title'],
                  style: TextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  treatment['doctor'],
                  style: TextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.calendar_today, size: 12, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      treatment['date'],
                      style: TextStyles.caption,
                    ),
                    const SizedBox(width: 12),
                    Icon(Icons.attach_money, size: 12, color: AppColors.textSecondary),
                    const SizedBox(width: 4),
                    Text(
                      treatment['cost'],
                      style: TextStyles.caption,
                    ),
                  ],
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: (treatment['color'] as Color).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              treatment['status'],
              style: TextStyles.caption.copyWith(
                color: treatment['color'],
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getTreatmentIcon(String type) {
    switch (type) {
      case 'General':
        return Icons.medical_services;
      case 'Hygiene':
        return Icons.clean_hands;
      case 'Restorative':
        return Icons.build;
      case 'Endodontic':
        return Icons.psychology;
      case 'Orthodontic':
        return Icons.straighten;
      case 'Cosmetic':
        return Icons.brush;
      default:
        return Icons.medical_services;
    }
  }
}