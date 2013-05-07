configure({
    'hosts': [
        'mydomain.com'
    ],
    
    'aliases': [
        'www.mydomain.com'
    ],
    
    'pre-request middleware': [
        'methodOverride',
        'logger'
    ]
});

configure('development', {
    'hosts': [
        '127.0.0.1',
        'localhost',
    ],
    
    'pre-request middleware': {
        'profiler',
        'methodOverride',
        'logger'
    }
});