import logging

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request details
        logger.info(f"INCOMING REQUEST: {request.method} {request.path}")
        logger.info(f"Headers: {request.headers}")
        
        response = self.get_response(request)
        
        # Log response status
        logger.info(f"RESPONSE STATUS: {response.status_code}")
        return response
