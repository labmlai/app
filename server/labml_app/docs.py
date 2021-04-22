from labml_app.db import job

SAMPLE_SPECS_DICT = {'parameters': [], 'definitions': {}, 'response': {}}

sync_computer = {
    "parameters": [
        {
            "name": "computer_uuid",
            "in": "path",
            "type": "string",
            "required": "true",
            "description": "computer_uuid value of the machine",
            "example": "0c112ffda506f10f9f793c0fb6d9de4b43595d03"
        },
        {
            "name": "runs",
            "in": "body",
            "type": "list",
            "description": "Runs to be synced with the server",
            "example": ['0c112ffda506f10f9f793c0fb6d9de4b43595d03']
        },
        {
            "name": "job_responses",
            "in": "body",
            "type": "list",
            "description": "Status of the jobs initiated by UI",
            "example": [{'job_uuid': '0c112ffda506f10f9f793c0fb6d9de4b43595d03', 'status': 'completed'},
                        {'job_uuid': '0c112ffda506f10f9f793c0fb6d9de4b43595d03', 'status': 'error'}]
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
                    'active_jobs': {
                        'type': 'list',
                        'example': [
                            {
                                'job_uuid': '0c112ffda506f10f9f793c0fb6d9de4b43595d03',
                                'status': job.JobStatuses.COMPLETED,
                                'created_time': '16234567',
                                'completed_time': '16234567',
                                'instruction': 'start_tensor_board'
                            }
                        ]
                    }
                }
            },
        }
    }
}

sync_ui = {
    "parameters": [
        {
            "name": "computer_uuid",
            "in": "path",
            "type": "string",
            "required": "true",
            "description": "computer_uuid value of the computer",
            "example": "0c112ffda506f10f9f793c0fb6d9de4b43595d03"
        },
        {
            "name": "instruction",
            "in": "body",
            "type": "string",
            "description": "Instruction for the computer",
            "enum": [job.JobInstructions.START_TB],
            "example": job.JobInstructions.START_TB
        },
        {
            "name": "job_uuid",
            "in": "body",
            "type": "string",
            "description": "job_uuid value of the job quarried",
            "example": "0c112ffda506f10f9f793c0fb6d9de4b43595d03"
        }
    ],

    "responses": {
        "200": {
            "description": "Details of created or quarried job_uuid",
            "schema": {
                'type': 'object',
                'properties': {
                    'instruction': {
                        'type': 'string',
                        'example': "start_tensor_board"
                    },
                    'status': {
                        'type': 'string',
                        'example': job.JobStatuses.COMPLETED,
                    },
                    'created_time': {
                        'type': 'float',
                        'example': '16234567',
                    },
                    'completed_time': {
                        'type': 'float',
                        'example': '16234567',
                    },
                    'job_uuid': {
                        'type': 'string',
                        'example': "0c112ffda506f10f9f793c0fb6d9de4b43595d03"
                    },
                }
            },
        }
    }
}
