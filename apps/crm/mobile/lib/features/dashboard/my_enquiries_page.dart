import 'package:flutter/material.dart';

import '../../core/api/crm_mobile_api.dart';
import 'dashboard_list_page.dart';
import 'home_enquiry_form_page.dart';
import 'job_enquiry_card.dart';

class MyEnquiriesPage extends StatefulWidget {
  const MyEnquiriesPage({
    required this.api,
    required this.session,
    this.onSignOut,
    super.key,
  });

  final CrmMobileApi api;
  final UserSession session;
  final VoidCallback? onSignOut;

  @override
  State<MyEnquiriesPage> createState() => _MyEnquiriesPageState();
}

class _MyEnquiriesPageState extends State<MyEnquiriesPage> {
  late Future<List<CrmJob>> _enquiries;
  late Future<CrmCallEnquiryFormData> _formData;
  var _listFilter = '';
  var _scope = _EnquiryScope.all;

  @override
  void initState() {
    super.initState();
    _enquiries = _load();
    _formData = _loadFormData();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text('Enquiries'),
      actions: [
        IconButton(
          tooltip: 'New enquiry',
          onPressed: _openNewEnquiry,
          icon: const Icon(Icons.add_rounded),
        ),
        FutureBuilder<CrmCallEnquiryFormData>(
          future: _formData,
          builder: (context, snapshot) => PopupMenuButton<String>(
            tooltip: 'Filter lists',
            enabled: snapshot.hasData,
            icon: Icon(
              _listFilter.isEmpty
                  ? Icons.filter_list_rounded
                  : Icons.filter_alt_rounded,
            ),
            onSelected: (value) => setState(() => _listFilter = value),
            itemBuilder: (context) => [
              const PopupMenuItem(value: '', child: Text('All lists')),
              ...?snapshot.data?.groups.map(
                (group) =>
                    PopupMenuItem(value: group.value, child: Text(group.label)),
              ),
            ],
          ),
        ),
        if (widget.onSignOut != null)
          PopupMenuButton<String>(
            tooltip: 'Account options',
            onSelected: (value) {
              if (value == 'sign-out') widget.onSignOut?.call();
            },
            itemBuilder: (context) => [
              PopupMenuItem<String>(
                enabled: false,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.session.profile.name),
                    Text(
                      widget.session.profile.email,
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(value: 'sign-out', child: Text('Sign out')),
            ],
          ),
      ],
    ),
    body: Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
          child: SegmentedButton<_EnquiryScope>(
            segments: const [
              ButtonSegment(value: _EnquiryScope.all, label: Text('All')),
              ButtonSegment(
                value: _EnquiryScope.assigned,
                label: Text('Assigned'),
              ),
              ButtonSegment(
                value: _EnquiryScope.created,
                label: Text('Created'),
              ),
            ],
            selected: {_scope},
            onSelectionChanged: (selection) {
              setState(() {
                _scope = selection.first;
                _enquiries = _load();
              });
            },
          ),
        ),
        Expanded(
          child: FutureBuilder<List<CrmJob>>(
            future: _enquiries,
            builder: (context, snapshot) {
              if (snapshot.connectionState != ConnectionState.done) {
                return const Center(child: CircularProgressIndicator());
              }
              if (snapshot.hasError) return _LoadError(onRetry: _refresh);
              final allEnquiries = snapshot.data ?? const <CrmJob>[];
              final enquiries = _filter(allEnquiries);
              if (enquiries.isEmpty) {
                return Center(
                  child: Text(
                    allEnquiries.isEmpty
                        ? 'No enquiries found.'
                        : 'No enquiries are in this list.',
                  ),
                );
              }
              return RefreshIndicator(
                onRefresh: _refresh,
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
                  itemCount: enquiries.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 14),
                  itemBuilder: (context, index) => JobEnquiryCard(
                    api: widget.api,
                    session: widget.session,
                    enquiry: DashboardListItem.fromCrmJob(enquiries[index]),
                    job: enquiries[index],
                    onJobChanged: _refresh,
                  ),
                ),
              );
            },
          ),
        ),
      ],
    ),
  );

  Future<List<CrmJob>> _load() async {
    final token = widget.session.accessToken;
    switch (_scope) {
      case _EnquiryScope.assigned:
        return widget.api.assignedJobs(token);
      case _EnquiryScope.created:
        return widget.api.createdEnquiries(token);
      case _EnquiryScope.all:
        final lists = await Future.wait([
          widget.api.assignedJobs(token),
          widget.api.createdEnquiries(token),
        ]);
        final byId = <String, CrmJob>{};
        for (final enquiry in lists.expand((items) => items)) {
          byId.putIfAbsent(enquiry.sourceId, () => enquiry);
        }
        return byId.values.toList()
          ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    }
  }

  Future<CrmCallEnquiryFormData> _loadFormData() =>
      widget.api.callEnquiryFormData(widget.session.accessToken);

  Future<void> _refresh() async {
    final enquiries = _load();
    setState(() {
      _enquiries = enquiries;
    });
    await enquiries;
  }

  List<CrmJob> _filter(List<CrmJob> enquiries) {
    if (_listFilter.isEmpty) return enquiries;
    return enquiries
        .where(
          (enquiry) =>
              enquiry.list.trim().toLowerCase() == _listFilter.toLowerCase(),
        )
        .toList();
  }

  Future<void> _openNewEnquiry() async {
    final created = await Navigator.of(context).push<CrmJob>(
      MaterialPageRoute(
        builder: (context) =>
            HomeEnquiryFormPage(api: widget.api, session: widget.session),
      ),
    );
    if (created != null && mounted) await _refresh();
  }
}

enum _EnquiryScope { all, assigned, created }

class _LoadError extends StatelessWidget {
  const _LoadError({required this.onRetry});

  final Future<void> Function() onRetry;

  @override
  Widget build(BuildContext context) => Center(
    child: FilledButton.tonal(
      onPressed: onRetry,
      child: const Text('Could not load your enquiries. Retry'),
    ),
  );
}
