.PHONY: help
.DEFAULT_GOAL := help

setup: ## install server and ui dependencies
	pip install pipenv
	sudo apt-get update
	sudo apt-get install npm
	npm install --prefix ./ui
	cd server && pipenv install --ignore-pipfile

server-dev: ## start and watch server
	cd server &&  pipenv run python flask_app.py

server-prod: ## compile and start server in prod
	# pkill gunicorn
    # export PATH=~/miniconda/bin:$PATH
	cd server && pipenv install --ignore-pipfile && pipenv run gunicorn -c gunicorn.conf.py --bind 0.0.0.0:5000 flask_app:app --daemon

watch-ui: ## start and watch ui
	BROWSER=none npm start --prefix ./ui

build-ui: ## build production ui
	npm install --prefix ./ui
	npm run build --prefix ./ui

help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'


