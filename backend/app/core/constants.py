from enum import StrEnum


class UserRole(StrEnum):
    ADMIN = "admin"
    USER = "user"


class AuthConstants:
    TOKEN_TYPE = "bearer"
