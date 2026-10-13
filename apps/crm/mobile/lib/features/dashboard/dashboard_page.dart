import 'package:flutter/material.dart';

import '../../core/api/crm_mobile_api.dart';
import '../../app/dashboard_navigation.dart';
import 'my_enquiries_page.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({
    super.key,
    required this.api,
    required this.session,
    required this.navigation,
    required this.onSignOut,
    this.onResetPin,
    this.onCheckForUpdate,
    this.onChangePassword,
    this.enableLiveNotifications = false,
  });

  final CrmMobileApi api;
  final UserSession session;
  final DashboardNavigation navigation;
  final VoidCallback onSignOut;
  final Future<void> Function()? onResetPin;
  final Future<void> Function()? onCheckForUpdate;
  final Future<void> Function()? onChangePassword;
  final bool enableLiveNotifications;

  @override
  Widget build(BuildContext context) =>
      MyEnquiriesPage(api: api, session: session, onSignOut: onSignOut);
}
