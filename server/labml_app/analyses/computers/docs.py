zero_cpu = {
    "parameters": [
        {
            "name": "session_uuid",
            "in": "path",
            "type": "string",
            "required": "true",
            "description": "0c112ffda506f10f9f793c0fb6d9de4b43595d03",
        },
    ],
    "responses": {
        "200": {
            "description": "List of processes where mean of the cpu time series is < 1.0E-2",
            "schema": {
                'type': 'object',
                'properties': {
                    'series': {
                        'type': 'list',
                        'example': [
                            {
                                "cpu": {
                                    "mean": 1.8034270285684428e-07,
                                    "smoothed": [
                                        0.0,
                                        9.017135142842214e-06,
                                        0.0,
                                    ],
                                    "step": [
                                        1617821620.745544,
                                        1618666000.9863458,
                                        1618666061.0733404,
                                    ],
                                    "value": [
                                        0.0,
                                        9.017135142842214e-06,
                                        0.0,
                                    ]
                                },
                                "dead": 0,
                                "is_zero_cpu": True,
                                "name": "systemd",
                                "pid": 1.0,
                                "process_id": "process.0",
                                "rss": {
                                    "mean": 5222210.846486682,
                                    "smoothed": [
                                        5636096.0,
                                        5585678.3243341055,
                                        5206016.0,
                                    ],
                                    "step": [
                                        1617821620.745544,
                                        1618666000.9863458,
                                        1618666061.0733404,
                                    ],
                                    "value": [
                                        5636096.0,
                                        5585678.3243341055,
                                        5206016.0,
                                    ]
                                }
                            }
                        ]
                    },
                }
            },
        }
    }
}
