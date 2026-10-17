# Ecommerce storefront version archive

This folder preserves storefront snapshot files that were removed from the active source tree.
The live implementation uses the `1` filename for each promoted snapshot family in
`web/src/modules/storefront`.

When preparing a new snapshot, keep the plain implementation files unchanged. Work in the next
numbered snapshot, then archive replaced snapshots here and promote the completed version to `1`.
Keep only the current `1` snapshot in the active source tree. This archive is for reference and is
not compiled as application source.

The archived copies retain their original Ecommerce source paths below `apps/ecommerce/web/src`.
