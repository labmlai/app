from labml_app.db import job

SAMPLE_SPECS_DICT = {'parameters': [], 'definitions': {}, 'response': {}}

sync_computer = {
    "parameters": [
        {
            "name": "computer_uuid",
            "in": "body",
            "type": "string",
            "required": "true",
        }
    ],
}

sync_ui = {
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
            "name": "instruction",
            "in": "body",
            "type": "string",
            "description": "Instruction for the computer",
            "enum": job.INSTRUCTIONS,
            "example": job.INSTRUCTIONS[0]
        }
    ],
}
