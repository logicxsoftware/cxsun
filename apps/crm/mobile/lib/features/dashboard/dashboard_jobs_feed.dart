import 'dart:async';

import 'package:flutter/widgets.dart';

import '../../core/api/crm_mobile_api.dart';

/// Keeps the Home and Jobs screens on the same fresh CRM snapshot.
///
/// This is view state only. CRM remains the source of truth and all mutations
/// still go through the platform API.
class DashboardJobsFeed extends ChangeNotifier with WidgetsBindingObserver {
  DashboardJobsFeed({required this.api, required this.session}) {
    WidgetsBinding.instance.addObserver(this);
  }

  static const _refreshInterval = Duration(seconds: 12);

  final CrmMobileApi api;
  final UserSession session;
  final List<CrmJob> _jobs = [];
  Timer? _timer;
  bool _isLoading = true;
  bool _isRefreshing = false;
  String? _error;

  List<CrmJob> get jobs => List.unmodifiable(_jobs);
  bool get isLoading => _isLoading;
  String? get error => _error;

  void start() {
    _startPolling();
    unawaited(refresh());
  }

  Future<void> refresh() async {
    if (_isRefreshing) return;
    _isRefreshing = true;
    try {
      final updated = await _loadEnquiries();
      _jobs
        ..clear()
        ..addAll(updated);
      _error = null;
    } on Object catch (error) {
      _error = error is CrmMobileApiException
          ? error.message
          : 'Could not refresh live dashboard data.';
    } finally {
      _isLoading = false;
      _isRefreshing = false;
      notifyListeners();
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _startPolling();
      unawaited(refresh());
      return;
    }
    if (state == AppLifecycleState.paused ||
        state == AppLifecycleState.detached) {
      _timer?.cancel();
      _timer = null;
    }
  }

  void _startPolling() {
    _timer ??= Timer.periodic(_refreshInterval, (_) => unawaited(refresh()));
  }

  Future<List<CrmJob>> _loadEnquiries() async {
    try {
      return await api.enquiries(
        accessToken: session.accessToken,
        scope: 'all',
      );
    } on CrmMobileApiException {
      final lists = await Future.wait([
        api.assignedJobs(session.accessToken),
        api.createdEnquiries(session.accessToken),
      ]);
      final byId = <String, CrmJob>{};
      for (final enquiry in lists.expand((items) => items)) {
        byId.putIfAbsent(enquiry.sourceId, () => enquiry);
      }
      return byId.values.toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _timer?.cancel();
    super.dispose();
  }
}
