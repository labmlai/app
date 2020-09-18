.PHONY: help
.DEFAULT_GOAL := help

server-dev: ## start and watch server
	cd server &&  pipenv run python flask_app.py

server-prod: ## compile and start server in prod
	# pkill gunicorn
	cd server && pipenv install --ignore-pipfile && pipenv run gunicorn -c gunicorn.conf.py --bind 0.0.0.0:5000 flask_app:app --daemon

watch-ui: ## start and watch ui
	BROWSER=none npm start --prefix ./ui

build-ui: ## build production ui
	npm install --prefix ./ui
	npm run build --prefix ./ui

setup-prod: ## install server and ui dependencies
	pip install pipenv
	npm install --prefix ./ui

help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'
