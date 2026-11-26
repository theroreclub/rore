CREATE SCHEMA IF NOT EXISTS rore_private;
REVOKE ALL ON SCHEMA rore_private FROM PUBLIC;

CREATE TABLE rore_private.auth_attempt (
    bucket TEXT PRIMARY KEY,
    attempts INTEGER NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX auth_attempt_expiry ON rore_private.auth_attempt (expires_at);
REVOKE ALL ON rore_private.auth_attempt FROM PUBLIC;
