from common.permissions import IsAdminUser, IsOwnerOrAdmin

# Report: QA can CRUD own; Admin can CRUD any
ReportIsOwnerOrAdmin = IsOwnerOrAdmin
ReportIsAdmin = IsAdminUser
