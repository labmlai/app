from labml_app.db import job

SAMPLE_SPECS_DICT = {'parameters': [], 'definitions': {}, 'response': {}}

sync_computer = {
    "parameters": [
        {
            "name": "computer_uuid",
            "in": "path",
            "type": "string",
            "required": "true",
            "description": "0c112ffda506f10f9f793c0fb6d9de4b43595d03",
        },
        {
            "name": "runs",
            "in": "body",
            "type": "list",
            "description": "Runs to be synced with the server",
            "example": ['0c112ffda506f10f9f793c0fb6d9de4b43595d03']
        },
        {
            "name": "jobs",
            "in": "body",
            "type": "list",
            "description": "Status of the jobs initiated by UI",
            "example": [{'uuid': '0c112ffda506f10f9f793c0fb6d9de4b43595d03', 'status': 'completed'},
                        {'uuid': '0c112ffda506f10f9f793c0fb6d9de4b43595d03', 'status': 'error'}]
        }
    ],
    "responses": {
        "200": {
            "description": "Synced server side run_uuid lists or list of pending active jobs",
            "schema": {
                'type': 'object',
                'properties': {
                    'runs': {
                        'type': 'object',
                        'example': {
                            'active': ['0c112ffda506f10f9f793c0fb6d9de4b43595d03'],
                            'deleted': ['0c112ffda506f10f9f793c0fb6d9de4b43595d03'],
                            'unknown': ['0c112ffda506f10f9f793c0fb6d9de4b43595d03']
                        }
                    },
                    'jobs': {
                        'type': 'list',
                        'example': [
                            {
                                'uuid': '0c112ffda506f10f9f793c0fb6d9de4b43595d03',
                                'status': job.JobStatuses.INITIATED,
                                'created_time': '16234567',
                                'completed_time': None,
                                'instruction': job.JobInstructions.START_TB,
                                'data': {'runs': ['0c112ffda506f10f9f793c0fb6d9de4b43595d03']}
                            }
                        ]
                    }
                }
            },
        }
    }
}

start_tensor_board = {
    "parameters": [
        {
            "name": "computer_uuid",
            "in": "path",
            "type": "string",
            "required": "true",
            "description": "0c112ffda506f10f9f793c0fb6d9de4b43595d03",
        },
        {
            "name": "runs",
            "in": "body",
            "type": "list",
            "description": "Set of runs to start TB. Note that all the runs should be from a same computer",
            "example": ['0c112ffda506f10f9f793c0fb6d9de4b43595d03']
        },
    ],
    "responses": {
        "200": {
            "description": "job details with the response",
            "schema": {
                'type': 'object',
                'properties': {
                    'job': {
                        'type': 'object',
                        'example':
                            {
                                'uuid': '0c112ffda506f10f9f793c0fb6d9de4b43595d03',
                                'status': job.JobStatuses.COMPLETED,
                                'created_time': '16234567',
                                'completed_time': '16234567',
                                'instruction': job.JobInstructions.START_TB
                            }
                    }
                }
            },
        }
    }
}

clear_checkpoints = {
    "parameters": [
        {
            "name": "computer_uuid",
            "in": "path",
            "type": "string",
            "required": "true",
            "description": "0c112ffda506f10f9f793c0fb6d9de4b43595d03",
        },
        {
            "name": "runs",
            "in": "body",
            "type": "list",
            "description": "Set of runs to clear checkpoints. Note that all the runs should be from same a computer",
            "example": ['0c112ffda506f10f9f793c0fb6d9de4b43595d03']
        },
    ],
    "responses": {
        "200": {
            "description": "job details with the response",
            "schema": {
                'type': 'object',
                'properties': {
                    'job': {
                        'type': 'object',
                        'example':
                            {
                                'uuid': '0c112ffda506f10f9f793c0fb6d9de4b43595d03',
                                'status': job.JobStatuses.ERROR,
                                'created_time': '16234567',
                                'completed_time': '16234567',
                                'instruction': job.JobInstructions.CLEAR_CP
                            }

                    }
                }
            },
        }
    }
}
