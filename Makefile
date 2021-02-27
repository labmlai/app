.PHONY: help
.DEFAULT_GOAL := help

setup: ## install server and ui dependencies
	pip install pipenv
	sudo apt-get update
	sudo apt-get install npm
	npm install --prefix ./ui
	cd server && pipenv install --ignore-pipfile

server-dev: ## start and watch server
	cd server &&  pipenv run python -m labml_app.flask_app

server-prod: ## compile and start server in prod
	# pkill gunicorn
    # export PATH=~/miniconda/bin:$PATH
	cd server && pipenv install --ignore-pipfile && pipenv run gunicorn -c gunicorn.conf.py --bind 0.0.0.0:5000 flask_app:app --daemon

compile: ## Compile JS
	rm -rf static
	mkdir -p static/js
	cp ui/src/index.html static/index.html
	cp -r ui/images static/
	npm run build

watch-ui: compile ## Watch and Compile JS
	npm run build
	npm run watch

build-ui: ## build production ui
	npm run build
#	npm install --prefix ./ui
#	npm run build --prefix ./ui

package: build-ui ## Build PIPy Package
	rm -rf server/labml_app/static
	cp -r static/ server/labml_app/static
	cd server && python setup.py sdist bdist_wheel

check-package:  ## List contents of PIPy Package
	cd server && tar -tvf dist/*.tar.gz

help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'



