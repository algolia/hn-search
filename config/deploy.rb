require "bundler/capistrano"

set :default_environment, {
  'GIT_SSH' => '/home/prod/ssh-hnsearch.sh'
}

default_run_options[:pty] = true 

# servers
server 'c3-use-1.algolia.io', :app, :web, :db, :cron, primary: true
server 'c3-use-2.algolia.io', :app, :web
server 'c3-use-3.algolia.io', :app, :web

# application
set :application, "HNSearch"
set :deploy_to, "/var/www/hnsearch"
set :user, "prod"
set :use_sudo, false

# repository
set :local_repository, "."
set :repository, "git@github.com:algolia/hn-search.git"
set :scm, :git
set :deploy_via, :remote_cache
set :branch, "master"
set :git_shallow_clone, 1

# keep 5 last releases
set :keep_releases, 5
after "deploy:update", "deploy:cleanup"

# configuration
desc "Copy in server specific configuration files" 
task :copy_shared do
  run "cp #{deploy_to}/shared/config/database.yml #{release_path}/config/"
  run "cp #{deploy_to}/shared/config/application.yml #{release_path}/config/"
  run "paxctl -C #{release_path}/wkhtmltoimage-amd64"
  run "paxctl -prmsx #{release_path}/wkhtmltoimage-amd64"
end
before "bundle:install", "copy_shared"

desc "Restart Thin"
namespace :deploy do
  task :restart do
    run "cd #{current_path} && bundle exec thin restart -C #{deploy_to}/shared/thin.yml"
  end
end

# ugly workaround for bug https://github.com/capistrano/capistrano/issues/81
before "deploy:assets:precompile", "bundle:install"

# rvm
require "rvm/capistrano"
set :rvm_ruby_string, 'ruby-2.0.0-p353'

# cron
set :whenever_command, "bundle exec whenever"
set :whenever_roles, [:cron]
require "whenever/capistrano"

# delayed job
require "delayed/recipes"
set :rails_env, "production"
set :delayed_job_server_role, :cron
set :delayed_job_command, 'bin/delayed_job'
set :delayed_job_args, "-n 16"
after "deploy:stop",    "delayed_job:stop"
after "deploy:start",   "delayed_job:start"
after "deploy:restart", "delayed_job:restart"
