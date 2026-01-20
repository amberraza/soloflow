import logging

logger = logging.getLogger(__name__)

class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log request details (Force flush to stdout)
        import sys
        print(f"INCOMING REQUEST: {request.method} {request.path}", file=sys.stdout)
        # print(f"Headers: {request.headers}", file=sys.stdout) # Comment out to reduce noise if needed
        
        response = self.get_response(request)
        
        # Log response status
        print(f"RESPONSE STATUS: {response.status_code}", file=sys.stdout)
        sys.stdout.flush()
        return response
