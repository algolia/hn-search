source 'https://rubygems.org'

ruby '2.6.2'

gem 'active_model_serializers', '~> 0.10.9'
gem 'algoliasearch-rails', '~> 1.20.6'
gem 'actionpack-action_caching'
gem 'activesupport', '~> 5.1.0'
gem 'aws-sdk', '~> 3.0'
gem 'bluepill'
gem 'bitters'
gem 'delayed_job_active_record'
gem 'eventmachine'
gem 'em-http-request'
gem 'firebase', '0.2.2'
gem 'figaro'
gem 'jbuilder'
gem 'open_uri_redirections'
gem 'groupdate'
gem 'rails', '~> 5.1.0'
gem 'rest-client'
gem 'simple-rss'
gem 'simple_enum', '~> 1.6.9'
gem 'thin'
gem 'therubyracer'
gem 'turnout'
gem 'uglifier', '>= 1.3.0'
gem 'whenever'
gem 'haml-rails'
gem 'httparty'
gem 'statsd-ruby'
gem 'webpacker', '~> 4.x'

group :development do
  # for ed25519 keys
  gem 'rbnacl', '>= 3.2', '< 5.0'
  gem 'rbnacl-libsodium'
  gem 'bcrypt_pbkdf', '>= 1.0', '< 2.0'
  gem 'capistrano', '< 3.0.0'
  gem 'rvm-capistrano', require: false
  gem 'sqlite3', '~> 1.3.0'
  gem 'better_errors'
  gem 'binding_of_caller', platforms: %i[mri_19 mri_20 mri_21 rbx]
  gem 'html2haml'
  gem 'rails_layout'
  gem 'guard-bundler'
  gem 'guard-rails'
  gem 'guard-rspec'
  gem 'guard-pow', require: false
  gem 'hub', require: nil
  gem 'rb-fchange', require: false
  gem 'rb-fsevent', require: false
  gem 'rb-inotify', require: false
  gem 'spring-commands-rspec'
  gem 'guard-livereload', require: false
  gem 'rack-livereload'
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
