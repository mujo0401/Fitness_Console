from flask.sessions import SecureCookieSessionInterface
from flask import Flask

class CustomSessionInterface(SecureCookieSessionInterface):
    """Custom session interface that always preserves the session cookie."""
    def save_session(self, app, session, response):
        # Mark the session as modified to ensure it's saved
        session.modified = True
        return super(CustomSessionInterface, self).save_session(app, session, response)

def apply_session_fix(app: Flask):
    """Apply the session fix to the Flask app."""
    app.session_interface = CustomSessionInterface()