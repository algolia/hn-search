source 'https://rubygems.org'

ruby '2.6.2'

gem 'actionpack-action_caching'
gem 'active_model_serializers', '~> 0.10.9'
gem 'activesupport', '~> 5.1.0'
gem 'algoliasearch-rails', '< 2'
gem 'aws-sdk', '~> 3.0'
gem 'bitters'
gem 'bluepill'
gem 'delayed_job_active_record'
gem 'em-http-request'
gem 'eventmachine'
gem 'figaro'
gem 'firebase', '0.2.2'
gem 'groupdate'
gem 'haml-rails'
gem 'httparty'
gem 'jbuilder'
gem 'open_uri_redirections'
gem 'rails', '~> 5.1.0'
gem 'rest-client'
gem 'simple-rss'
gem 'simple_enum', '~> 1.6.9'
gem 'statsd-ruby'
gem 'therubyracer'
gem 'thin'
gem 'turnout'
gem 'uglifier', '>= 1.3.0'
gem 'webpacker', '~> 4.x'
gem 'whenever'

group :development do
  gem 'ed25519'
  gem 'bcrypt_pbkdf', '>= 1.0', '< 2.0'
  gem 'better_errors'
  gem 'binding_of_caller', platforms: %i[mri_19 mri_20 mri_21 rbx]
  gem 'capistrano', '< 3.0.0'
  gem 'guard-bundler'
  gem 'guard-livereload', require: false
  gem 'guard-pow', require: false
  gem 'guard-rails'
  gem 'guard-rspec'
  gem 'html2haml'
  gem 'hub', require: nil
  gem 'rack-livereload'
  # for ed25519 keys
  gem 'rails_layout'
  gem 'rb-fchange', require: false
  gem 'rb-fsevent', require: false
  gem 'rb-inotify', require: false
  gem 'rbnacl', '>= 3.2', '< 5.0'
  gem 'rbnacl-libsodium'
  gem 'rvm-capistrano', require: false
  gem 'spring-commands-rspec'
  gem 'sqlite3', '~> 1.3.0'
  gem 'terminal-notifier-guard'
end
group :production do
  gem 'lograge'
  gem 'mysql2', '< 0.5'
  gem 'sentry-raven'
end
group :development, :test do
  gem 'factory_bot_rails'
end
group :test do
  gem 'minitest-spec-rails'
end
