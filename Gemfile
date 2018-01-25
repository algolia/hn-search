source 'https://rubygems.org'

ruby '2.2.7'

gem 'rails', '~> 4.2.7'
gem 'sass-rails'
gem 'uglifier', '>= 1.3.0'
gem 'jquery-rails'
gem 'jbuilder', '~> 1.2'
gem 'figaro'
gem 'haml-rails'
gem 'bitters'
gem 'bourbon'
gem 'neat'
gem 'therubyracer', '0.12.2'
gem 'hogan_assets'
gem 'jquery-cookie-rails'
gem 'algoliasearch-rails', '~> 1.19.1'
gem 'aws-sdk', '~> 3.0'
gem 'open_uri_redirections'
gem 'simple_enum', '~> 1.6.9'
gem 'whenever'
gem 'thin'
gem 'rails-api'
gem 'active_model_serializers', '0.9.0.alpha1'
gem 'delayed_job_active_record'
gem 'bluepill', '~> 0.1.1'
gem 'groupdate', git: 'https://github.com/mieko/groupdate.git', branch: 'sqlite3'
gem 'simple-rss'
gem 'rest-client'
gem 'angularjs-rails', '1.5.8'
gem 'angular_xss'
gem 'angular-rails-templates'
gem 'actionpack-action_caching'
gem 'turnout'

gem 'firebase'
gem "eventmachine", "~> 1.0.8"
gem "em-http-request", "~> 1.1.2"
gem "httparty", "~> 0.13.5"
gem 'statsd-ruby'

group :development do
  # for ed25519 keys
  gem 'rbnacl', '>= 3.2', '< 5.0'
  gem 'rbnacl-libsodium'
  gem 'bcrypt_pbkdf', '>= 1.0', '< 2.0'

  gem 'capistrano', '< 3.0.0'
  gem 'rvm-capistrano', require: false
  gem 'sqlite3'
  gem 'better_errors'
  gem 'binding_of_caller', :platforms=>[:mri_19, :mri_20, :mri_21, :rbx]
  gem 'html2haml'
  gem 'quiet_assets'
  gem 'rails_layout'
  gem 'guard-bundler'
  gem 'guard-rails'
  gem 'guard-rspec'
  gem 'guard-pow', require: false
  gem 'hub', :require=>nil
  gem 'rb-fchange', :require=>false
  gem 'rb-fsevent', :require=>false
  gem 'rb-inotify', :require=>false
  gem 'spring-commands-rspec'
  gem 'guard-livereload',        :require => false
  gem 'rack-livereload'
  gem 'terminal-notifier-guard'
end
group :production do
  gem 'mysql2'
  gem "lograge"
end
group :development, :test do
  gem 'factory_girl_rails'
end
group :test do
  gem 'capybara'
  gem 'minitest-spec-rails'
  gem 'minitest-wscolor'
end
