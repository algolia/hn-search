require 'bundler/capistrano'
require 'rvm/capistrano'
require 'whenever/capistrano'

set :default_environment, {
  'GIT_SSH' => '/home/hnsearch/.ssh/hn_git_ssh.sh'
}

default_run_options[:pty] = true

# servers
server 'hn-search-1.algolia.net', :app, :web, :db, :cron, primary: true
server 'hn-search-2.algolia.net', :app, :web

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

set :node_version, '10.16.3'
set :yarn_version, '1.7.0'

after 'deploy:update', 'deploy:cleanup'

# configuration
desc 'Copy in server specific configuration files'
task :copy_shared do
  run "cp #{deploy_to}/shared/config/database.yml #{release_path}/config/"
  run "cp #{deploy_to}/shared/config/application.yml #{release_path}/config/"
  run "paxctl -C #{release_path}/wkhtmltoimage-amd64"
  run "paxctl -prmsx #{release_path}/wkhtmltoimage-amd64"
end
before 'bundle:install', 'copy_shared'

desc 'Restart Thin'
namespace :deploy do
  task :restart do
    run "cd #{current_path} && bundle exec thin restart -C #{deploy_to}/shared/thin.yml"
  end
end

namespace :deploy do
  namespace :assets do
    task :precompile do
      run "source /home/hnsearch/.nvm/nvm.sh && nvm use #{node_version} && cd #{release_path} && yarn install --silent"
      run "source /home/hnsearch/.nvm/nvm.sh && nvm use #{node_version} && cd #{release_path} && RAILS_ENV=production NODE_ENV=production RAILS_GROUPS=assets bundle exec rake assets:precompile"
    end
  end
end

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
  task :start, roles: [:cron] do
    run "cd #{current_path} && ./bin/bluepill --no-privileged load /var/www/hnsearch/current/config/production.pill"
  end

  desc 'Prints bluepills monitored processes statuses'
  task :status, roles: [:cron] do
    run "cd #{current_path} && ./bin/bluepill hnsearch --no-privileged status"
  end
end
