---
title: Introducing Laravel 11
nav_order: 8
parent: Programming in PHP
---

# Introducing Laravel 11

This overview is based on a Task List project, see [here](https://github.com/jfspps/laravel_task_list).

For official docs on setting up the project, see [here](https://laravel.com/docs/11.x/installation#creating-a-laravel-project).

## PHP.ini

PHP startup configuration is defined in php.ini.

```
$ php --ini
```

## PHP extensions

You may need to enable the PHP curl and dom (via xml) extensions. Use:

```bash
sudo apt install php-curl
```

```bash
sudo apt install php-xml
```

...and then restart Apache:

```bash
sudo service apache2 restart
```

Check the PHP modules ```curl``` and ```dom``` are installed with:

```bash
php -m
```

## NPM

The project utilises Node. Install Node and Node Package Manager from
[here](https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-22-04):

```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.13.0".
nvm current # Should print "v22.13.0".

# Verify npm version:

npm -v # Should print "10.9.2".
```

Remove the ```node_modules``` directory if it exists, and then rebuild it with:

```bash
npm install
```

A number of run scripts are defined [here](package.json), run:

```bash
npm run dev
```

## SQLite

Laravel 11 target SQLite by default as its database, see ```DB_CONNECTION``` in the environment variable file (.env). This file is not normally
shared with other developers.

Install SQLite extension with

```bash
sudo apt install php-sqlite3
```

(use e.g. ```sudo apt install php8.3-sqlite3``` for a specific version)

To enable the SQLite driver, uncomment (remove the semicolon) from the following line in php.ini:

```
;extension=sqlite3
```

The database tables are found in the project subdirectory `/database`, resulting from 
[migration](https://laravel.com/docs/11.x/installation#databases-and-migrations) (version control for databases,
enabling developers to define and share the application's schema). Typically, run a database migration when creating or
updating a database schema.

To migrate a database (needed if one were to use a database other than SQLite), enter:

```bash
php artisan migrate
```

With SQLite, this command will generate a SQLite database file: `/database/database.sqlite`.

It is normally good practice to create a different schema for each Laravel project, so each project will involve at
least one database migration before startup.

## The Application key

The Laravel App key is defined in .env under APP_KEY and must be initialised with

```bash
php artisan key:generate
```

The key is used to encrypt/decrypt data and generate unique authentication tokens that are part of securing protected 
resources.

## Laravel version check and running the server

Check the Laravel framework version (currently set to v11.38. in `composer.json`) with:

```bash
php artisan --version
```

With all the above set up, run a server from localhost with e.g. port 9000:

```bash
php artisan serve --port=9000 
```

Opening this in a browser will yield a Laravel dashboard.

Close the server (Ubuntu) with CTRL-C.

## Overview of the Laravel directory structure

+ `/app` - bespoke logic
+ `/bootstrap` - application function definitions
+ `/config` - base Laravel configuration (often referring to [.env](.env))
+ `/database` - all things database, including SQLite files
+ `/node_modules` - NodeJS dependencies
+ `/public` - files that would be publicly accessible after deployment (e.g. Apache configuration)
+ `/resources` - project assets, including JS scripts and Blade web templates (see [here](/resources/views))
+ `/routes` - URL routing
+ `/storage` - Laravel storage and cache
+ `/tests` - automated test files
+ `/vendor` - Composer managed files for Laravel and the project dependencies

Other Laravel project files in the root directory of note:

+ `.editorconfig` - development configuration typically handling developer tool conventions
+ `.env` - environment variables, developer specific configuration, sometimes sensitive info and not normally 
  shared with other developers
+ `.env.example` - template of .env, this file may contain standards/conventions/defaults that other 
  developers should follow with their own env., and therefore is distributed with the project
+ `artisan` - this is a PHP script typically run during development with ```php artisan```
+ `composer.json` and `composer.lock` - project libraries/dependencies handled by Composer
  (and saved in `/vendor`)
+ `package.json` and `package.lock` - frontend-specific libraries/dependencies
+ `phpunit.xml` - PHP unit testing configuration

There will also be JS scripts that manage [Vite](https://vite.dev/) (Vue based frontend tools), [Tailwind](https://tailwindcss.com/) 
and [PostCSS](https://postcss.org/) (the latter two are CSS tools) in the root directory.

## Database models

Database models (classes that can be mapped as tables via [Eloquent ORM](https://laravel.com/docs/11.x/eloquent)) are 
defined in the `/app/Models` directory. One can create a new model with:

```bash
php artisan make:model TableName -m
```

The ```-m``` flag also performs a database migration after creating the PHP class. The normal convention is to define 
the singular class, and Laravel will build the table name as the plural, and apply a lowercase to the first character.

```
php artisan make:model Task -m
```

The above model will then be represented by the table ```tasks```, and recorded in the migrations directory 
(see `/database/migrations`).


## Creating fake entities 

Fake entities can be committed to the database using `/database/factories`. The range of data created includes
timestamps, fake email addresses and tokens, to name a few.

Factories can also be used to update one or attributes of an entity to simulate certain conditions e.g. nullify a 
state marker (isProcessed, isEnabled).

Create a factory (for the Task entity) with:

```bash
php artisan make:factory TaskFactory --model=Task
```

The factory methods can then be called from `/database/seeders` which call a factory one or more times, making
modifications to the database. 

Generally only one Seeder is defined and called per project. Simply add factories to the seeder and then run

```bash
php artisan db:seed
```

This would add to the database.

To clear the database (care not run this in production) and start over with newer entities, run:

```bash
php artisan migrate:refresh --seed
```

## Database queries

Laravel will recognise field names and types from the database, the aforementioned Model "Task" does not need to be
implemented with class members. When performing queries, the entities are of type [Collection](https://laravel.com/docs/11.x/eloquent-collections).

The [Query Builder](https://laravel.com/docs/11.x/queries) documents all the SQL like phrases available to Laravel.

## Form Requests

These classes define authorisation and validation of HTTP requests and are located in `/app/Http/Requests`.
They can be initialised as follows for Task entities:

```bash
$ php artisan make:request TaskRequest
```

# CSS

This project uses [Tailwind CSS](https://tailwindcss.com/)

# JS

This project uses a lightweight JS framework: [AlpineJS](https://alpinejs.dev/)
