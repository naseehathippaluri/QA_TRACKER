from common.permissions import IsAdminUser

# Project write (POST, PUT, DELETE) is Admin only
IsProjectAdmin = IsAdminUser
