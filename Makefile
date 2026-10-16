include .env

.DEFAULT_GOAL := help
.PHONY: help init wait-for-db


PROJECT_FOLDER=/app
APP_EXEC=docker-compose exec app
POSTGRES_EXEC=docker-compose exec postgres

POSTGRES_CORE_SCHEMA_NAME=core
POSTGRES_MIGRATION_SCHEMA_NAME=migration

## General Tasks

help:
	@#grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'
	@grep -E '(^[a-zA-Z_-]+:.*?##.*$$)|(^##)' $(firstword $(MAKEFILE_LIST)) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m/'

#--------------------------------------------------- Mandatory Recipes -----------------------------------------------------#
# DO NOT RENAME NOR DELETE THESE RECIPES. THEY ARE MANDATORY TO LET THE MICROSERVICE WORKING CORRECTLY IN THE TSC ECOSYSTEM
# YOU CAN MODIFY THE IMPLEMENTATION. ALL CUSTOM RECIPES HAVE TO AFTER THIS BLOCK
#---------------------------------------------------------------------------------------------------------------------------#

# This command will bootstrap the application from the begining.
# Docker containers will be built, database with schemas will be created and database will be formatted.
# The main app should be started without any errors.
bootstrap: ## Bootstrap the application from the begining.
	docker-compose up -d
	make bootstrap-database -i
	make format-database
	docker-compose restart app
	docker logs -f core-app

format-database: ## Drop, recreate and seed the database.
	${APP_EXEC} yarn db:format

wait-for-db: ## Wait until postgres is ready to accept TCP connections.
	@until docker-compose exec -T postgres pg_isready -h localhost -U ${DATABASE_USER} -d postgres > /dev/null 2>&1; do \
		echo "Waiting for postgres..."; \
		sleep 1; \
	done
	@echo "Postgres is ready."

bootstrap-database: wait-for-db ## Bootstraps the database by creating required user and schemas. Run the command with -i flag to ignore conflct errors.
	${POSTGRES_EXEC} psql -U ${DATABASE_USER} -d postgres -c "create user ${DATABASE_USER} with encrypted password '${DATABASE_PASSWORD}'"
	${POSTGRES_EXEC} psql -U ${DATABASE_USER} -d postgres -c "create database ${DATABASE_NAME}"
	${POSTGRES_EXEC} psql -U ${DATABASE_USER} -d postgres -c "grant all privileges on database ${DATABASE_NAME} to ${DATABASE_USER}"
	${POSTGRES_EXEC} psql -d ${DATABASE_NAME} -U ${DATABASE_USER} -c "create schema if not exists ${POSTGRES_CORE_SCHEMA_NAME}"
	${POSTGRES_EXEC} psql -d ${DATABASE_NAME} -U ${DATABASE_USER} -c "grant all privileges on schema ${POSTGRES_CORE_SCHEMA_NAME} to ${DATABASE_USER}"
	${POSTGRES_EXEC} psql -d ${DATABASE_NAME} -U ${DATABASE_USER} -c "create schema if not exists ${POSTGRES_MIGRATION_SCHEMA_NAME};"
	${POSTGRES_EXEC} psql -d ${DATABASE_NAME} -U ${DATABASE_USER} -c "grant all privileges on schema ${POSTGRES_MIGRATION_SCHEMA_NAME} to ${DATABASE_USER};"

start: ## Start the already bootstraped system.
	docker-compose start

stop: ## Stop the already bootstraped system.
	docker-compose stop
#------------------------------- Custom Recipes -------------------------------#

## Docker connections

app-connection: ## Connect to the app docker container.
	${APP_EXEC} sh

postgres-connection: ## Connect to the postgres docker container.
	${POSTGRES_EXEC} /bin/bash