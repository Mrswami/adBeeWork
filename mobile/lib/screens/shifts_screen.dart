import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'dart:ui';

class ShiftsScreen extends StatefulWidget {
  const ShiftsScreen({super.key});

  @override
  State<ShiftsScreen> createState() => _ShiftsScreenState();
}

class _ShiftsScreenState extends State<ShiftsScreen> {
  bool _isSyncing = false;
  bool _isSynced = false;

  String _getSmartCategory(String title) {
    final t = title.toLowerCase();
    if (t.contains('membership') || t.contains('welcome') || t.contains('front')) return 'FRONT DESK';
    if (t.contains('meeting') || t.contains('staff')) return 'ADMIN/TEAM';
    if (t.contains('gym') || t.contains('floor')) return 'OPERATIONS';
    return 'UNIT SHIFT';
  }

  void _performSync() async {
    setState(() => _isSyncing = true);
    await Future.delayed(const Duration(seconds: 2)); // Simulate sync
    if (mounted) {
      setState(() {
        _isSyncing = false;
        _isSynced = true;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Hives Aligned! Google Calendar is up to date.'),
          backgroundColor: Color(0xFF10B981),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B1120),
      body: Stack(
        children: [
          // Background Gradient Orbs
          Positioned(
            top: -50,
            left: -50,
            child: Container(
              width: 250,
              height: 250,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFF6366F1).withOpacity(0.08),
              ),
            ),
          ).animate().fadeIn(duration: 2.seconds),

          SafeArea(
            child: CustomScrollView(
              physics: const BouncingScrollPhysics(),
              slivers: [
                SliverPadding(
                  padding: const EdgeInsets.all(24.0),
                  sliver: SliverToBoxAdapter(
                    child: _buildHeader(context),
                  ),
                ),
                if (!_isSynced)
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 8.0),
                      child: _buildSyncPrompter(),
                    ),
                  ),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  sliver: SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) => _buildShiftCard(context, index),
                      childCount: 5, // Placeholder for actual synced shifts
                    ),
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSyncPrompter() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF6366F1).withOpacity(0.05),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF6366F1).withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: const BoxDecoration(shape: BoxShape.circle),
            child: ClipOval(child: Image.asset('assets/assistant.png')),
          ),
          const SizedBox(width: 12),
          const Expanded(
            child: Text('CyberBee ready to align your hive.', 
              style: TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w500)),
          ),
          TextButton(
            onPressed: _isSyncing ? null : _performSync,
            child: Text(_isSyncing ? 'SYNCING...' : 'SYNC NOW', 
              style: const TextStyle(color: Color(0xFF818CF8), fontWeight: FontWeight.bold, fontSize: 12)),
          ),
        ],
      ),
    ).animate().fadeIn().slideY(begin: -0.1);
  }

  Widget _buildHeader(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                const Icon(Icons.calendar_month_rounded, color: Color(0xFF6366F1), size: 16),
                const SizedBox(width: 8),
                Text(
                  'WORKLOAD',
                  style: Theme.of(context).textTheme.labelLarge?.copyWith(
                    color: const Color(0xFF6366F1).withOpacity(0.8),
                    letterSpacing: 3,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
            _buildSyncBadge(),
          ],
        ).animate().fadeIn(duration: 800.ms).slideX(begin: -0.1),
        const SizedBox(height: 16),
        RichText(
          text: const TextSpan(
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: Colors.white),
            children: [
              TextSpan(text: 'Shift '),
              TextSpan(
                text: 'Intelligence',
                style: TextStyle(color: Color(0xFF6366F1)),
              ),
            ],
          ),
        ).animate().fadeIn(delay: 200.ms).slideY(begin: 0.2),
      ],
    );
  }

  Widget _buildSyncBadge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: (_isSynced ? const Color(0xFF10B981) : const Color(0xFF6366F1)).withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: (_isSynced ? const Color(0xFF10B981) : const Color(0xFF6366F1)).withOpacity(0.2)),
      ),
      child: Text(
        _isSynced ? 'ALL HIVES ALIGNED' : 'SYNC ACTIVE',
        style: TextStyle(color: _isSynced ? const Color(0xFF10B981) : const Color(0xFF6366F1), fontSize: 9, fontWeight: FontWeight.bold),
      ),
    );
  }

  Widget _buildShiftCard(BuildContext context, int index) {
    final shiftData = [
      {"title": "Membership - W", "time": "4:00 PM - 8:00 PM", "date": "MON, MAR 24"},
      {"title": "Welcome Center", "time": "8:00 AM - 12:00 PM", "date": "TUE, MAR 25"},
      {"title": "Membership - W", "time": "2:00 PM - 6:00 PM", "date": "WED, MAR 26"},
      {"title": "Staff Meeting", "time": "1:00 PM - 2:00 PM", "date": "THU, MAR 27"},
      {"title": "Gym Monitor", "time": "5:00 PM - 9:00 PM", "date": "FRI, MAR 28"},
    ];
    
    final shift = shiftData[index % shiftData.length];
    final category = _getSmartCategory(shift["title"]!);
    final isFrontDesk = category == 'FRONT DESK';
    
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.05)),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.white.withOpacity(0.05), Colors.white.withOpacity(0.02)],
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 4,
                    height: 50,
                    decoration: BoxDecoration(
                      color: isFrontDesk ? const Color(0xFF6366F1) : const Color(0xFFFF4D4D), 
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: (isFrontDesk ? const Color(0xFF6366F1) : const Color(0xFFFF4D4D)).withOpacity(0.1),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                category,
                                style: TextStyle(
                                  color: isFrontDesk ? const Color(0xFF818CF8) : const Color(0xFFFF4D4D),
                                  fontSize: 8,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1,
                                ),
                              ),
                            ),
                            Text(
                              shift["date"]!,
                              style: const TextStyle(color: Color(0xFF6366F1), fontSize: 10, fontWeight: FontWeight.w800),
                            ),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text(
                          shift["title"]!,
                          style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          shift["time"]!,
                          style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981), size: 20),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
