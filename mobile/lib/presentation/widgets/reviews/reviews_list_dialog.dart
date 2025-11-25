import 'package:flutter/material.dart';
import 'package:flutter_application_1/core/themes/colors.dart';
import 'package:flutter_application_1/core/themes/text_styles.dart';
import 'package:flutter_application_1/data/data_sources/remote/dental_remote_data_source.dart';
import 'package:flutter_application_1/injection_container.dart';
import 'package:intl/intl.dart';

class ReviewsListDialog extends StatefulWidget {
  final String doctorId;
  final String doctorName;

  const ReviewsListDialog({
    super.key,
    required this.doctorId,
    required this.doctorName,
  });

  @override
  State<ReviewsListDialog> createState() => _ReviewsListDialogState();
}

class _ReviewsListDialogState extends State<ReviewsListDialog> {
  List<dynamic> _reviews = [];
  bool _isLoading = true;
  String? _errorMessage;

  late final DentalRemoteDataSource _dentalDataSource;

  @override
  void initState() {
    super.initState();
    _dentalDataSource = getIt<DentalRemoteDataSource>();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      debugPrint(' Loading reviews for doctor: ${widget.doctorId}');
      final reviews = await _dentalDataSource.getDoctorReviews(widget.doctorId);
      debugPrint(' Loaded ${reviews.length} reviews');
      
      setState(() {
        _reviews = reviews;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load reviews: $e';
        _isLoading = false;
      });
      debugPrint(' Error loading reviews: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.9,
          maxHeight: MediaQuery.of(context).size.height * 0.8,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(16),
                  topRight: Radius.circular(16),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Reviews',
                          style: TextStyles.heading3.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          widget.doctorName,
                          style: TextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      IconButton(
                        icon: const Icon(Icons.refresh),
                        onPressed: _loadReviews,
                        tooltip: 'Refresh',
                      ),
                      IconButton(
                        icon: const Icon(Icons.close),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            // Reviews List
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _errorMessage != null
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _errorMessage!,
                                style: TextStyles.bodyMedium.copyWith(
                                  color: Colors.red,
                                ),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton(
                                onPressed: _loadReviews,
                                child: const Text('Retry'),
                              ),
                            ],
                          ),
                        )
                      : _reviews.isEmpty
                          ? Center(
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    Icons.rate_review_outlined,
                                    size: 64,
                                    color: AppColors.textSecondary.withValues(
                                        alpha: 0.5),
                                  ),
                                  const SizedBox(height: 16),
                                  Text(
                                    'No reviews yet',
                                    style: TextStyles.bodyMedium.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    'Be the first to review!',
                                    style: TextStyles.caption.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            )
                          : ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: _reviews.length,
                              itemBuilder: (context, index) {
                                final review = _reviews[index];
                                final rating = review['rating'] as int? ?? 
                                             (review['rating'] is num ? (review['rating'] as num).toInt() : 0);
                                final comment = review['comment'] as String? ?? '';
                                
                                // Handle patient data - can be populated object or just ID
                                String patientName = 'Anonymous';
                                if (review['patient'] != null) {
                                  if (review['patient'] is Map) {
                                    patientName = review['patient']['name'] as String? ?? 
                                                review['patient']['fullName'] as String? ?? 
                                                'Anonymous';
                                  } else if (review['patient'] is String) {
                                    patientName = 'Patient';
                                  }
                                }
                                
                                // Handle date - can be string or already parsed
                                DateTime? reviewDate;
                                final createdAt = review['createdAt'] as String?;
                                if (createdAt != null) {
                                  try {
                                    reviewDate = DateTime.parse(createdAt);
                                  } catch (e) {
                                    debugPrint('Error parsing date: $e');
                                  }
                                } else if (review['createdAt'] is Map) {
                                  // MongoDB date object
                                  try {
                                    final dateMap = review['createdAt'] as Map;
                                    if (dateMap.containsKey('\$date')) {
                                      final timestamp = dateMap['\$date'] as int?;
                                      if (timestamp != null) {
                                        reviewDate = DateTime.fromMillisecondsSinceEpoch(timestamp);
                                      }
                                    }
                                  } catch (e) {
                                    debugPrint('Error parsing MongoDB date: $e');
                                  }
                                }
                                
                                debugPrint('Review $index: rating=$rating, comment=${comment.isNotEmpty ? "yes" : "no"}, patient=$patientName');

                                return Card(
                                  margin: const EdgeInsets.only(bottom: 12),
                                  child: Padding(
                                    padding: const EdgeInsets.all(16),
                                    child: Column(
                                      crossAxisAlignment:
                                          CrossAxisAlignment.start,
                                      children: [
                                        Row(
                                          mainAxisAlignment:
                                              MainAxisAlignment.spaceBetween,
                                          children: [
                                            Expanded(
                                              child: Text(
                                                patientName,
                                                style: TextStyles.bodyMedium
                                                    .copyWith(
                                                  fontWeight: FontWeight.bold,
                                                ),
                                              ),
                                            ),
                                            Row(
                                              mainAxisSize: MainAxisSize.min,
                                              children: List.generate(5, (index) {
                                                return Icon(
                                                  index < rating
                                                      ? Icons.star
                                                      : Icons.star_border,
                                                  size: 16,
                                                  color: index < rating
                                                      ? Colors.amber
                                                      : Colors.grey,
                                                );
                                              }),
                                            ),
                                          ],
                                        ),
                                        if (reviewDate != null) ...[
                                          const SizedBox(height: 4),
                                          Text(
                                            DateFormat('MMM dd, yyyy')
                                                .format(reviewDate),
                                            style: TextStyles.caption.copyWith(
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                        ],
                                        if (comment.isNotEmpty) ...[
                                          const SizedBox(height: 12),
                                          Text(
                                            comment,
                                            style: TextStyles.bodySmall,
                                          ),
                                        ],
                                      ],
                                    ),
                                  ),
                                );
                              },
                            ),
            ),
          ],
        ),
      ),
    );
  }
}

