# CRM mobile

This Flutter client belongs to the CRM app and uses the CXSUN Platform API. The client name, API address, Android application ID, and logo are build inputs, so the same source can be branded for each customer.

Run from the repository root with Flutter installed:

```powershell
npm run crm:mobile:run -- --client-name="Example Client" --api-url=http://127.0.0.1:7010 --application-id=in.example.crm
```

Create a client-named APK with the same settings. Release APKs include the repository version in their filename:

```powershell
npm run crm:mobile:apk:release -- --client-name="Example Client" --api-url=https://crm.example.com --application-id=in.example.crm
```

Optional build inputs are `--corporate-id=CLIENTCODE`, `--logo-asset=assets/crm-logo.png`, and `--android-brand-asset=crm`. The API URL is the API base URL, without an app-specific `/crm` path. Configure the API base URL and client name for each customer. The app supports Android branding and currently uses a generic `CRM Mobile` iOS display name.

The CRM screens use existing enquiry APIs for assigned and created enquiries, details, comments, work jobs, activity, and enquiry creation. Notifications, chat, HR duties, and device call-log registration are hidden because the CXSUN CRM API does not provide those CRM routes.
