.PHONY: help
.DEFAULT_GOAL := help

setup: ## install server and ui dependencies
	pip install pipenv
	sudo apt-get update
	sudo apt-get install npm
	npm install
	cd server && pipenv install --ignore-pipfile

server-dev: ## start and watch server
	cd server &&  pipenv run python -m labml_app.flask_app

server-prod: ## compile and start server in prod
	# pkill gunicorn
    # export PATH=~/miniconda/bin:$PATH
	cd server && pipenv install --ignore-pipfile && pipenv run gunicorn -c gunicorn.conf.py --bind 0.0.0.0:5000 labml_app.flask_app:app --daemon

compile: ## Compile JS
	rm -rf static
	mkdir -p static/js
	cp ui/src/index.html static/index.html
	cp -r ui/images static/

compile-prod: compile
	npm run build
	$(eval JS_CHECKSUM := $(shell md5sum static/js/bundle.min.js | cut -f 1 -d " "))
	$(eval CSS_CHECKSUM := $(shell md5sum static/css/style.css | cut -f 1 -d " "))
	sed -i '' 's/bundle.min.js/$(JS_CHECKSUM).min.js/g' static/index.html
	sed -i '' 's/bundle.min.js.map/$(JS_CHECKSUM).min.js.map/g' static/js/bundle.min.js
	sed -i '' 's/style.css/$(CSS_CHECKSUM).css/g' static/index.html
	mv static/js/bundle.min.js static/js/$(JS_CHECKSUM).min.js
	mv static/js/bundle.min.js.map static/js/$(JS_CHECKSUM).min.js.map
	mv static/css/style.css static/css/$(CSS_CHECKSUM).css
	mv static/css/style.css.map static/css/$(CSS_CHECKSUM).css.map


watch-ui: compile ## Compile and Watch JS & CSS
	npm run watch

build-ui: compile ## build production ui
	npm run build

package: build-ui ## Build PIPy Package
	rm -rf server/labml_app/static
	cp -r static/ server/labml_app/static
	cd server && python setup.py sdist bdist_wheel

check-package:  ## List contents of PIPy Package
	cd server && tar -tvf dist/*.tar.gz

help: ## Show this help.
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'



