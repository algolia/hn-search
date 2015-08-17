source 'https://rubygems.org'

ruby '2.1.2'

gem 'rails', '~> 4.0.10'
gem 'sass-rails', '~> 4.0.0'
gem 'uglifier', '>= 1.3.0'
gem 'jquery-rails'
gem 'jbuilder', '~> 1.2'
gem 'figaro'
gem 'haml-rails'
gem 'bitters'
gem 'bourbon'
gem 'neat'
gem 'therubyracer'
gem 'hogan_assets'
gem 'jquery-cookie-rails'
gem 'algoliasearch-rails', '~> 1.11.18'
gem 'aws-s3'
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
gem 'angularjs-rails', '1.3.9'
gem 'angular-rails-templates'
gem 'actionpack-action_caching'
gem 'turnout'

gem 'firebase'
gem "eventmachine", "~> 1.0.3"
gem "em-http-request", "~> 1.1.1"
gem "httparty", "~> 0.12.0"

group :development do
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
