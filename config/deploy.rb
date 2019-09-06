require 'bundler/capistrano'
require 'rvm/capistrano'
require 'whenever/capistrano'

set :default_environment, {
  'GIT_SSH' => '/home/hnsearch/.ssh/hn_git_ssh.sh'
}

default_run_options[:pty] = true

# servers
server 'hnsearch-1.algolia.net', :app, :web, :db, :cron, primary: true
server 'hnsearch-2.algolia.net', :app, :web

# application
set :application, 'HNSearch'
set :deploy_to, '/var/www/hnsearch'
set :user, 'hnsearch'
set :use_sudo, false

# repository
set :local_repository, '.'
set :repository, 'git@github.com:algolia/hn-search.git'
set :scm, :git
set :deploy_via, :remote_cache
set :branch, 'master'
set :git_shallow_clone, 1

# keep 5 last releases
set :keep_releases, 5

set :node_version, 'v8.9.0'
set :yarn_version, '1.7.0'

task :install_javascript_dependencies do
  run "source /home/prod/.nvm/nvm.sh && nvm use #{node_version} && cd #{release_path} && yarn install"
end

after 'deploy:update', 'deploy:cleanup'

# configuration
desc 'Copy in server specific configuration files'
task :copy_shared do
  run "cp #{deploy_to}/shared/config/database.yml #{release_path}/config/"
  run "cp #{deploy_to}/shared/config/application.yml #{release_path}/config/"
  run "paxctl -C #{release_path}/wkhtmltoimage-amd64"
  run "paxctl -prmsx #{release_path}/wkhtmltoimage-amd64"
  run "mkdir -p #{deploy_to}/shared/node_modules"
  run "ln -sf #{deploy_to}/shared/node_modules #{release_path}/node_modules"
end
before 'bundle:install', 'copy_shared'

desc 'Restart Thin'
namespace :deploy do
  task :restart do
    run "cd #{current_path} bundle exec thin restart -C #{deploy_to}/shared/thin.yml"
  end
end

# ugly workaround for bug https://github.com/capistrano/capistrano/issues/81
before 'deploy:assets:precompile', 'install_javascript_dependencies'
before 'deploy:assets:precompile', 'bundle:install'
before 'deploy:assets:precompile', 'webpacker:compile'

# rvm
set :rvm_ruby_string, '2.6.2'

# cron
set :whenever_command, 'bundle exec whenever'
set :whenever_roles, [:cron]

# delayed job
after 'deploy:update', 'bluepill:quit', 'bluepill:start'
namespace :bluepill do
  desc 'Stop processes that bluepill is monitoring and quit bluepill'
  task :quit, roles: [:cron] do
    run "cd #{current_path} && ./bin/bluepill hnsearch --no-privileged stop"
    run "cd #{current_path} && ./bin/bluepill hnsearch --no-privileged quit"
  end

  desc 'Load bluepill configuration and start it'
  task :start, :roles => [:cron] do
    run "cd #{current_path} && ./bin/bluepill --no-privileged load /var/www/hnsearch/current/config/production.pill"
  end

  desc 'Prints bluepills monitored processes statuses'
  task :status, roles: [:cron] do
    run "cd #{current_path} && ./bin/bluepill hnsearch --no-privileged status"
  end
end
